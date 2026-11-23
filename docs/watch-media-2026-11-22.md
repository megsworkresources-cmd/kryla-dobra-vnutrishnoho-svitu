# Watch media wiring — 2026-11-22

## Current app films

The six existing Watch cards retain their app-owned MP4 mappings and illustrated posters:

| Watch card | Film |
| --- | --- |
| sunflower | `sunflower-story-full.mp4` |
| hedgehog | `lantern-story-full.mp4` |
| kite | `kite-story-full.mp4` |
| bridge | `bridge-story-full.mp4` |
| paints | `painting-friends.mp4` |
| lullaby | `goodnight-friends.mp4` |

The cards have explicit accessible Play names. The shared player keeps play/pause and posters; a failed Watch film now unmounts the broken video, reveals the original illustrated story, explains the fallback in Ukrainian or English, and offers a retry control.

## Requested uploaded set — blocked

At 00:08 UTC on 2026-11-22, neither `/mnt/user-uploads/` nor `/tmp/user-uploads/` contained any MP4, MOV or WebM file. A wider accessible-path search found no `Shadow_to_Bloom` or `output_720x1280` filename, and `app-source-code.zip` contained no video entries. Therefore the three reported Hailuo variants could not be inspected, uploaded to CDN storage, or substituted for the existing sunflower film.

The three reported `output_720x1280...mp4` variants remain excluded because the user identified them as Renderforest-watermarked versions of one scene. No watermark removal, cropping, or clean-export claim is made.

This pass does not claim that the six externally referenced uploads were integrated. It verifies and improves the six films already present in the app without inventing replacement media.

## Verification

- Real Chromium playback: all six films advanced past 0.08 seconds, then paused and resumed, in Ukrainian at 393×852 and English at 1280×1800. Every card poster loaded and every player had a poster.
- Forced sunflower MP4 network failure: the video detached, the illustrated story appeared, the next caption remained usable, and Retry restored real video playback.
- Screenshots reviewed for the six-card grid, active playback and illustrated fallback; no page errors or horizontal overflow occurred.
- Focused checks: 23 tests passed. Full suite: 58 files / 303 tests passed. Full lint exited 0. The latest managed build entry reports `build OK`.
- The existing media/caregiver acceptance script passed its real Watch playback/exit checks in Ukrainian and English at phone/desktop sizes and all four signed-out caregiver entry checks. Its authenticated garden scenarios reported `Blocked: injected authenticated adult session unavailable`; this pass made no garden changes.

Physical iPhone Safari playback was not tested; no physical device is available. No deployment, publishing, backend or data changes were made.
