import { CharacterSay } from "@/components/Character";
import { useEffect, useState } from "react";
import { Btn, DoneCard } from "@/components/Scene";
import { Practice } from "@/components/Practice";
import { markDone } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Senses = () => (
  <Practice
    id="clouds-senses"
    ending="Ти повернувся сюди, у цю мить. Це вміння завжди з тобою."
    steps={[
      {
        title: "П’ять речей, які бачиш",
        text: "Озирнися повільно. Знайди очима кожну з п’яти — і торкнись, коли помітиш.",
        checklist: ["Щось синє", "Щось кругле", "Щось яскраве", "Щось далеке", "Щось зовсім поруч"],
        response: "П’ять опор уже знайдено. Очі повернули тебе в цю кімнату.",
      },
      {
        title: "Чотири, яких можна торкнутися",
        text: "Поклади долоні на щось поруч і відчуй різницю між поверхнями.",
        checklist: ["Гладеньке", "Тепле", "Прохолодне", "М’яке"],
        response: "Тіло теж розповідає, де ти зараз.",
      },
      {
        title: "Три звуки",
        text: "Прислухайся. Може, гудіння, кроки, вітер або власне дихання.",
        checklist: ["Голос", "Кроки або рух", "Тихий фон"],
        response: "Звуки навколо — ще один спосіб бути тут.",
      },
      {
        title: "Два запахи",
        text: "Що ти відчуваєш носом? Якщо нічого — це теж нормально.",
        checklist: ["Знайомий запах", "Запах повітря"],
        response: "Навіть ледь помітний запах повертає увагу до тіла.",
      },
      {
        title: "Одна приємна річ",
        text: "Знайди одну річ, яка тобі зараз подобається.",
        options: ["Щось, що я бачу", "Щось, що я чую", "Щось у собі"],
        response: "Гарний вибір. Можеш затриматися поглядом на ній.",
      },
    ]}
  />
);

