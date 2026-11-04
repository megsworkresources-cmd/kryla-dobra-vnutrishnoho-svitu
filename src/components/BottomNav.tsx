import { Link, useLocation } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { neighbours } from '@/content/sequence';

/** Back / Next buttons shown at the bottom of every page. */
export function BottomNav({ night }: { night?: boolean | undefined; floating?: boolean }) {
  const { pathname } = useLocation();
  const { prev, next } = neighbours(pathname);
  if (!prev && !next) return null;
  const card = night ? 'night-card' : 'paper-card';
  return (
    <>
    {/* Spacer reserves the bar's height so page content never slides underneath it. */}
    <div aria-hidden className="h-[calc(6rem+env(safe-area-inset-bottom))] shrink-0" />
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md ${night ? 'bg-night-bar' : 'bg-background/95'}`}>
    <nav aria-label="Назад і далі" className="mx-auto flex max-w-3xl items-stretch justify-between gap-3 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
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
    </div>
    </>
  );
}
