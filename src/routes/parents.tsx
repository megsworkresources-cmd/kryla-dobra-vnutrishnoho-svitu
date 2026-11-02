import { createFileRoute } from "@tanstack/react-router";
import { Scene } from "@/components/Scene";

export const Route = createFileRoute("/parents")({
  head: () => ({
    meta: [
      { title: "Для дорослих — Тихе Місце" },
      { name: "description", content: "Як Тихе Місце дбає про приватність і безпеку дітей." },
      { property: "og:title", content: "Для дорослих — Тихе Місце" },
      { property: "og:description", content: "Приватність, безпека та призначення застосунку." },
    ],
  }),
  component: () => (
    <Scene title="Для дорослих" back="/">
      <div className="paper-card space-y-3 p-5 text-base">
        <p>Тихе Місце допомагає дітям 5–13 років пізнавати почуття й вчитися заспокоюватися.</p>
        <p>Без акаунтів, реклами й повідомлень. Усе, що робить дитина, зберігається лише на цьому пристрої.</p>
        <p>Застосунок не ставить діагнозів і не замінює допомогу фахівця. Якщо дитині важко тривалий час — зверніться до психолога.</p>
      </div>
    </Scene>
  ),
});
