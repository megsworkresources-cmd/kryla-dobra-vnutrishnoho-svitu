import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Btn, Scene } from "@/components/Scene";
import { pageHead } from "@/content/journeys";
import { setAge, update, useStore, type AgeBand, type AppState } from "@/lib/store";
import { MUSIC_STYLES, playAmbient, sfx, syncVolume, unlockAudio } from "@/lib/audio";
import { speak, stopSpeaking, voices } from "@/lib/speak";

export const Route = createFileRoute("/settings")({
  head: () => pageHead("Налаштування", "Звук, голоси персонажів, музика, розмір тексту й рух на екрані."),
  component: Settings,
});

const set = <K extends keyof AppState>(k: K, v: AppState[K]) => { update((s) => ({ ...s, [k]: v })); syncVolume(); };

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-secondary px-4 py-2 ${disabled ? "opacity-50" : ""}`}>
      <span><span className="block font-bold">{label}</span>{hint && <span className="block text-sm text-muted-foreground">{hint}</span>}</span>
      <input type="checkbox" role="switch" className="h-7 w-7 accent-primary" checked={checked} disabled={disabled} onChange={(e) => { onChange(e.target.checked); sfx("tap"); }} />
    </label>
  );
}
const Section = ({ title, children }: { title: string; children: ReactNode }) => <section className="paper-card space-y-3 p-5"><h2 className="font-display text-2xl font-bold">{title}</h2>{children}</section>;

function Settings() {
  const s = useStore((x) => x);
  const [list, setList] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => setList(voices());
    load();
    if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", load); };
  }, []);
  const off = !s.sound;
  return (
    <Scene title="Налаштування" back="/world">
      <div className="space-y-5">
        <Section title="🔊 Звук">
          <Toggle label="Увесь звук" hint="Головний вимикач" checked={s.sound} onChange={(v) => { unlockAudio(); set("sound", v); if (!v) stopSpeaking(); }} />
          <label className="block rounded-2xl bg-secondary px-4 py-3">
            <span className="flex justify-between font-bold">Гучність <span>{Math.round(s.volume * 100)}%</span></span>
            <input type="range" min={0} max={1} step={0.05} value={s.volume} disabled={off} aria-label="Гучність"
              onChange={(e) => set("volume", Number(e.target.value))} onPointerUp={() => sfx("select")} className="mt-2 w-full accent-primary" />
          </label>
          <Toggle label="Фонова музика й природа" hint="Легкі українські мелодії та природа" checked={s.music} disabled={off} onChange={(v) => { unlockAudio(); set("music", v); playAmbient(v ? "garden" : null); }} />
          <fieldset className={`rounded-2xl bg-secondary px-4 py-3 ${off || !s.music ? "opacity-50" : ""}`} disabled={off || !s.music}>
            <legend className="sr-only">Яка музика</legend>
            <span className="block font-bold">Яка музика звучить</span>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {MUSIC_STYLES.map((m) => (
                <button key={m.id} type="button" aria-pressed={s.musicStyle === m.id}
                  onClick={() => { unlockAudio(); update((x) => ({ ...x, musicStyle: m.id })); playAmbient("garden"); sfx("select"); }}
                  className={`min-w-0 rounded-2xl bg-background px-4 py-3 text-left transition active:scale-95 ${s.musicStyle === m.id ? "ring-4 ring-ring" : ""}`}>
                  <span className="block font-bold">{m.name}</span>
                  <span className="block text-sm text-muted-foreground">{m.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <Toggle label="Звуки кнопок" hint="М’які сигнали при натисканні й завершенні" checked={s.sfx} disabled={off} onChange={(v) => set("sfx", v)} />
          <Btn variant="soft" disabled={off} onClick={() => { unlockAudio(); sfx("complete"); }}>Перевірити звук</Btn>
        </Section>
        <Section title="🗣 Голоси персонажів">
          <Toggle label="Читати вголос автоматично" hint="Персонажі самі промовляють інструкції. Текст завжди видно на екрані." checked={s.voice} disabled={off} onChange={(v) => set("voice", v)} />
          {list.length > 0 ? (
            <label className="block rounded-2xl bg-secondary px-4 py-3 font-bold">Голос
              <select value={s.voiceURI} onChange={(e) => set("voiceURI", e.target.value)} disabled={off} className="mt-2 block min-h-12 w-full rounded-xl bg-paper px-3 font-normal">
                <option value="">Автоматично (український)</option>
                {list.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
              </select>
            </label>
          ) : <p className="text-sm text-muted-foreground">На цьому пристрої немає вбудованих голосів — інструкції завжди написані текстом.</p>}
          <Btn variant="soft" disabled={off} onClick={() => speak("Привіт! Я Соломія. Так звучить мій голос.", { force: true })}>Послухати голос</Btn>
        </Section>
        <Section title="👀 Екран">
          <p className="font-bold">Розмір тексту</p>
          <div className="flex gap-2">{([["normal", "Звичайний"], ["large", "Більший"], ["xl", "Великий"]] as const).map(([k, l]) => <Btn key={k} variant={s.textSize === k ? "primary" : "soft"} aria-pressed={s.textSize === k} onClick={() => set("textSize", k)} className="flex-1">{l}</Btn>)}</div>
          <Toggle label="Менше руху на екрані" checked={s.reduceMotion} onChange={(v) => set("reduceMotion", v)} />
        </Section>
        <Section title="🎂 Мій вік">
          <p className="text-sm text-muted-foreground">Від віку залежать слова в деяких вправах.</p>
          <div className="flex gap-2">{([["young", "5–7"], ["mid", "8–10"], ["older", "11–13"]] as [AgeBand, string][]).map(([k, l]) => <Btn key={k} variant={s.age === k ? "primary" : "soft"} aria-pressed={s.age === k} onClick={() => setAge(k)} className="flex-1">{l}</Btn>)}</div>
        </Section>
        <Section title="📍 Мій шлях">
          <p>Вже зроблено маленьких справ: <b>{Object.values(s.completed).reduce((a, b) => a + b, 0)}</b></p>
          <div className="flex flex-wrap gap-2">
            <Link to="/safe" className="flex min-h-12 items-center rounded-full bg-secondary px-5 font-bold">Мої улюблені</Link>
            <Link to="/friends" className="flex min-h-12 items-center rounded-full bg-secondary px-5 font-bold">Мої друзі-персонажі</Link>
            <Link to="/parents" className="flex min-h-12 items-center rounded-full bg-secondary px-5 font-bold">Для дорослих</Link>
          </div>
          <p className="text-sm text-muted-foreground">Усі налаштування зберігаються лише на цьому пристрої.</p>
        </Section>
      </div>
    </Scene>
  );
}
