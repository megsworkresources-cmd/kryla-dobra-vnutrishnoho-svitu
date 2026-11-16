import lantern from "@/assets/video/lantern-story-full.mp4.asset.json";
import sunflower from "@/assets/video/sunflower-field.mp4.asset.json";
import kite from "@/assets/video/kite-breeze.mp4.asset.json";
import bridge from "@/assets/video/bridge-friends.mp4.asset.json";
import paints from "@/assets/video/painting-friends.mp4.asset.json";
import goodnight from "@/assets/video/goodnight-friends.mp4.asset.json";
import woodland from "@/assets/video/woodland-bridge.mp4.asset.json";
import rain from "@/assets/video/rain-friends.mp4.asset.json";

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
  rain: rain.url,
};

/** The animal bridge story is distinct from the caregiver cartoon’s human cast. */
export const SKY_MEDIA: Record<string, string> = { ...STORY_MEDIA, bridge: woodland.url };
