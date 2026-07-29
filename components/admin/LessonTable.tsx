'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LessonRow {
  id: string
  tieuDe: string
  level: string
  chuDe: string
  isPublish: boolean
  slug: string
  _count: { sections: number }
}

interface LessonTableProps {
  lessons: LessonRow[]
  total: number
  page: number
  pageSize: number
  levels: string[]
  chuDeList: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRIMARY = '#CB30E0'
const PRIMARY_LIGHT = '#FDF0FF'

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// Icon delete (trash)
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 0h4v2h6v2H0V2h6V0zM1 5v11h14V5h-2v9H3V5H1zm4 2h2v5H5V7zm4 0h2v5H9V7z" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  labelMap,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  labelMap?: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayLabel = value ? (labelMap?.[value] ?? value) : placeholder

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-[20px] border border-gray-200 bg-white px-4 h-10 text-sm text-gray-700 hover:border-gray-300 transition-colors min-w-[120px] justify-between shadow-sm"
      >
        <span className="font-medium text-gray-800">{displayLabel}</span>
        <IconChevron />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[130px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${value === '' ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            style={value === '' ? { backgroundColor: '#E9D5FF', color: '#7C3AED' } : undefined}
          >
            {placeholder}
          </button>
          {options.map((opt) => {
            const label = labelMap?.[opt] ?? opt
            const isActive = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
                style={isActive ? { backgroundColor: '#E9D5FF', color: '#7C3AED', fontWeight: 600 } : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LessonTable({
  lessons,
  total,
  page,
  pageSize,
  levels,
  chuDeList,
}: LessonTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Selected rows
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Local search/filter state (controlled)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') ?? '')
  const [chuDeFilter, setChuDeFilter] = useState(searchParams.get('chuDe') ?? '')

  const totalPages = Math.ceil(total / pageSize)

  // ── URL helpers ──────────────────────────────────────────────────────────────

  const buildUrl = useCallback(
    (overrides: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      }
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams],
  )

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleTabClick(tab: string) {
    router.push(buildUrl({ tab, page: 1 }))
  }

  function handleSearch() {
    router.push(buildUrl({ q: searchInput, level: levelFilter, chuDe: chuDeFilter, page: 1 }))
  }

  function handlePageChange(newPage: number) {
    router.push(buildUrl({ page: newPage }))
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(lessons.map((l) => l.id)))
    } else {
      setSelected(new Set())
    }
  }

  function handleSelectRow(id: string, checked: boolean) {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    setSelected(next)
  }

  async function handleBulkPublish() {
    if (selected.size === 0) return
    setLoading(true)
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/bai-hoc/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublish: true }),
          }),
        ),
      )
      setSelected(new Set())
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Bạn có chắc muốn xóa ${selected.size} bài học đã chọn?`)) return
    setLoading(true)
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/bai-hoc/${id}`, { method: 'DELETE' }),
        ),
      )
      setSelected(new Set())
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSingle(id: string) {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return
    setLoading(true)
    try {
      await fetch(`/api/bai-hoc/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const activeTab = searchParams.get('tab') ?? 'all'
  const allSelected = lessons.length > 0 && selected.size === lessons.length
  const someSelected = selected.size > 0 && !allSelected
  const hasPublishedSelected = Array.from(selected).some(id => lessons.find(x => x.id === id)?.isPublish)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {(['all', 'published', 'draft'] as const).map((tab) => {
          const labels = { all: 'Tất cả', published: 'Đã đăng', draft: 'Nháp' }
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-6 py-2 rounded-[20px] text-sm transition-colors border ${isActive
                  ? 'bg-[#F4E9F1] text-[#CB30E0] border-transparent font-bold'
                  : 'bg-white text-gray-400 border-gray-200 font-semibold hover:border-gray-300'
                }`}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* ── Search + Filter row ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        {/* Search input */}
        <div className="relative w-[320px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <IconSearch />
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm kiếm bài học"
            className="w-full pl-11 pr-4 h-10 text-sm font-medium border border-gray-200 rounded-[20px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          />
        </div>

        {/* Level dropdown */}
        <CustomDropdown
          value={levelFilter}
          onChange={setLevelFilter}
          options={levels}
          placeholder="A1"
        />

        {/* Chủ đề dropdown */}
        <CustomDropdown
          value={chuDeFilter}
          onChange={setChuDeFilter}
          options={chuDeList}
          placeholder="Từ vựng"
          labelMap={{
            VOCABULARY: 'Từ vựng',
            GRAMMAR: 'Ngữ pháp',
            LISTENING: 'Nghe',
            READING: 'Đọc',
          }}
        />

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="px-6 h-10 text-sm font-bold text-gray-700 bg-gray-100 rounded-[20px] border border-gray-200 transition-opacity hover:opacity-90 hover:bg-gray-200 shadow-sm"
        >
          Tìm kiếm
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-left">
              <th className="px-4 py-4 w-10 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 rounded-[4px] border-gray-300 cursor-pointer transition-colors"
                  style={{ accentColor: PRIMARY }}
                />
              </th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Bài học</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Cấp độ</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Chủ đề</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Trạng thái</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Lượt xem</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Ngày tạo</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => {
              const isChecked = selected.has(lesson.id)
              return (
                <tr
                  key={lesson.id}
                  className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50"
                  style={isChecked ? { backgroundColor: '#FDF0FF' } : undefined}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleSelectRow(lesson.id, e.target.checked)}
                      className="w-5 h-5 rounded-[4px] border-gray-300 cursor-pointer transition-colors"
                      style={{ accentColor: PRIMARY }}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">{lesson.tieuDe}</span>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {lesson.level}
                  </td>
                  <td className="px-4 py-4 text-gray-900 font-medium capitalize">
                    {lesson.chuDe === 'VOCABULARY' ? 'Từ vựng' : lesson.chuDe === 'GRAMMAR' ? 'Ngữ pháp' : lesson.chuDe === 'LISTENING' ? 'Nghe' : lesson.chuDe === 'READING' ? 'Đọc' : lesson.chuDe}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {lesson.isPublish ? 'Đã đăng' : 'Nháp'}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    0
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    18/07/2026
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/bai-hoc/${lesson.id}/chinh-sua`}
                        title="Chỉnh sửa"
                        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
                      >
                        <IconEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteSingle(lesson.id)}
                        title="Xóa"
                        disabled={loading}
                        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-50 transition-colors text-gray-600 hover:text-red-500 disabled:opacity-50"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  Chưa có bài học nào
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Footer: bulk actions + pagination ──────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
          {/* Bulk actions */}
          <div className="flex items-center gap-4 min-h-[36px]">
            {selected.size > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={(e) => {
                      if (!e.target.checked) setSelected(new Set())
                    }}
                    className="w-5 h-5 rounded-[4px] border-gray-300 cursor-pointer transition-colors"
                    style={{ accentColor: PRIMARY }}
                  />
                  <span className="text-sm font-bold text-gray-900">
                    Đã chọn {selected.size} bài học
                  </span>
                </div>
                {!hasPublishedSelected && (
                  <button
                    onClick={handleBulkPublish}
                    disabled={loading}
                    className="px-5 py-1.5 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-[20px] transition-opacity hover:opacity-90 hover:bg-gray-200 disabled:opacity-50 shadow-sm"
                  >
                    Đăng bài
                  </button>
                )}
                <button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="px-5 py-1.5 text-sm font-bold text-red-500 bg-red-50 border border-red-200 rounded-[20px] hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Xoá
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-400 font-medium">
                {total} bài học
              </span>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-6 h-6 flex items-center justify-center rounded bg-[#CB30E0] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className="text-sm font-bold text-gray-600 transition-colors hover:text-primary"
                  >
                    {p === page ? <span className="text-gray-900">{p}</span> : p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-6 h-6 flex items-center justify-center rounded bg-[#CB30E0] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
