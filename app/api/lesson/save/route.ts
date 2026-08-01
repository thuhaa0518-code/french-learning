import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { lessonId } = await req.json()

    if (!lessonId) {
      return err('BAD_REQUEST', 'Missing lessonId', 400)
    }

    const existing: any[] = await prisma.$queryRaw`SELECT id FROM saved_lessons WHERE user_id = ${user.id} AND lesson_id = ${lessonId} LIMIT 1`

    if (existing && existing.length > 0) {
      // Unsave
      await prisma.$executeRaw`DELETE FROM saved_lessons WHERE id = ${existing[0].id}`
      return ok({ saved: false })
    } else {
      // Save
      const newId = crypto.randomUUID()
      await prisma.$executeRaw`INSERT INTO saved_lessons (id, user_id, lesson_id, created_at) VALUES (${newId}, ${user.id}, ${lessonId}, NOW())`
      return ok({ saved: true })
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    console.error('[POST /api/lesson/save]', error)
    return err('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
