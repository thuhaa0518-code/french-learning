import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'
import { computeDiemSo } from '@/lib/exam-grader'
import { SubmitAnswersSchema } from '@/lib/validations/exam'

type Params = { params: Promise<{ id: string }> }

// GET /api/luot-lam/[id]/nop (For debugging)
export async function GET(req: NextRequest) {
  return NextResponse.json({ hello: 'world' })
}

// POST /api/luot-lam/[id]/nop — Student: nộp bài + chấm điểm server-side
export async function POST(req: NextRequest, { params }: Params) {
  let user
  try {
    user = await requireAuth()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    return err('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { id: attemptId } = await params

  try {
    const body = await req.json()
    const parsed = SubmitAnswersSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    // Kiểm tra attempt tồn tại
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.userId !== user.id) {
      return err('NOT_FOUND', 'Lượt làm bài không tồn tại', 404)
    }

    // Kiểm tra đã nộp chưa
    if (attempt.daNop) {
      return err('CONFLICT', 'Bài thi đã được nộp', 409)
    }

    // Lấy questions + đáp án đúng từ DB (server-side only — có laDapAnDung)
    const questions = await prisma.question.findMany({
      where: { examId: attempt.examId },
      include: {
        answers: {
          select: { id: true, noiDung: true, laDapAnDung: true },
        },
      },
      orderBy: { thuTu: 'asc' },
    })

    const { cauTraLoi } = parsed.data

    // Chấm điểm từng câu
    let correctCount = 0
    const chiTiet = questions.map((question) => {
      const correctAnswer = question.answers.find((a) => a.laDapAnDung)
      const studentAnswer = cauTraLoi.find((c) => c.questionId === question.id)
      const laDung = !!(studentAnswer?.noiDung && correctAnswer && studentAnswer.noiDung === correctAnswer.id)

      if (laDung) correctCount++

      return {
        question_id: question.id,
        la_dung: laDung,
        dap_an_dung: correctAnswer?.noiDung ?? '',
        cau_tra_loi: studentAnswer?.noiDung ?? null,
      }
    })

    const diemSo = computeDiemSo(correctCount, questions.length)

    // Lưu kết quả trong transaction
    await prisma.$transaction(async (tx) => {
      // Batch insert attempt_answers
      await tx.attemptAnswer.createMany({
        data: questions.map((question) => {
          const detail = chiTiet.find((c) => c.question_id === question.id)!
          return {
            attemptId,
            questionId: question.id,
            cauTraLoi: detail.cau_tra_loi,
            laDung: detail.la_dung,
            diemDatDuoc: detail.la_dung ? 1 : 0,
          }
        }),
      })

      // Update exam attempt
      await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          diemSo,
          daNop: true,
          thoiGianNop: new Date(),
          daDo: true,
        },
      })
    })

    return ok({ diem_so: diemSo, chi_tiet: chiTiet })
  } catch (error) {
    console.error('[POST /api/luot-lam/[id]/nop]', error)
    return err('INTERNAL_ERROR', 'Không thể nộp bài', 500)
  }
}
