import Link from 'next/link'

import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-[#F4E9F1] py-8">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-icon-v2.png" alt="FrenchGo Logo" width={44} height={44} className="object-contain mix-blend-multiply" />
          <Link href="/" className="text-3xl font-extrabold text-black tracking-tight mt-0.5">
            FrenchGo
          </Link>
        </div>
      </div>
    </footer>
  )
}
