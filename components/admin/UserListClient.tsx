'use client'

import { useRouter, usePathname } from 'next/navigation'

interface UserRow {
  id: string
  tenHienThi: string
  email: string
  vaiTro: string
  createdAt: Date
}

interface Props {
  user: UserRow
  isSelected: boolean
  currentSearch?: string
  currentVaiTro?: string
  currentPage: number
}

export default function UserListClient({ user, isSelected, currentSearch, currentVaiTro, currentPage }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleClick() {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentVaiTro) params.set('vai_tro', currentVaiTro)
    if (currentPage > 1) params.set('page', String(currentPage))
    params.set('selected', user.id)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <tr
      onClick={handleClick}
      className={`cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${
        isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-5 py-3 font-medium text-gray-900">{user.tenHienThi}</td>
      <td className="px-5 py-3 text-gray-500">—</td>
      <td className="px-5 py-3 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
    </tr>
  )
}
