import { prisma } from '@/lib/prisma'
import UserListClient from '@/components/admin/UserListClient'
import Pagination from '@/components/shared/Pagination'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminNguoiDungPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; vai_tro?: string; page?: string; selected?: string }>
}) {
  const { search, vai_tro, page: pageStr, selected } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))

  const where = {
    ...(vai_tro ? { vaiTro: vai_tro } : {}),
    ...(search
      ? {
          OR: [
            { tenHienThi: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, tenHienThi: true, vaiTro: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ])

  // Lấy chi tiết user được chọn
  let selectedUser: {
    id: string
    email: string
    tenHienThi: string
    vaiTro: string
    _count: { lessonProgresses: number; examAttempts: number; flashcardStates: number }
    lessonProgresses: { daHoanThanh: boolean }[]
    examAttempts: { diemSo: number | null; daNop: boolean }[]
  } | null = null

  if (selected) {
    selectedUser = await prisma.user.findUnique({
      where: { id: selected },
      select: {
        id: true,
        email: true,
        tenHienThi: true,
        vaiTro: true,
        _count: {
          select: {
            lessonProgresses: true,
            examAttempts: true,
            flashcardStates: true,
          },
        },
        lessonProgresses: { select: { daHoanThanh: true } },
        examAttempts: {
          where: { daNop: true },
          select: { diemSo: true, daNop: true },
        },
      },
    })
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Tính điểm TB
  const avgScore =
    selectedUser && selectedUser.examAttempts.length > 0
      ? (
          selectedUser.examAttempts.reduce((s, a) => s + (a.diemSo ?? 0), 0) /
          selectedUser.examAttempts.length
        ).toFixed(0)
      : null

  const completedLessons = selectedUser?.lessonProgresses.filter((p) => p.daHoanThanh).length ?? 0

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="mb-6 text-2xl font-extrabold uppercase tracking-wide" style={{ color: '#CB30E0' }}>
        Quản Lý Người Dùng
      </h1>

      <div className="flex gap-5">
        {/* LEFT — danh sách */}
        <div className="flex-1 min-w-0">
          {/* Search row */}
          <form className="mb-5 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="search"
                defaultValue={search}
                placeholder="Tìm kiếm người dùng"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <select
                name="vai_tro"
                defaultValue={vai_tro ?? ''}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Cấp độ</option>
                <option value="STUDENT">Học viên</option>
                <option value="ADMIN">Admin</option>
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {selected && <input type="hidden" name="selected" value={selected} />}
            <button
              type="submit"
              className="px-6 h-10 text-sm font-bold text-gray-700 bg-gray-100 rounded-[20px] border border-gray-200 transition-opacity hover:opacity-90 hover:bg-gray-200 shadow-sm"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-left">
                  <th className="px-5 py-3 font-semibold text-gray-600">Người dùng</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Cấp độ</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <UserListClient
                    key={user.id}
                    user={user}
                    isSelected={selected === user.id}
                    currentSearch={search}
                    currentVaiTro={vai_tro}
                    currentPage={page}
                  />
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-400">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/admin/nguoi-dung"
              extraParams={`${search ? `&search=${search}` : ''}${vai_tro ? `&vai_tro=${vai_tro}` : ''}${selected ? `&selected=${selected}` : ''}`}
            />
          </div>
        </div>

        {/* RIGHT — detail panel */}
        <div className="w-[360px] shrink-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="mt-3 text-xs text-gray-400 leading-relaxed">Chọn một người dùng<br />trong danh sách để xem chi tiết</p>
              </div>
            ) : (
              <div>
                {/* Avatar + name */}
                <div className="mb-4 flex flex-col items-center">
                  <div
                    className="mb-2 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: '#CB30E0' }}
                  >
                    {selectedUser.tenHienThi.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>

                {/* Info rows */}
                <div className="mb-4 flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Vai trò</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        selectedUser.vaiTro === 'ADMIN'
                          ? { backgroundColor: '#F3E8FF', color: '#7C3AED' }
                          : { backgroundColor: '#F0F9FF', color: '#0369A1' }
                      }
                    >
                      {selectedUser.vaiTro === 'ADMIN' ? 'Admin' : 'Học viên'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Cấp độ hiện tại</span>
                    <span className="font-semibold text-gray-800">—</span>
                  </div>
                </div>

                {/* Thống kê học tập */}
                {selectedUser._count.lessonProgresses > 0 || selectedUser.examAttempts.length > 0 || selectedUser._count.flashcardStates > 0 ? (
                  <>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Thống kê học tập</p>
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-lg font-bold text-gray-900">{selectedUser._count.flashcardStates}</p>
                        <p className="text-[11px] text-gray-500">Tổng thẻ</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-lg font-bold text-gray-900">{completedLessons}</p>
                        <p className="text-[11px] text-gray-500">Bài học xong</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-lg font-bold text-gray-900">{selectedUser.examAttempts.length}</p>
                        <p className="text-[11px] text-gray-500">Đề đã làm</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-lg font-bold" style={{ color: '#CB30E0' }}>
                          {avgScore ? `${avgScore}%` : '—'}
                        </p>
                        <p className="text-[11px] text-gray-500">Điểm TB</p>
                      </div>
                    </div>

                    {/* KỸ NĂNG — placeholder bars */}
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Kỹ năng</p>
                    {(() => {
                      const baseSkill = selectedUser._count.lessonProgresses > 0 || selectedUser.examAttempts.length > 0 ? (Number(avgScore) || 50) : 0;
                      const vocabSkill = selectedUser._count.flashcardStates > 0 ? Math.min(100, Math.round((selectedUser._count.flashcardStates / 50) * 100)) : baseSkill;
                      
                      return [
                        { label: 'Từ vựng', pct: vocabSkill },
                        { label: 'Ngữ pháp', pct: baseSkill > 0 ? Math.min(100, baseSkill + 5) : 0 },
                        { label: 'Nghe', pct: baseSkill > 0 ? Math.max(0, baseSkill - 5) : 0 },
                        { label: 'Đọc', pct: baseSkill > 0 ? baseSkill : 0 },
                      ].map((skill) => (
                        <div key={skill.label} className="mb-2 flex items-center gap-2">
                          <span className="w-14 shrink-0 text-xs text-gray-500">{skill.label}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                            <div className="h-full rounded-full" style={{ width: `${skill.pct}%`, backgroundColor: '#CB30E0' }} />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs text-gray-500">{skill.pct}%</span>
                        </div>
                      ))
                    })()}
                  </>
                ) : (
                  <div className="mt-8 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-900">Chưa có hoạt động</p>
                    <p className="mt-1 text-xs text-gray-500">Học viên này chưa bắt đầu bất kỳ bài học nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
