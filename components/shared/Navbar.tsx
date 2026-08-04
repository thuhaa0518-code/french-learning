import Link from 'next/link'
import AuthButton from './AuthButton'
import NavLinks from './NavLinks'
import Image from 'next/image'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm h-16">
      <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo-icon-v2.png" alt="FrenchGo Logo" width={48} height={48} className="object-contain mix-blend-multiply" />
          <span className="text-4xl font-extrabold text-black tracking-tight mt-0.5">FrenchGo</span>
        </Link>

        {/* Nav links — Client Component */}
        <NavLinks />

        {/* Auth */}
        <div className="flex h-full items-center gap-2 shrink-0">
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

