import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The four places a child meets recorded footage: the cartoon player, the sky story,
 * the character portrait loop and the garden growth film.
 *
 * jsdom can mount all of them and none of them play. These tests run in WebKit at an
 * iPhone viewport and answer what jsdom cannot: does the film actually start, does
 * currentTime move, does pause/play leave the picture agreeing with the label, and does
 * iOS get the inline, muted attributes that keep Safari from refusing or hijacking it.
 */

interface Playback {
  paused: boolean;
  time: number;
  duration: number;
  readyState: number;
  muted: boolean;
  playsInline: boolean;
  loop: boolean;
  error: number | null;
}

const read = (video: Locator): Promise<Playback> =>
  video.evaluate((element) => {
    const media = element as HTMLVideoElement;
    return {
      paused: media.paused,
      time: media.currentTime,
      duration: Number.isFinite(media.duration) ? media.duration : 0,
      readyState: media.readyState,
      muted: media.muted,
      playsInline: media.playsInline,
      loop: media.loop,
      error: media.error ? media.error.code : null,
    };
  });

/** Collect failures jsdom would never surface: a media request Safari rejected, or a decode error. */
function watchMedia(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/video|media|play\(\)|AbortError|NotSupportedError|decode/i.test(text)) {
      problems.push(`console: ${text}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("/media/video/")) {
      problems.push(`request failed: ${request.url()} ${request.failure()?.errorText ?? ""}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().includes("/media/video/") && response.status() >= 400) {
      problems.push(`media ${response.status()}: ${response.url()}`);
    }
  });
  return problems;
}

const PLAY_CONTROL = /^(Грати відео|Грати|Дивитися|Дивитися ріст)$/;

/**
 * Wait for real playback. iOS may refuse the autoplay, which is exactly why the app has
 * its own tap-to-play control; when it does, the test takes that path instead of failing.
 */
async function expectPlaying(page: Page, video: Locator, options: { loops?: boolean } = {}) {
  await expect(video).toBeVisible();
  // Metadata first: a blocked autoplay stops at HAVE_METADATA, so wait for 2 only after
  // the tap below, or a refused autoplay would look like a broken file.
  await expect
    .poll(async () => (await read(video)).readyState, {
      message: "the video element should load its metadata",
    })
    .toBeGreaterThanOrEqual(1);

  const before = await read(video);
  expect(before.playsInline, "without playsinline iOS takes the film fullscreen").toBe(true);
  expect(before.muted, "a silent film must be muted to autoplay on iOS").toBe(true);
  expect(before.error, "the video element reports a media error").toBeNull();

  if (before.paused) {
    const play = page.getByRole("button", { name: PLAY_CONTROL }).first();
    if (await play.isVisible().catch(() => false)) await play.click();
  }

  await expect
    .poll(async () => (await read(video)).readyState, {
      message: "the film should have picture data once playing",
    })
    .toBeGreaterThanOrEqual(2);
  await expect
    .poll(async () => (await read(video)).time, {
      message: "currentTime should advance once the film is playing",
    })
    .toBeGreaterThan(0.2);

  const first = (await read(video)).time;
  await page.waitForTimeout(1200);
  const second = await read(video);
  if (options.loops) {
    // A stage shows one slice of the recording on repeat, so the clock wraps back to the
    // slice start instead of only ever growing; movement is the proof, not a bigger number.
    expect(second.time, "the repeating slice stopped moving").not.toBe(first);
  } else {
    expect(second.time, "the picture should still be moving a moment later").toBeGreaterThan(first);
  }
  expect(second.paused, "the film stopped on its own").toBe(false);
}

/** Pause through the visible control, resume through the visible control, and check the picture followed. */
async function pauseAndResume(
  page: Page,
  video: Locator,
  playLabel: RegExp,
  options: { loops?: boolean } = {},
) {
  await page.getByRole("button", { name: "Пауза" }).first().click();
  await expect
    .poll(async () => (await read(video)).paused, { message: "Pause should stop the film" })
    .toBe(true);

  await page.getByRole("button", { name: playLabel }).first().click();
  await expect
    .poll(async () => (await read(video)).paused, { message: "Play should restart the film" })
    .toBe(false);

  const started = (await read(video)).time;
  await page.waitForTimeout(1000);
  const resumed = await read(video);
  if (options.loops) {
    // Resuming a stage slice can land on a wrap, so require movement, not a later frame.
    expect(resumed.time, "the resumed film is not moving").not.toBe(started);
  } else {
    expect(resumed.time, "the resumed film is not advancing").toBeGreaterThan(started);
  }
}

test.describe("iPhone WebKit film smoke", () => {
  test("cartoon player: the film starts, pauses and resumes", async ({ page }) => {
    const problems = watchMedia(page);
    await page.goto("/watch");
    await page
      .getByRole("button", { name: /^Грати:/ })
      .first()
      .click();

    const video = page.locator("video").first();
    await expectPlaying(page, video);
    await pauseAndResume(page, video, /^Грати$/);

    expect(problems).toEqual([]);
  });

  test("sky story: the recorded story plays under its caption", async ({ page }) => {
    const problems = watchMedia(page);
    await page.goto("/sky/lantern");

    const film = page.getByRole("region", { name: "Відео-казка" });
    await expect(film).toBeVisible();
    await expect(
      page.getByText("Під великим соняшником сидів їжачок", { exact: false }),
    ).toBeVisible();

    await expectPlaying(page, film.locator("video"));
    expect(problems).toEqual([]);
  });

  test("character loop: the portrait plays, pauses, and the next friend starts too", async ({
    page,
  }) => {
    const problems = watchMedia(page);
    await page.goto("/friends");

    const video = page.locator('video[src*="character-"]').first();
    await expectPlaying(page, video);
    await pauseAndResume(page, video, /^Грати$/);

    const source = await video.getAttribute("src");
    // Only the friend picker carries aria-pressed; the bubble's listen button does not, so
    // counting role matches by name picked the character already on screen.
    const friend = page.locator("button[aria-pressed]").nth(1);
    await friend.click();
    await expect(friend).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => video.getAttribute("src")).not.toBe(source);
    await expectPlaying(page, video);

    expect(problems).toEqual([]);
  });

  test("garden film: growth footage plays inside the child's stage", async ({ page }) => {
    const problems = watchMedia(page);
    await page.goto("/garden");

    const group = page.getByRole("group", { name: "Запис росту соняшника" });
    await expect(group).toBeVisible();
    const video = group.locator("video");
    await expectPlaying(page, video, { loops: true });

    const { duration } = await read(video);
    if (duration > 2) {
      // A stage shows only its slice of the recording; it must not run to the end.
      await page.waitForTimeout(2500);
      expect((await read(video)).time).toBeLessThan(duration - 0.2);
    }
    await pauseAndResume(page, video, /^Дивитися ріст$/, { loops: true });

    expect(problems).toEqual([]);
  });
});
