import Image from 'next/image'
import Link from 'next/link'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left — Eiffel Tower */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-12 text-center">
          <h1 className="text-5xl font-bold mb-6 drop-shadow-lg leading-tight">
            Bonjour!<br /> Bắt đầu hành trình mới
          </h1>
          <p className="text-lg font-medium drop-shadow-md text-gray-100 max-w-md">
            Hàng ngàn bài học tiếng Pháp chuẩn CEFR đang chờ bạn khám phá. Đăng ký ngay hôm nay!
          </p>
        </div>
        <Image
          src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000"
          width={1600} height={2400}
          alt="Paris"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right — Form */}
      <div className="flex w-full items-center justify-center overflow-hidden bg-white px-8 lg:w-1/2">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Image src="/logo-icon-v2.png" alt="FrenchGo Logo" width={36} height={36} className="w-9 h-9 object-contain" />
            <span className="text-2xl font-bold text-primary">FrenchGo</span>
          </div>
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <Link href="/sign-in"
              className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary hover:bg-purple-50 transition-colors">
              Đăng nhập
            </Link>
            <span className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">
              Đăng ký
            </span>
          </div>

          <SignUp 
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in" 
            forceRedirectUrl="/api/auth/redirect"
            appearance={{ 
              variables: {
                colorPrimary: '#CB30E0',
              },
              elements: { 
                rootBox: "mx-auto w-full", 
                card: "shadow-none border border-gray-100",
                watermark: "hidden",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-sm normal-case",
              } 
            }} 
          />
        </div>
      </div>
    </div>
  )
}
