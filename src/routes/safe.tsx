import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, X } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { placeImage } from "@/content/places";
import { ORDER } from "@/content/sequence";
import { pageHead } from "@/content/journeys";
import { addComfort, removeComfort, useStore } from "@/lib/store";

export const Route = createFileRoute("/safe")({
  head: () => pageHead("Моє безпечне місце", "Улюблені вправи й твій власний список того, що допомагає."),
  component: Safe,
});

const IDEAS = ["Обійняти іграшку", "Поговорити з мамою", "Послухати музику", "Випити теплого чаю", "Погладити кота", "Помалювати"];

function Safe() {
  const favs = useStore((s) => s.favorites);
  const comfort = useStore((s) => s.comfort);
  const [text, setText] = useState("");
  const add = (t: string) => { const v = t.trim(); if (v && !comfort.includes(v)) addComfort(v); setText(""); };
  return (
    <Scene image={placeImage("safe")} title="Моє безпечне місце" back="/world" compact>
      <div className="space-y-5 pt-[18vh]">
        <section className="paper-card space-y-3 p-5">
          <h2 className="font-display text-2xl font-bold">Що допомагає саме мені</h2>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(text); }}>
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={60} placeholder="Мені допомагає…" aria-label="Що мені допомагає" className="min-h-12 flex-1 rounded-full bg-secondary px-4 outline-none focus:ring-2 focus:ring-ring" />
            <button type="submit" className="min-h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground">Додати</button>
          </form>
          <div className="flex flex-wrap gap-2">{IDEAS.filter((i) => !comfort.includes(i)).map((i) => <Btn key={i} variant="soft" className="text-sm" onClick={() => add(i)}>+ {i}</Btn>)}</div>
          {comfort.length > 0 && <ul className="space-y-2">{comfort.map((c, i) => <li key={c} className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-2"><span>{c}</span><button onClick={() => removeComfort(i)} aria-label={`Прибрати: ${c}`} className="flex h-10 w-10 items-center justify-center"><X size={18} /></button></li>)}</ul>}
        </section>
        <section className="paper-card space-y-3 p-5">
          <h2 className="font-display text-2xl font-bold">Мої улюблені вправи</h2>
          {favs.length === 0 ? <p className="text-muted-foreground">Торкнись <Heart className="inline h-4 w-4" /> у будь-якій вправі, і вона з’явиться тут.</p> :
            <ul className="grid gap-2">{favs.map((f) => <li key={f}><Link to={f as never} className="flex min-h-12 items-center gap-2 rounded-2xl bg-secondary px-4 font-semibold"><Heart className="h-4 w-4 fill-rose text-rose" />{ORDER.find((o) => o.to === f)?.label ?? f}</Link></li>)}</ul>}
        </section>
        <p className="text-center text-sm text-muted-foreground">Усе це зберігається лише на цьому пристрої.</p>
      </div>
    </Scene>
  );
}
