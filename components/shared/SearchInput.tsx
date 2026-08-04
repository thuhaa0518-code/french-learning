'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef, useCallback } from 'react'

interface Props {
  placeholder?: string
  containerClassName?: string
  inputClassName?: string
}

export default function SearchInput({ placeholder = 'Tìm kiếm...', containerClassName = '', inputClassName = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce 500ms
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('search', value.trim())
      } else {
        params.delete('search')
      }
      // Reset page back to 1 when search query changes
      params.delete('page')
      
      router.push(`${pathname}?${params.toString()}`)
    }, 400)
  }, [router, pathname, searchParams])

  return (
    <div className={containerClassName}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        defaultValue={searchParams.get('search') || ''}
        placeholder={placeholder}
        onChange={handleChange}
        className={inputClassName}
      />
    </div>
  )
}
