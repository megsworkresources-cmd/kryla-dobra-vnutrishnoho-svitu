import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Scene, Btn } from "@/components/Scene";
import { GrownUpLink } from "@/components/GrownUpLink";
import { pageHead } from "@/content/journeys";
import { useLang } from "@/lib/i18n";
import {
  AGES, CATEGORIES, CRISIS, LIBRARY, REGIONS, RESOURCES, SERVICES, UI, VERIFIED_ON,
  type Bi, type Contact, type Resource,
} from "@/content/resources.i18n";

export const Route = createFileRoute("/resources")({
  head: () =>
    pageHead(
      "Ресурси для батьків",
      "Перевірений довідник організацій, гарячих ліній і порад для українських родин.",
    ),
  component: Resources,
});

const fmtTel = (tel: string) => tel.replace(/^(0800)(\d{3})(\d{3})$/, "$1 $2 $3");

function Phone({ c, L }: { c: Contact; L: (b: Bi) => string }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3">
      <span>
        {L(c.label)}
        {c.note && <span className="text-muted-foreground"> · {L(c.note)}</span>}
      </span>
      {c.tel && (
        <GrownUpLink href={`tel:${c.tel}`}>
          <span className="font-bold">{fmtTel(c.tel)}</span>
        </GrownUpLink>
      )}
    </li>
  );
}

function Card({ r, L }: { r: Resource; L: (b: Bi) => string }) {
  const list = (xs: string[]) => (xs.length ? xs.join(", ") : L(UI.notConfirmed));
  const initials = r.name.en.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return (
    <article className="paper-card space-y-3 p-4 text-card-foreground">
      <div className="flex items-start gap-3">
        <div aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-tight">{r.name.uk}</h3>
          {r.name.en !== r.name.uk && <p className="text-sm text-muted-foreground">{r.name.en}</p>}
          <p className="mt-1 inline-block rounded-full bg-accent/40 px-2 text-xs">{L(UI.kind[r.kind])}</p>
        </div>
      </div>
      <p className="leading-relaxed">{L(r.desc)}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold">{L(UI.services)}</dt>
        <dd>{list(r.services.map((s) => L(SERVICES[s])))}</dd>
        <dt className="font-semibold">{L(UI.ages)}</dt>
        <dd>{list(r.ages.map((a) => L(AGES[a])))}</dd>
        <dt className="font-semibold">{L(UI.where)}</dt>
        <dd>{list(r.regions.map((g) => L(REGIONS[g])))}</dd>
        <dt className="font-semibold">{L(UI.langs)}</dt>
        <dd>{list(r.langs.map((l) => L(UI.langNames[l])))}</dd>
        <dt className="font-semibold">{L(UI.cost)}</dt>
        <dd>{r.cost ? L(SERVICES[r.cost]) : L(UI.notConfirmed)}</dd>
      </dl>
      {r.contacts?.length ? (
        <div className="text-sm">
          <p className="font-semibold">{L(UI.contacts)}</p>
          <ul className="mt-1 space-y-1">{r.contacts.map((c, i) => <Phone key={i} c={c} L={L} />)}</ul>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <GrownUpLink href={r.url}>
          <span className="font-bold">{L(UI.visit)} ↗</span>
        </GrownUpLink>
        <span className="text-xs text-muted-foreground">
          {L(r.check === "ok" ? UI.checked : UI.blocked).replace("{d}", VERIFIED_ON)}
        </span>
      </div>
    </article>
  );
}

function Select<K extends string>({ label, value, onChange, options, L }: {
  label: Bi; value: string; onChange: (v: string) => void; options: Record<K, Bi>; L: (b: Bi) => string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {L(label)}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11 rounded-xl border border-border bg-card px-2 font-normal text-card-foreground">
        <option value="">{L(UI.any)}</option>
        {(Object.keys(options) as K[]).map((k) => <option key={k} value={k}>{L(options[k])}</option>)}
      </select>
    </label>
  );
}

function Resources() {
  const lang = useLang();
  const L = (b: Bi) => (lang === "en" ? b.en : b.uk);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [service, setService] = useState("");

  const found = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (cat && !r.cats.includes(cat as never)) return false;
      if (age && !r.ages.includes(age as never)) return false;
      if (region && !r.regions.includes(region as never)) return false;
      if (service && !r.services.includes(service as never) && r.cost !== service) return false;
      if (!needle) return true;
      const hay = [r.name.uk, r.name.en, r.desc.uk, r.desc.en, r.url,
        ...r.cats.flatMap((c) => [CATEGORIES[c].uk, CATEGORIES[c].en])].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [q, cat, age, region, service]);

  return (
    <Scene title="Ресурси для батьків" back="/parents">
      <div className="space-y-5">
        <p className="paper-card p-4 text-lg leading-relaxed text-card-foreground">{L(UI.intro)}</p>

        <section aria-labelledby="help-now" className="rounded-3xl border-2 border-destructive/60 bg-card p-4 text-card-foreground">
          <h2 id="help-now" className="font-display text-2xl font-bold">{L(UI.helpNow)}</h2>
          <p className="mt-1 text-sm">{L(UI.helpNote)}</p>
          <ul className="mt-3 space-y-1.5">{CRISIS.map((c, i) => <Phone key={i} c={c} L={L} />)}</ul>
        </section>

        <section aria-labelledby="find" className="space-y-3">
          <h2 id="find" className="font-display text-2xl font-bold">{L(UI.findSupport)}</h2>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L(UI.search)} aria-label={L(UI.search)}
            className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-card-foreground" />
          <div className="grid grid-cols-2 gap-2">
            <Select label={UI.topic} value={cat} onChange={setCat} options={CATEGORIES} L={L} />
            <Select label={UI.age} value={age} onChange={setAge} options={AGES} L={L} />
            <Select label={UI.place} value={region} onChange={setRegion} options={REGIONS} L={L} />
            <Select label={UI.service} value={service} onChange={setService} options={SERVICES} L={L} />
          </div>
          <div className="flex items-center justify-between text-sm" aria-live="polite">
            <span>{L(UI.shown).replace("{n}", String(found.length))}</span>
            {(q || cat || age || region || service) && (
              <Btn variant="soft" onClick={() => { setQ(""); setCat(""); setAge(""); setRegion(""); setService(""); }}>
                {L(UI.reset)}
              </Btn>
            )}
          </div>
          {found.length === 0 && <p className="paper-card p-4">{L(UI.none)}</p>}
          <div className="space-y-3">{found.map((r) => <Card key={r.id} r={r} L={L} />)}</div>
        </section>

        <section aria-labelledby="lib" className="space-y-3">
          <h2 id="lib" className="font-display text-2xl font-bold">{L(UI.library)}</h2>
          <p className="text-sm">{L(UI.libraryNote)}</p>
          {LIBRARY.map((topic) => (
            <details key={topic.title.en} className="paper-card p-4 text-card-foreground">
              <summary className="cursor-pointer font-display text-lg font-bold">{L(topic.title)}</summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed">
                {topic.tips.map((tip) => <li key={tip.en}>{L(tip)}</li>)}
              </ul>
            </details>
          ))}
        </section>

        <p className="text-sm text-muted-foreground">{L(UI.disclaimer)}</p>
      </div>
    </Scene>
  );
}
