import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useT } from "@/lib/i18n";

export function SunflowerStoryLink({ name }: { name: string }) {
  const t = useT();
  return (
    <Link
      to="/watch"
      search={{ film: "sunflower" }}
      aria-label={t("Відкрити казку про соняшник: {name}", { name })}
      className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-paper px-2 text-xs font-bold text-primary shadow-soft transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
      <span>{t("Казка")}</span>
    </Link>
  );
}
