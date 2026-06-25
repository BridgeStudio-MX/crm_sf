'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils/cn';

type AppNavProps = {
  defaultParqueId?: string;
};

const navItems = (defaultParqueId?: string) => [
  { href: '/dashboard', label: 'Dashboard' },
  {
    href: defaultParqueId
      ? `/parque/${defaultParqueId}/stacking-plan`
      : '/dashboard',
    label: 'Stacking Plan',
  },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/contratos', label: 'Contratos' },
  { href: '/comisiones', label: 'Comisiones' },
  { href: '/mapa', label: 'Mapa' },
];

export const AppNav = ({ defaultParqueId }: AppNavProps) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navItems(defaultParqueId);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            Sistema de Gestión Parks Industrial
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname.startsWith(item.href.split('/').slice(0, 2).join('/'))
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            PI
          </div>
          <span className="text-sm text-slate-600">Usuario Parks</span>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-slate-200 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
};
