import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getUserDeckProgress, getUserBestScores } from '@/lib/cached-queries'

/**
 * GET /api/home/user-data
 * Trả về điểm thi cao nhất và tiến độ flashcard của user hiện tại.
 * Được gọi từ client side để không block cache trang chủ.
 */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ bestScores: {}, userDeckProgress: {} })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ bestScores: {}, userDeckProgress: {} })
  }

  // Lấy danh sách exam IDs đang hiển thị trên trang chủ
  const exams = await prisma.exam.findMany({
    where: { isPublish: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  const examIds = exams.map((e) => e.id)

  const [userDeckProgress, bestScores] = await Promise.all([
    getUserDeckProgress(user.id),
    getUserBestScores(user.id, examIds),
  ])

  return NextResponse.json({ bestScores, userDeckProgress })
}
