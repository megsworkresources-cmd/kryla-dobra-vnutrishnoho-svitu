import { WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";

export function GardenOfflineNotice({ caregiver = false }: { caregiver?: boolean }) {
  const t = useT();
  return (
    <div
      id={caregiver ? "shared-garden-offline" : "community-garden-offline"}
      role="status"
      className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground"
    >
      <WifiOff className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="font-bold">{t("Ви офлайн")}</p>
        <p className="mt-1 text-sm leading-relaxed">
          {t(
            caregiver
              ? "Догляд збережено на пристрої. Спільні квітки можуть бути неактуальними; зміни поширення не надсилаються автоматично."
              : "Ваш сад і поливання залишаються на цьому пристрої. Для оновлення спільних квіток потрібен інтернет.",
          )}
        </p>
      </div>
    </div>
  );
}
