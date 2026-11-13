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
      },
    ]}
  />
);
