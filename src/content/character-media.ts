import type { CharId } from "@/content/characters";
import solomiya from "@/assets/video/character-solomiya.mp4.asset.json";
import taras from "@/assets/video/character-taras.mp4.asset.json";
import olenka from "@/assets/video/character-olenka.mp4.asset.json";
import marko from "@/assets/video/character-marko.mp4.asset.json";
import daryna from "@/assets/video/character-daryna.mp4.asset.json";
import lihtaryk from "@/assets/video/character-lihtaryk.mp4.asset.json";

/** Silent, app-owned character loops. The illustrations remain the reduced-motion fallback. */
export const CHARACTER_MEDIA: Record<CharId, string> = {
  solomiya: solomiya.url,
  taras: taras.url,
  olenka: olenka.url,
  marko: marko.url,
  daryna: daryna.url,
  lihtaryk: lihtaryk.url,
};
