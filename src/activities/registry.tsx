import type { ComponentType } from "react";
import type { Journey } from "@/content/journeys";
import { Breathing, RelaxBody } from "./meadow";
import { Anchor, Haven, Release, Senses, Thoughts } from "./clouds";
import { Reflect, Sounds, Story } from "./sky";
import { ColorFlower, Draw, Feel, Gallery } from "./studio";
import { Mistake, PauseFirst, Solve, Step, Talk } from "./path";
import { HeartCheck, MagicJar, SquareBreath } from "./calm";
import { MyStar } from "./star";

export const ACTIVITIES: Record<Journey, Record<string, ComponentType>> = {
  meadow: {
    flower: () => <Breathing kind="flower" />,
    wave: () => <Breathing kind="wave" />,
    relax: RelaxBody,
    square: SquareBreath,
  },
  clouds: {
    senses: Senses,
    release: Release,
    haven: Haven,
    thoughts: Thoughts,
    anchor: Anchor,
    jar: MagicJar,
  },
  sky: {
    lantern: () => <Story id="lantern" />,
    bridge: () => <Story id="bridge" />,
    seed: () => <Story id="seed" />,
    rain: () => <Story id="rain" />,
    sleep: () => <Story id="sleep" />,
    reflect: Reflect,
    sounds: Sounds,
    star: MyStar,
  },
  studio: { draw: Draw, color: ColorFlower, feel: Feel, gallery: Gallery, heart: HeartCheck },
  path: { step: Step, pause: PauseFirst, talk: Talk, solve: Solve, mistake: Mistake },
};
