import lantern from "@/assets/video/lantern-friends.mp4.asset.json";
import sunflower from "@/assets/video/sunflower-field.mp4.asset.json";
import kite from "@/assets/video/kite-breeze.mp4.asset.json";
import bridge from "@/assets/video/bridge-friends.mp4.asset.json";
import paints from "@/assets/video/painting-friends.mp4.asset.json";
import goodnight from "@/assets/video/goodnight-friends.mp4.asset.json";

export const STORY_MEDIA: Record<string, string> = {
  hedgehog: lantern.url,
  lantern: lantern.url,
  sunflower: sunflower.url,
  seed: sunflower.url,
  kite: kite.url,
  bridge: bridge.url,
  paints: paints.url,
  lullaby: goodnight.url,
  sleep: goodnight.url,
};
