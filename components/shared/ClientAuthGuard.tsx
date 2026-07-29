'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`)
    }
  }, [isLoaded, isSignedIn, router, pathname])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
