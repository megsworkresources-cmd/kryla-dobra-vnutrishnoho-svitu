import { useRef, useState } from "react";
import { Btn } from "@/components/Scene";
import { useT } from "@/lib/i18n";
import { exportDeviceState, importDeviceState, useStore } from "@/lib/store";
import { backupFileName, backupText, mergeStates, readBackup } from "@/lib/store-backup";

type Status = "idle" | "saved" | "restored" | "invalid" | "blocked";

const MESSAGE: Record<Exclude<Status, "idle">, string> = {
  saved: "Копію збережено у файл. Тримайте його там, де не загубиться.",
  restored: "Відновлено. Нічого не видалено — додано те, чого бракувало.",
  invalid: "Це не файл копії «Тихого Місця».",
  blocked: "Не вдалося записати на пристрій. Перевірте вільне місце.",
};

/**
 * A grown-up saves the device store to a file and puts it back later. Both directions stay
 * on this device: the browser writes the file, and the browser reads the one they pick.
 */
export function DeviceBackup() {
  const t = useT();
  const state = useStore((s) => s);
  const [status, setStatus] = useState<Status>("idle");
  const file = useRef<HTMLInputElement>(null);

  const save = () => {
    const url = URL.createObjectURL(new Blob([backupText(state)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = backupFileName();
    link.click();
    // Safari cancels a download whose URL is revoked in the same tick.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setStatus("saved");
  };

  const restore = async (picked: File) => {
    const parsed = readBackup(await picked.text());
    if (!parsed) {
      setStatus("invalid");
      return;
    }
    const merged = mergeStates(exportDeviceState(), parsed);
    setStatus(importDeviceState(merged) ? "restored" : "blocked");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t("Копія — це файл на цьому пристрої. Нічого не надсилається в інтернет.")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={save}>{t("Завантажити копію")}</Btn>
        <Btn variant="soft" onClick={() => file.current?.click()}>
          {t("Відновити з копії")}
        </Btn>
      </div>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        aria-label={t("Файл копії")}
        className="sr-only"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          // Choosing the same file twice must restore it twice, so clear the picker.
          event.target.value = "";
          if (picked) void restore(picked);
        }}
      />
      <p role="status" aria-live="polite" className="text-sm font-semibold">
        {status === "idle" ? "" : t(MESSAGE[status])}
      </p>
    </div>
  );
}
