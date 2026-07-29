import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

import { SidebarProvider } from '@/components/admin/SidebarContext'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()

  if (!userId) redirect('/sign-in')

  const vaiTro = (sessionClaims?.publicMetadata as { vai_tro?: string } | undefined)?.vai_tro
  if (vaiTro !== 'ADMIN') redirect('/')

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden font-exo">
        {/* Top navbar */}
        <AdminNavbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main content — scroll bên trong */}
          <main className="flex-1 overflow-y-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
