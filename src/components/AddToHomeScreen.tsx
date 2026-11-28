import { useEffect, useState } from "react";
import { Btn } from "@/components/Scene";
import { useT } from "@/lib/i18n";
import { dismissHomeTip, useStore } from "@/lib/store";

/** Installed app windows report standalone; a Home Screen web app also sets navigator.standalone. */
function alreadyOnHomeScreen() {
  if (typeof window === "undefined") return true;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches === true;
  return standalone || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  // iPadOS reports a Mac user agent; a touch screen tells it apart from a real Mac.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Safari may clear the browser's storage for a site that is not opened for about a week.
 * Adding the app to the Home Screen keeps the child's drawings, star and garden, so this
 * offers the steps once — quietly, and only where it applies — instead of nagging.
 */
export function AddToHomeScreen({ mode = "tip" }: { mode?: "tip" | "instructions" }) {
  const t = useT();
  const dismissed = useStore((s) => s.homeTipDismissed);
  const [applies, setApplies] = useState(false);
  const [steps, setSteps] = useState(mode === "instructions");
  useEffect(() => setApplies(isIosSafari() && !alreadyOnHomeScreen()), []);

  if (!applies) return null;
  if (mode === "tip" && dismissed) return null;

  return (
    <div className="rounded-2xl bg-paper/85 p-3 text-left text-sm backdrop-blur-sm">
      <p className="font-semibold text-ink">
        {t("Щоб малюнки, зірочка й сад не зникали, додайте «Тихе Місце» на головний екран.")}
      </p>
      {steps && (
        <p className="mt-2 text-muted-foreground">
          {t("На iPhone: кнопка «Поділитися» → «На головний екран» → «Додати».")}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {!steps && (
          <Btn variant="soft" onClick={() => setSteps(true)}>
            {t("Як це зробити?")}
          </Btn>
        )}
        {mode === "tip" && (
          <Btn variant="ghost" onClick={dismissHomeTip}>
            {t("Зрозуміло")}
          </Btn>
        )}
      </div>
    </div>
  );
}
