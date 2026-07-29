import type { Metadata } from 'next'
import { Exo } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { viVN } from '@clerk/localizations'
import ConditionalNavbar from '@/components/shared/ConditionalNavbar'
import ConditionalFooter from '@/components/shared/ConditionalFooter'
import './globals.css'

const exo = Exo({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-exo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FrenchGo — Học tiếng Pháp trực tuyến',
  description:
    'Nền tảng học tiếng Pháp cho học sinh và sinh viên Việt Nam. Hỗ trợ cấp độ A1, A2, B1, B2 theo khung CEFR.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/" localization={{
      ...viVN,
      formFieldInputPlaceholder__password: 'Tạo một mật khẩu',
      formFieldInputPlaceholder__signUpPassword: 'Tạo một mật khẩu',
      formFieldLabel__password: 'Mật khẩu',
      formFieldInputPlaceholder__phoneNumber: 'Nhập số điện thoại của bạn',
      formFieldLabel__phoneNumber: 'Số điện thoại',
      signUp: {
        start: {
          title: 'Tạo tài khoản của bạn',
          subtitle: 'Chào mừng! Vui lòng điền các chi tiết để bắt đầu.',
          actionLink__use_email: 'Sử dụng Email',
          actionLink__use_phone: 'Sử dụng Số điện thoại',
        }
      },
      signIn: {
        start: {
          title: 'Đăng nhập vào FrenchGo',
          subtitle: 'Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.',
          actionLink__use_email: 'Sử dụng Email',
          actionLink__use_phone: 'Sử dụng Số điện thoại',
        }
      }
    }}>
      <html lang="vi" suppressHydrationWarning>
        <body className={`${exo.variable} font-exo antialiased`} suppressHydrationWarning>
          <ConditionalNavbar />
          <main>{children}</main>
          <ConditionalFooter />
        </body>
      </html>
    </ClerkProvider>
  )
}