export function Release() {
  const t = useT();
  const [text, setText] = useState("");
  const [flying, setFlying] = useState(false);
  const [done, setDone] = useState(false);
  const [where, setWhere] = useState<string | null>(null);
  useEffect(() => {
    if (!flying) return;
    // Completion must not depend on a CSS animation (reduced-motion disables it).
    const timer = window.setTimeout(() => {
      markDone("clouds-release");
      setDone(true);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [flying]);
  if (done)
    return (
      <div className="space-y-3">
        <DoneCard
          text={t("Хмаринка полетіла. Якщо турбота повернеться — ти знаєш, де її відпустити.")}
          again={() => {
            setText("");
            setFlying(false);
            setDone(false);
            setWhere(null);
          }}
        />
        {where && (
          <p className="paper-card p-4 text-center text-sm font-semibold">
            {t("Ти помітив, що вона живе {place}. Помічене вже не керує тобою так, як непомічене.", {
              place: t(where).toLowerCase(),
            })}
          </p>
        )}
      </div>
    );
  return (
    <div className="space-y-5 text-center">
      <CharacterSay
        who="daryna"
        size="sm"
        mood="calm"
        action={flying ? "look" : undefined}
        text={t(
          "Напиши або просто подумай про те, що тебе турбує. Ніхто цього не побачить — навіть цей пристрій не збереже.",
        )}
      />
      <div className="paper-card space-y-2 p-4 text-left">
        <p className="font-bold">{t("Де ти відчуваєш цю турботу зараз?")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {["У животі", "У грудях", "У горлі", "У плечах"].map((place) => (
            <Btn
              key={place}
              variant={where === place ? "primary" : "soft"}
              aria-pressed={where === place}
              onClick={() => setWhere(where === place ? null : place)}
              className="h-auto py-3"
            >
              {t(place)}
            </Btn>
          ))}
        </div>
        <p className="text-sm opacity-75">
          {t("Можна пропустити — точне місце не обов’язкове.")}
        </p>
      </div>
      <div
        className={`paper-card mx-auto max-w-md rounded-[3rem] p-6 ${flying ? "animate-rise-away" : ""}`}
      >
        <span className="text-5xl" aria-hidden>
          ☁
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          rows={3}
          aria-label={t("Моя турбота")}
          placeholder={t("Мене турбує…")}
          className="mt-2 w-full resize-none rounded-2xl bg-secondary p-3 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {!flying && <Btn onClick={() => setFlying(true)}>{t("Відпустити хмарку")}</Btn>}
    </div>
  );
}

export const Haven = () => (
  <Practice
    id="clouds-haven"
    ending="Твоя галявина залишається в уяві. Повертайся туди будь-коли."
    steps={[
      {
        title: "Стежка до галявини",
        action: "breathe",
        text: "Уяви м’яку стежку між високими травами. Під ногами тепла земля, над головою пливуть пухнасті хмари.",
      },
      {
        title: "Яка твоя галявина?",
        text: "Обери, що там є.",
        options: ["Соняшники", "Струмок", "Велике дерево", "Світлячки"],
        icons: {
          Соняшники: "🌻",
          Струмок: "💧",
          "Велике дерево": "🌳",
          Світлячки: "✨",
        },
        vision: true,
        response: "Чудово. Уяви це якомога ясніше — кольори, звуки, тепло.",
      },
      {
        title: "Хто поруч?",
        text: "Тут можна бути самому або з кимось, хто приносить спокій.",
        options: ["Я сам", "Улюблена тварина", "Близька людина"],
        icons: {
          "Я сам": "🧒",
          "Улюблена тварина": "🐱",
          "Близька людина": "🤗",
        },
        vision: true,
        response: "Тепер на твоїй галявині є все, що треба для спокою.",
      },
      {
        title: "Відпочинок",
        action: "settle",
        text: "Сядь на теплу траву. Послухай, як шелестить листя. Тут нічого не треба робити.",
      },
      {
        title: "Повернення",
        text: "Повільно поверни увагу в кімнату. Поворуши пальцями. Галявина нікуди не зникне.",
      },
    ]}
  />
);

export const Thoughts = () => (
  <Practice
    id="clouds-thoughts"
    ending="Думки — це не завжди факти. Ти вмієш подивитися на них з різних боків."
    steps={[
      {
        title: "Помітити думку",
        text: "Іноді думка каже: «У мене нічого не вийде». Яка думка буває в тебе?",
        options: ["Нічого не вийде", "Мене не люблять", "Станеться щось погане", "Інша думка"],
      },
      {
        title: "Що допомагає їй вірити?",
        text: "Подумай: що було, коли ця думка здавалася правдою? Це нормально — так буває в усіх.",
      },
      {
        title: "А що каже інше?",
        text: "Чи був випадок, коли все вийшло трохи краще, ніж думка обіцяла?",
        options: ["Так, був", "Не впевнений", "Поки не пригадую"],
        response: "Навіть маленький приклад — уже інший бік історії.",
      },
      {
        title: "Що сказав би друг?",
        text: "Якби твій друг мав таку думку, що б ти йому сказав? Можеш сказати це й собі.",
      },
      {
        title: "Нова думка",
        text: "Обери думку, яка звучить чесно й тепліше.",
        options: [
          "Я можу спробувати",
          "Це важко, але я не сам",
          "Я не знаю, що буде, і це нормально",
        ],
      },
      {
        title: "Тепліша думка",
        text: "Тепер скажи її своїми словами — так, ніби говориш другові.",
        write: {
          label: "Тепліша думка своїми словами",
          placeholder: "Перепиши її так, щоб було чесно й тепліше.",
        },
        response: "Думка, яку ти написав сам, звучить найпереконливіше.",
      },
    ]}
  />
);

export const Anchor = () => (
  <Practice
    id="clouds-anchor"
    ending="Одна хвилина — і ти вже трохи ближче до себе."
    steps={[
      {
        title: "Стоп",
        text: "Зупинись. Нічого не треба вирішувати просто зараз.",
      },
      {
        title: "Ступні",
        text: "Притисни ступні до підлоги. Відчуй, що вона тебе тримає.",
      },
      {
        title: "Видих",
        text: "Зроби повільний видих, ніби дмухаєш на гарячий чай.",
      },
      {
        title: "Поруч",
        text: "Скажи собі: «Мені зараз важко, і я дбаю про себе». Можна покликати дорослого, якому довіряєш.",
      },
    ]}
  />
);
