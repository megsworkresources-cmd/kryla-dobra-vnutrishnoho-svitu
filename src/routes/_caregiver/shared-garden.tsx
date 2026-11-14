import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, RefreshCw, Sprout } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { pageHead } from "@/content/journeys";
import { readGarden, shareSunflower } from "@/lib/shared-garden.functions";
import { growthStage, totalDone, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import recorded from "@/assets/video/recorded-sunflower-growth.mp4.asset.json";
import meadow from "@/assets/meadow.jpg";

export const Route = createFileRoute("/_caregiver/shared-garden")({
  head: () => pageHead("Спільний сад", "Анонімні соняшники з добровільною згодою дорослих. Малюнки й почуття залишаються приватними."),
  component: SharedGarden,
});

function SharedGarden() {
  const t = useT();
  const { caregiver } = Route.useRouteContext();
  const client = useQueryClient();
  const read = useServerFn(readGarden);
  const share = useServerFn(shareSunflower);
  const completed = useStore((s) => s.completed);
  const localStage = growthStage(totalDone(completed));
  const key = ["shared-garden", caregiver.userId];
  const garden = useQuery({ queryKey: key, queryFn: () => read(), refetchInterval: 30000, retry: false });
  const [consent, setConsent] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mutation = useMutation({
    mutationFn: (sharing: boolean) => share({ data: { stage: sharing ? localStage : 0, sharing } }),
    onSuccess: async () => { setConsent(false); await client.invalidateQueries({ queryKey: key }); },
    retry: false,
  });
  const own = garden.data?.own;
  return (
    <Scene title="Спільний сад" back="/parents">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{t("Один соняшник на акаунт дорослого. Оновлення надсилаються лише за вашим натисканням; вимкнення приховує квітку, не змінюючи даних дитини.")}</p>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">{t("Мій соняшник")}</h2>
          <p>{t("Стадія {n} з 5", { n: Math.max(localStage, own?.stage ?? 0) })}</p>
          <p role="status" className="font-bold text-primary">{t(own?.sharing ? "Соняшник поширено" : "Поширення вимкнено")}</p>
          {garden.isPending && <p role="status">{t("Сад завантажується…")}</p>}
          {(garden.isError || mutation.isError) && <p role="alert" className="text-destructive">{t("Сад недоступний. Спробуйте ще раз.")}</p>}
          {own && !own.sharing && <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
            <span>{t("Я погоджуюся поширити лише анонімну стадію росту соняшника. Імена, малюнки, почуття й записи про вправи залишаються на пристрої.")}</span>
          </label>}
          <div className="flex flex-wrap gap-2">
            {own?.sharing ? <>
              <Btn disabled={mutation.isPending} onClick={() => mutation.mutate(true)}><Sprout size={18}/>{t("Оновити соняшник")}</Btn>
              <Btn variant="soft" disabled={mutation.isPending} onClick={() => mutation.mutate(false)}>{t("Припинити поширення")}</Btn>
            </> : <Btn disabled={!consent || !own || mutation.isPending} onClick={() => mutation.mutate(true)}>{t("Поділитися соняшником")}</Btn>}
            <Btn variant="soft" disabled={garden.isFetching} onClick={() => void garden.refetch()}><RefreshCw size={18}/>{t("Оновити сад")}</Btn>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">{t("Соняшники інших родин")}</h2>
          {garden.data && !garden.data.flowers.length && <p>{t("Поки що немає спільних соняшників.")}</p>}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {garden.data?.flowers.map((flower) => <li key={flower.flower_id} className="paper-card p-4 text-center">
              <span aria-hidden className="block text-5xl">{["🌰", "🌱", "🌿", "🌿", "🌼", "🌻"][flower.stage]}</span>
              <p className="mt-3 text-sm font-bold">{t("Стадія {n} з 5", { n: flower.stage })}</p>
            </li>)}
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">{t("Справжній запис росту соняшника")}</h2>
          <div className="relative mx-auto aspect-[440/768] w-full max-w-64 overflow-hidden rounded-lg bg-secondary">
            <StoryFilm src={recorded.url} poster={meadow} playing={playing} onPause={() => setPlaying(false)}/>
          </div>
          <div className="text-center"><Btn onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18}/> : <Play size={18}/>}{t(playing ? "Пауза" : "Дивитися")}</Btn></div>
          <p className="text-sm text-muted-foreground"><a href="https://commons.wikimedia.org/wiki/File:Sunflower_growing_time_lapse.gif" target="_blank" rel="noreferrer" className="underline">{t("Відео: Naturenow, CC BY-SA 4.0; перетворено з GIF у MP4.")}</a> <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY-SA 4.0</a></p>
        </section>
      </div>
    </Scene>
  );
}