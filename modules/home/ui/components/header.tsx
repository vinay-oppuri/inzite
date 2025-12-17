'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '#faq' },
];

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">

        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between px-1 py-1 md:px-10 md:py-10">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/Logo.svg" width={80} height={80} alt="Logo" />
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  transition-colors
                  ${isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden md:inline-flex rounded-full px-6 font-semibold"
            >
              <Link href="/login">Dashboard</Link>
            </Button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden inline-flex items-center justify-center rounded-full p-2 hover:bg-muted"
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden border-t">
            <nav className="flex flex-col px-2 py-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    rounded-lg px-4 py-3 text-base font-medium
                    transition-colors
                    ${isActive(item.href)
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;