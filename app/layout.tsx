import type { Metadata } from 'next'
import { Exo } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { viVN } from '@clerk/localizations'
import ConditionalNavbar from '@/components/shared/ConditionalNavbar'
import ConditionalFooter from '@/components/shared/ConditionalFooter'
import { ToastProvider } from '@/components/ui/ToastProvider'
import './globals.css'

const exo = Exo({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-exo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FrenchGo - Học Tiếng Pháp trực tuyến',
  description:
    'Nền tảng học tiếng Pháp cho học sinh và sinh viên Việt Nam. Hỗ trợ cấp độ A1, A2, B1, B2 theo khung CEFR.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider 
      afterSignOutUrl="/" 
      appearance={{ elements: { footer: "hidden", watermark: "hidden" } }}
      localization={{
      ...viVN,
      formFieldInputPlaceholder__password: 'Nhập mật khẩu của bạn',
      formFieldInputPlaceholder__signUpPassword: 'Tạo một mật khẩu',
      formFieldLabel__password: 'Mật khẩu',
      formFieldLabel__emailAddress: 'email',
      formFieldError__required: 'Vui lòng nhập {{fieldName}}',
      formFieldInputPlaceholder__phoneNumber: 'Nhập số điện thoại của bạn',
      formFieldLabel__phoneNumber: 'Số điện thoại',
      unstable__errors: {
        ...viVN.unstable__errors,
        form_identifier_exists: 'Email đã được sử dụng',
        form_password_length_too_short: 'Mật khẩu tối thiểu 8 ký tự',
        form_param_format_invalid: 'Email không đúng định dạng',
        form_password_validation_failed: 'Mật khẩu tối thiểu 8 ký tự',
        form_password_not_strong_enough: 'Mật khẩu tối thiểu 8 ký tự',
      },
      signUp: {
        ...viVN.signUp,
        start: {
          ...viVN.signUp?.start,
          title: 'Tạo tài khoản của bạn',
          subtitle: 'Chào mừng! Vui lòng điền các chi tiết để bắt đầu.',
          actionLink__use_email: 'Sử dụng Email',
          actionLink__use_phone: 'Sử dụng Số điện thoại',
        }
      },
      signIn: {
        ...viVN.signIn,
        start: {
          ...viVN.signIn?.start,
          title: 'Đăng nhập vào FrenchGo',
          subtitle: 'Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.',
          actionLink__use_email: 'Sử dụng Email',
          actionLink__use_phone: 'Sử dụng Số điện thoại',
        },
        password: {
          ...viVN.signIn?.password,
          title: 'Nhập mật khẩu',
          subtitle: 'Nhập mật khẩu liên kết với tài khoản của bạn'
        }
      }
    }}>
      <html lang="vi" suppressHydrationWarning>
        <body className={`${exo.variable} font-exo antialiased`} suppressHydrationWarning>
          <ToastProvider>
            <ConditionalNavbar />
            <main>{children}</main>
            <ConditionalFooter />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
