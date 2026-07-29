import Link from 'next/link'

import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-[#F4E9F1] py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <Image src="/logo-icon.png" alt="FrenchGo Logo" width={28} height={28} className="object-contain mix-blend-multiply" />
          <Link href="/" className="text-xl font-extrabold text-black tracking-tight">
            FrenchGo
          </Link>
        </div>
      </div>
    </footer>
  )
}
