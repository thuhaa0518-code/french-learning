import { prisma } from '@/lib/prisma'
import UserListClient from '@/components/admin/UserListClient'

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
      orderBy: { tenHienThi: 'asc' },
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-3">
                {page > 1 && (
                  <a href={`?page=${page - 1}${search ? `&search=${search}` : ''}${vai_tro ? `&vai_tro=${vai_tro}` : ''}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors text-xs">
                    ‹
                  </a>
                )}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`?page=${p}${search ? `&search=${search}` : ''}${vai_tro ? `&vai_tro=${vai_tro}` : ''}`}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors ${
                      p === page
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {p}
                  </a>
                ))}
                {totalPages > 5 && <span className="text-xs text-gray-400">...</span>}
                {page < totalPages && (
                  <a href={`?page=${page + 1}${search ? `&search=${search}` : ''}${vai_tro ? `&vai_tro=${vai_tro}` : ''}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors text-xs">
                    ›
                  </a>
                )}
              </div>
            )}
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
                {[
                  { label: 'Từ vựng', pct: 78 },
                  { label: 'Ngữ pháp', pct: 65 },
                  { label: 'Nghe', pct: 70 },
                  { label: 'Đọc', pct: 74 },
                ].map((skill) => (
                  <div key={skill.label} className="mb-2 flex items-center gap-2">
                    <span className="w-14 shrink-0 text-xs text-gray-500">{skill.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${skill.pct}%`, backgroundColor: '#CB30E0' }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-gray-500">{skill.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
