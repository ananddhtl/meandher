'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',           label: 'Home',       icon: '🏠' },
  { href: '/plan',       label: 'The Plan',   icon: '📋' },
  { href: '/memories',   label: 'Memories',   icon: '📸' },
  { href: '/map',        label: 'Map',        icon: '🗺️' },
  { href: '/date-ideas', label: 'Date Ideas', icon: '✨' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop top nav ── */}
      <header className="hidden sm:flex sticky top-0 z-40 w-full border-b border-[oklch(0.88_0.04_80)] bg-[oklch(0.99_0.01_80)/90] backdrop-blur-md">
        <div className="max-w-5xl mx-auto w-full px-6 flex items-center justify-between h-14">
          <Link
            href="/"
            className="font-display text-lg font-bold italic text-[oklch(0.55_0.15_40)]"
          >
            Us Together.. K&A
          </Link>

          <nav className="flex items-center gap-1">
            {LINKS.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[oklch(0.55_0.15_40)] text-white'
                      : 'text-[oklch(0.40_0.05_60)] hover:bg-[oklch(0.92_0.03_80)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Mobile top header ── */}
      <header className="sm:hidden sticky top-0 z-40 w-full border-b border-[oklch(0.88_0.04_80)] bg-[oklch(0.99_0.01_80)/90] backdrop-blur-md">
        <div className="px-4 flex items-center justify-center h-12">
          <span className="font-display text-base font-bold italic text-[oklch(0.55_0.15_40)]">
            Us Together.. K&A
          </span>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[oklch(0.99_0.01_80)] border-t border-[oklch(0.88_0.04_80)] flex">
        {LINKS.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? 'text-[oklch(0.55_0.15_40)]'
                  : 'text-[oklch(0.55_0.05_60)]'
              }`}
            >
              <span className="text-lg leading-none">{link.icon}</span>
              <span className="leading-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
