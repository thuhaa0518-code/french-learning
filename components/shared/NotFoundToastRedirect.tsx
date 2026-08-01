'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

export default function NotFoundToastRedirect({ fallbackUrl }: { fallbackUrl: string }) {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    toast('Nội dung không khả dụng', 'warning')
    const timeout = setTimeout(() => {
      router.push(fallbackUrl)
    }, 500) // slight delay to allow toast to render and animate before navigating away

    return () => clearTimeout(timeout)
  }, [router, toast, fallbackUrl])

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 p-6">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#CB30E0] border-t-transparent" />
    </div>
  )
}
