import forest from "@/assets/forest.jpg";
import meadow from "@/assets/meadow.jpg";
import clouds from "@/assets/clouds.jpg";
import night from "@/assets/night.jpg";
import path from "@/assets/path.jpg";
import safe from "@/assets/safe.jpg";
import studio from "@/assets/studio.jpg";
import welcome from "@/assets/welcome.jpg";

export interface Place {
  id: string;
  name: string;
  to: string;
  image: string;
  tagline: string;
  /** position on the world map (percent) */
  x: number;
  y: number;
}

export const PLACES: Place[] = [
  { id: "garden", name: "Сад соняшників", to: "/garden", image: welcome, tagline: "Тут росте твій соняшник", x: 18, y: 56 },
  { id: "forest", name: "Ліс почуттів", to: "/forest", image: forest, tagline: "Знайомся зі своїми почуттями", x: 22, y: 30 },
  { id: "meadow", name: "Луг дихання", to: "/meadow", image: meadow, tagline: "Дихай разом із квітами", x: 50, y: 40 },
  { id: "clouds", name: "Королівство хмар", to: "/clouds", image: clouds, tagline: "Коли тривожно — тут легшає", x: 26, y: 2 },
  { id: "sky", name: "Нічне небо", to: "/sky", image: night, tagline: "Казки й тиха ніч", x: 88, y: 0 },
  { id: "studio", name: "Куточок творчості", to: "/studio", image: studio, tagline: "Малюй, що відчуваєш", x: 54, y: 64 },
  { id: "path", name: "Стежка сміливості", to: "/path", image: path, tagline: "Маленькі кроки, великі сили", x: 82, y: 24 },
  { id: "safe", name: "Моє безпечне місце", to: "/safe", image: safe, tagline: "Усе, що допомагає саме тобі", x: 82, y: 92 },
];

export const placeImage = (id: string) => PLACES.find((p) => p.id === id)!.image;
