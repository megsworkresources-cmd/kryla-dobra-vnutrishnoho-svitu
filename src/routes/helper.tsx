import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import night from '@/assets/night.jpg';
import { Btn, Scene } from '@/components/Scene';
import { CharacterSay } from '@/components/Character';
import { CATALOG, KIND } from '@/content/catalog';
import { EMOTIONS } from '@/content/emotions';
import { suggest } from '@/lib/suggest.functions';
import { markDone, useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';

const QUICK = ['я сумую', 'мені страшно', 'я злюся', 'мене кривдять', 'мені нудно', 'я радію', 'у мене багато думок', 'я не можу заснути'];

/** The Feelings Helper — the only place a child's words leave the device, sent once and never stored. */
export default function Helper() {
  const t = useT();
  const navigate = useNavigate();
  const age = useStore((s) => s.age);
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [reply, setReply] = useState<{ text: string; picks: string[]; cheer?: string } | null>(null);
  const ask = async (input: string) => {
    if (!input.trim()) return;
    sfx(); setState('loading');
    const result = await suggest({ data: { message: input, age } });
    if (result) setReply(result); else setState('error');
  };
  const sfx = () => {};
  return (
    <Scene image={night} night title="Помічник почуттів" back="/world">
      <div className="space-y-4">
        <div className="night-card p-5 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-honey text-2xl" aria-hidden><Sparkles /></span>
          <h2 className="mt-2 font-display text-2xl font-bold">{t('Розкажи, як ти')}</h2>
          <p className="mt-1 text-sm opacity-80">{t('Персонажі підкажуть вправу саме для тебе. Це єдине місце, де твої слова вирушають у подорож — один раз, і ніхто їх не зберігає.')}</p>
        </div>
        {!reply && (
          <div className="space-y-3">
            <p className="font-bold">{t('Або обери:')}</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((q) => <button key={q} onClick={() => { setText(q); ask(q); }} className="min-h-11 rounded-full bg-secondary px-4 text-sm font-bold">{t(q)}</button>)}
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.slice(0, 6).map((e) => <button key={e.id} onClick={() => { const q = t(e.name).toLowerCase(); setText(q); ask(q); }} className="flex min-h-11 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-bold"><span className={`h-3 w-3 rounded-full ${e.color}`} />{t(e.name)}</button>)}
            </div>
            <div className="night-card p-4">
              <label htmlFor="feeling" className="block font-bold">{t('Або напиши своїми словами')}</label>
              <textarea id="feeling" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={300} placeholder={t('Наприклад: мені сумно, бо…')} className="mt-2 w-full resize-none rounded-2xl bg-secondary p-3 text-base outline-none focus:ring-2 focus:ring-ring" />
              <Btn onClick={() => ask(text)} className="mt-3 w-full" disabled={state === 'loading'}>{state === 'loading' ? t('Персонажі думають…') : t('Підказати вправу')}</Btn>
            </div>
            {state === 'error' && <p className="paper-card p-4 text-center" role="alert">{t('Персонажі тимчасово недоступні. Спробуй пізніше.')}</p>}
          </div>
        )}
        {reply && (
          <div className="animate-fade-up space-y-4">
            <CharacterSay who="s" night mood="talk" size="lg" text={reply.text} />
            {reply.cheer && <CharacterSay who="h" night side="right" size="sm" mood="cheer" text={reply.cheer} />}
            <div className="night-card p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-moon">{t('Спробуй це')}</p>
              <ul className="mt-2 space-y-2">
                {reply.picks.map((key) => {
                  const it = CATALOG.find((x) => x.key === key);
                  if (!it) return null;
                  return (
                    <li key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary p-3">
                      <span className="font-bold">{t(KIND[it.kind])}: {t(it.title)}</span>
                      <Btn onClick={() => { markDone('helper'); navigate({ to: it.to as never }); }} aria-label={t('Далі: {l}', { l: t(it.title) })}>{t('Далі')}</Btn>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs opacity-70">{t('Схованих підказок немає — це ті самі вправи світу.')}</p>
            </div>
            <Btn variant="soft" onClick={() => { setReply(null); setText(''); setState('idle'); }} className="w-full">{t('Розказати ще раз')}</Btn>
          </div>
        )}
        <p className="text-center text-sm opacity-70">
          {t('Твої почуття — важливі. Якщо тобі страшно чи боляче, розкажи дорослому, якому довіряєш.')}<br />
          <Link to="/parents" className="underline">{t('Інформація для дорослих')}</Link>
        </p>
      </div>
    </Scene>
  );
}
