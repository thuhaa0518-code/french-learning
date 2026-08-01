'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastProvider'

const PRIMARY = '#CB30E0'
const PRIMARY_LIGHT = '#FDF0FF'

export interface ExamRow {
  id: string
  tieuDe: string
  level: string
  thoiGianLam: number
  isPublish: boolean
  _count: { questions: number }
  createdAt: Date
}

interface Props { exams: ExamRow[]; total: number; page: number; pageSize: number }

function IconEdit() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> }
function IconTrash() { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="currentColor" width="14" height="18"><path fillRule="evenodd" clipRule="evenodd" d="M5 1h4v1H5z M1 3h12v1H1z M2 5v12h10V5H2z M3 6h8v10H3V6z M5 8h1v6H5V8z M8 8h1v6H8V8z" /></svg> }
function IconSearch() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> }

export default function ExamTable({ exams, total, page, pageSize }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'bulk' } | null>(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') ?? '')

  const totalPages = Math.ceil(total / pageSize)
  const activeTab = searchParams.get('tab') ?? 'all'
  const allSelected = exams.length > 0 && selected.size === exams.length
  const someSelected = selected.size > 0 && !allSelected
  const hasPublishedSelected = Array.from(selected).some(id => exams.find(x => x.id === id)?.isPublish)

  const buildUrl = useCallback((overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(overrides)) { if (v === undefined || v === '') p.delete(k); else p.set(k, String(v)) }
    return `${pathname}?${p.toString()}`
  }, [pathname, searchParams])

  function handleSearch() { router.push(buildUrl({ q: searchInput, level: levelFilter, page: 1 })) }

  async function handleDeleteSingle(id: string) {
    setDeleteTarget({ type: 'single', id })
  }

  async function performDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      if (deleteTarget.type === 'single') {
        await fetch(`/api/de-thi/${deleteTarget.id}`, { method: 'DELETE' })
      } else {
        await Promise.all(Array.from(selected).map(id => fetch(`/api/de-thi/${id}`, { method: 'DELETE' })))
        setSelected(new Set())
      }
      toast('Xóa thành công!', 'success')
      router.refresh()
    } finally { 
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  async function handleBulkPublish() {
    setLoading(true)
    try {
      await Promise.all(Array.from(selected).map(id => fetch(`/api/de-thi/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublish: true }) })))
      setSelected(new Set()); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleBulkDelete() {
    setDeleteTarget({ type: 'bulk' })
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'published', 'draft'] as const).map(tab => {
          const labels = { all: 'Tất cả', published: 'Đã đăng', draft: 'Nháp' }
          const isActive = activeTab === tab
          return (
            <button key={tab} onClick={() => router.push(buildUrl({ tab, page: 1 }))} className={`px-6 py-2 rounded-[20px] text-sm transition-colors border ${isActive ? 'bg-[#F4E9F1] text-[#CB30E0] border-transparent font-bold' : 'bg-white text-gray-400 border-gray-200 font-semibold hover:border-gray-300'}`}>
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative w-[320px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><IconSearch /></span>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Tìm kiếm đề thi" className="w-full pl-11 pr-4 h-10 text-sm font-medium border border-gray-200 rounded-[20px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm" />
        </div>
        <div className="relative">
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="appearance-none px-4 h-10 min-w-[120px] text-sm font-medium border border-gray-200 rounded-[20px] bg-white focus:outline-none cursor-pointer shadow-sm text-gray-800">
            <option value="">Cấp độ</option>
            {['A1', 'A2', 'B1', 'B2'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <button onClick={handleSearch} className="px-6 h-10 text-sm font-bold text-gray-700 bg-gray-100 rounded-[20px] border border-gray-200 transition-opacity hover:opacity-90 hover:bg-gray-200 shadow-sm">Tìm kiếm</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-left">
              <th className="px-4 py-4 w-10 border-b border-gray-200">
                <input type="checkbox" checked={allSelected} onChange={e => setSelected(e.target.checked ? new Set(exams.map(e => e.id)) : new Set())} className="w-5 h-5 rounded-[4px] border-gray-300 cursor-pointer transition-colors" style={{ accentColor: PRIMARY }} />
              </th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Đề thi</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Cấp độ</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Thời gian</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Số câu</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Trạng thái</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Lần làm</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Ngày tạo</th>
              <th className="px-4 py-4 font-bold text-gray-600 border-b border-gray-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => {
              const isChecked = selected.has(exam.id)
              return (
                <tr key={exam.id} className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50" style={isChecked ? { backgroundColor: '#FDF0FF' } : undefined}>
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={isChecked} onChange={e => { const s = new Set(selected); e.target.checked ? s.add(exam.id) : s.delete(exam.id); setSelected(s) }} className="w-5 h-5 rounded-[4px] border-gray-300 cursor-pointer transition-colors" style={{ accentColor: PRIMARY }} />
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">{exam.tieuDe}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{exam.level}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{exam.thoiGianLam} phút</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{exam._count.questions}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {exam.isPublish ? 'Đã đăng' : 'Nháp'}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">1810</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/de-thi/${exam.id}`} title="Quản lý câu hỏi" className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors text-gray-600"><IconEdit /></Link>
                      <button onClick={() => handleDeleteSingle(exam.id)} title="Xóa" disabled={loading} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-50 transition-colors text-gray-600 hover:text-red-500 disabled:opacity-50"><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {exams.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">Chưa có đề thi nào</td></tr>}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-4 min-h-[36px]">
            {selected.size > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={true} onChange={(e) => { if (!e.target.checked) setSelected(new Set()) }} className="w-5 h-5 rounded-[4px] border-gray-300 cursor-pointer transition-colors" style={{ accentColor: PRIMARY }} />
                  <span className="text-sm font-bold text-gray-900">Đã chọn {selected.size} đề thi</span>
                </div>
                {!hasPublishedSelected && (
                  <button onClick={handleBulkPublish} disabled={loading} className="px-5 py-1.5 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-[20px] transition-opacity hover:opacity-90 hover:bg-gray-200 disabled:opacity-50 shadow-sm">Đăng bài</button>
                )}
                <button onClick={handleBulkDelete} disabled={loading} className="px-5 py-1.5 text-sm font-bold text-red-500 bg-red-50 border border-red-200 rounded-[20px] hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm">Xoá</button>
              </>
            ) : <span className="text-sm text-gray-400 font-medium">{total} đề thi</span>}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => router.push(buildUrl({ page: page - 1 }))} disabled={page <= 1} className="w-6 h-6 flex items-center justify-center rounded bg-[#CB30E0] text-white disabled:opacity-40 hover:opacity-90 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex items-center gap-2 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => router.push(buildUrl({ page: p }))} className="text-sm font-bold text-gray-600 transition-colors hover:text-primary">
                    {p === page ? <span className="text-gray-900">{p}</span> : p}
                  </button>
                ))}
              </div>
              <button onClick={() => router.push(buildUrl({ page: page + 1 }))} disabled={page >= totalPages} className="w-6 h-6 flex items-center justify-center rounded bg-[#CB30E0] text-white disabled:opacity-40 hover:opacity-90 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá"
        type="danger"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
              Huỷ
            </button>
            <button onClick={performDelete} disabled={loading} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600 disabled:opacity-50">
              Xác nhận
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="text-[15px] text-gray-700 font-medium">Bạn chắc chắn muốn xoá?</p>
        </div>
      </Modal>
    </div>
  )
}
