'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

interface ProfileCardProps {
  tenHienThi: string
  email: string
  vaiTro: string
  createdAt?: string | null
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileCard({ tenHienThi, email, vaiTro, createdAt }: ProfileCardProps) {
  const router = useRouter()
  const { getToken } = useAuth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(tenHienThi)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials = getInitials(tenHienThi)
  const joinDate = createdAt
    ? new Date(createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  async function handleSave() {
    if (!name.trim()) {
      setError('Tên hiển thị không được để trống')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await fetch('/api/nguoi-dung/toi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ tenHienThi: name.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setEditing(false)
        router.refresh()
      } else {
        setError(data.error?.message || 'Không thể lưu thay đổi')
      }
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(tenHienThi)
    setError(null)
    setEditing(false)
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Profile row */}
      <div className="flex items-center gap-4 px-6 py-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {initials}
          </div>
          {editing && (
            <button
              title="Đổi ảnh đại diện"
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 truncate">{tenHienThi}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
              {vaiTro === 'ADMIN' ? 'Giáo viên' : 'Học viên'}
            </span>
            {joinDate && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Tham gia {joinDate}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      {/* Edit form — slide down khi editing */}
      {editing && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5">
          <p className="mb-1 text-[15px] font-bold text-gray-800">Chỉnh sửa hồ sơ</p>
          <p className="mb-4 text-xs text-gray-500">Email không thể thay đổi. Thông tin sẽ được đồng bộ ngay lập tức.</p>

          {/* Tên hiển thị */}
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            Tên hiển thị
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="mb-4 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Nhập tên hiển thị..."
            autoFocus
          />

          {error && (
            <p className="mb-3 text-xs text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
