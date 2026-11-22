/** Browser-only video focus; never retain a detached element after cleanup. */
let current: HTMLVideoElement | null = null;

export function claimVideo(media: HTMLVideoElement) {
  if (current && current !== media) current.pause();
  current = media;
}

export function releaseVideo(media: HTMLVideoElement) {
  if (current === media) current = null;
}
