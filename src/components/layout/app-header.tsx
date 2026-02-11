import Link from 'next/link';
import { LogoutButton } from '@/components/auth';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  homeHref: string;
  nav?: { label: string; href: string }[];
}

export function AppHeader({ title, subtitle, homeHref, nav }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            href={homeHref}
            className="flex items-center gap-2 font-bold tracking-wide text-primary"
          >
            <span className="text-lg">VOCAL</span>
          </Link>
          {subtitle && (
            <>
              <span className="text-border/60">|</span>
              <span className="text-sm text-muted-foreground">{title}</span>
            </>
          )}
          {!subtitle && (
            <>
              <span className="text-border/60">|</span>
              <span className="text-sm text-muted-foreground">{title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {nav?.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
          <LogoutButton size="sm" />
        </div>
      </div>
    </header>
  );
}
