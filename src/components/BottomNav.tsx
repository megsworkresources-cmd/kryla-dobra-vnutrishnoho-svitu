import { Link, useLocation } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { neighbours } from '@/content/sequence';

/** Back / Next buttons shown at the bottom of every page. */
export function BottomNav({ night, floating }: { night?: boolean | undefined; floating?: boolean }) {
  const { pathname } = useLocation();
  const { prev, next } = neighbours(pathname);
  if (!prev && !next) return null;
  const card = night ? 'night-card' : 'paper-card';
  return (
    <nav aria-label="Назад і далі" className={`${floating ? 'absolute inset-x-0 bottom-0' : 'relative'} z-20 mx-auto flex max-w-3xl items-stretch justify-between gap-3 px-4 pb-5 pt-2`}>
      {prev ? (
        <Link to={prev.to as never} className={`${card} flex min-h-14 max-w-[48%] items-center gap-1 px-4 text-sm font-bold`} aria-label={`Назад: ${prev.label}`}>
          <ChevronLeft className="h-5 w-5 shrink-0" /><span className="truncate">{prev.label}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link to={next.to as never} className="flex min-h-14 max-w-[48%] items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-soft" aria-label={`Далі: ${next.label}`}>
          <span className="truncate">{next.label}</span><ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      ) : <span />}
    </nav>
  );
}
