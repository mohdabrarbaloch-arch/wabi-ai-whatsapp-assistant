import Link from "next/link";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1a8259" />
      <path d="M32 12c-10.5 0-19 7.8-19 17.4 0 5.4 2.7 10.2 7 13.4v9.6l8.9-4.9c1 .1 2 .2 3.1.2 10.5 0 19-7.8 19-17.4S42.5 12 32 12z" fill="#fff" />
      <path d="M25 27c0 1.5 1.5 4.5 6.5 7.5 6.5 3.9 9 3 10 2.2 1.2-1 1.7-2 1-3.4-.4-.9-2.2-2.2-3-2.7-.9-.5-1.5-.4-2 .4-.5.8-1.2 2-1.5 2.2-.4.3-.9.4-1.7-.1-1.9-1.1-4.9-4.8-5.1-5-.4-.6-.1-1.1.2-1.5.3-.4.7-1 .7-1.5.1-.6 0-1-.2-1.4-.3-.6-1.7-4.1-2.2-4.1-.7 0-1.2.2-1.9.7-1.4 1.4-2.8 3.6-2.8 5.4z" fill="#1a8259" />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900"><Logo /><span className="text-lg">Wabi<span className="text-brand-600">.</span></span></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#features" className="transition hover:text-slate-900">Features</Link>
          <Link href="/#how-it-works" className="transition hover:text-slate-900">How it works</Link>
          <Link href="/pricing" className="transition hover:text-slate-900">Pricing</Link>
          <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
          <Link href="/register" className="btn-primary">Get started free</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5"><Logo className="h-7 w-7" /><span className="font-semibold text-slate-800">Wabi</span></div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link href="/pricing" className="hover:text-slate-800">Pricing</Link>
            <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-800">Terms</Link>
            <Link href="/contact" className="hover:text-slate-800">Contact</Link>
            <Link href="/login" className="hover:text-slate-800">Log in</Link>
          </nav>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Wabi. Built for small businesses that don&apos;t sleep.</p>
        </div>
      </div>
    </footer>
  );
}