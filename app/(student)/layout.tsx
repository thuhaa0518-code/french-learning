import { auth } from '@clerk/nextjs/server'
import ClientAuthGuard from '@/components/shared/ClientAuthGuard'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Call auth() to opt into dynamic rendering without blocking/redirecting on server
  await auth()

  return <ClientAuthGuard>{children}</ClientAuthGuard>
}
