'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Logo } from '@/components/logo';
import SignInDialog from '@/components/sign-in-dialog';
import { useSession } from '@/lib/auth-client';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '#faq' },
];

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  useEffect(() => {
    setMounted(true);
  }, []);
 
  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur py-2 md:py-0">
      <SignInDialog open={open} onOpenChange={setOpen}/>
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">

        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between px-1 py-2 md:px-10 md:py-10">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="w-auto h-6 md:h-8 text-primary" />
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
            <Button onClick={() => {
              if (session) {
                router.push("/dashboard")
              } else {
                setOpen(true)
              }
            }}
            >
              Dashboard
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <ModeToggle />
            </div>

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