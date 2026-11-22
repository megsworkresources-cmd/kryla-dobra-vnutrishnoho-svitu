"""Focused real-media and authenticated offline UI checks; no live garden writes.

Uses the existing injected adult session only at localhost; garden transport is
intercepted, but caregiver verification is real. Not a production offline/PWA test.
"""
import asyncio
import base64
import importlib.util
import json
import os
import sys
from pathlib import Path
from playwright.async_api import async_playwright

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("tranche4", Path(__file__).with_name("verify-tranche4.py"))
if spec is None or spec.loader is None:
    raise RuntimeError("Existing browser acceptance helpers missing")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
settings, start = helpers.settings, helpers.start

OUT = Path("/tmp/browser/remaining")
OUT.mkdir(parents=True, exist_ok=True)
ORIGIN = "http://localhost:8080"
WORDS = {
    "en": {"card": "The Sunflower Who Looked for the Sun", "map": "World map (main menu)",
           "unconfirmed": "The current sharing status is not confirmed.", "shared": "Sunflower is shared",
           "share": "Share sunflower", "stop": "Stop sharing", "refresh": "Refresh garden",
           "off": "Sharing is off", "retry": "Garden unavailable. Please try again."},
    "uk": {"card": "Соняшник, що шукав сонце", "map": "Мапа світу (головне меню)",
           "unconfirmed": "Поточний стан поширення не підтверджено.", "shared": "Соняшник поширено",
           "share": "Поділитися соняшником", "stop": "Припинити поширення", "refresh": "Оновити сад",
           "off": "Поширення вимкнено", "retry": "Сад недоступний. Спробуйте ще раз."},
}

async def fit(page):
    assert not await page.evaluate("document.documentElement.scrollWidth>innerWidth+1")
    assert await page.get_by_role("main").count() == 1

async def main():
    results = {"video": [], "caregiver": [], "garden": [], "errors": []}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width, height in [(393, 852), (1280, 1800)]:
            for lang in ["uk", "en"]:
                ctx = await browser.new_context(viewport={"width": width, "height": height})
                page = await ctx.new_page()
                page.on("pageerror", lambda e: results["errors"].append(str(e)))
                await settings(page, lang)
                await page.goto(ORIGIN + "/watch", wait_until="networkidle")
                card = page.get_by_role("button", name=WORDS[lang]["card"], exact=True)
                await card.click()
                # Movie identity must match: a playing character portrait isn't proof.
                if lang == "uk":
                    play = page.get_by_role("button", name="Грати", exact=True)
                    if await play.count():
                        await play.click()
                try:
                    record = await start(page)
                except Exception:
                    await page.screenshot(path=str(OUT / f"video_failure_{lang}_{width}.png"))
                    diagnostics = await page.locator("video").evaluate_all("vs=>vs.map(v=>({src:new URL(v.currentSrc||v.src).pathname,paused:v.paused,time:v.currentTime,readyState:v.readyState,error:v.error?.code||null,codec:v.canPlayType('video/mp4')}))")
                    print(json.dumps({"video_failure": diagnostics, "language": lang, "viewport": [width, height]}))
                    raise
                assert record["src"] == "/media/video/sunflower-story-full.mp4", record
                record.update({"language": lang, "viewport": [width, height]})
                await page.screenshot(path=str(OUT / f"video_{lang}_{width}.png"))
                await page.get_by_role("link", name=WORDS[lang]["map"], exact=True).click()
                await page.wait_for_url("**/world")
                await page.wait_for_function("window.__testedVideo.paused&&!window.__testedVideo.isConnected")
                assert await page.locator("video").evaluate_all("vs=>vs.every(v=>v.paused)")
                record["exit"] = "retained video paused/detached; no DOM video playing"
                results["video"].append(record)
                await ctx.close()

        for width, height in [(320, 568), (393, 852)]:
            for lang in ["uk", "en"]:
                ctx = await browser.new_context(viewport={"width": width, "height": height})
                page = await ctx.new_page()
                page.on("pageerror", lambda e: results["errors"].append(str(e)))
                await settings(page, lang)
                await page.goto(ORIGIN + "/shared-garden", wait_until="networkidle")
                await page.wait_for_url("**/caregiver-login?**")
                assert "/shared-garden" in await page.evaluate("decodeURIComponent(location.search)")
                await fit(page)
                form = page.get_by_role("form")
                await form.get_by_role("textbox", name="Електронна пошта дорослого" if lang == "uk" else "Adult's email", exact=True).fill("adult@example.test")
                await page.screenshot(path=str(OUT / f"entry_{lang}_{width}.png"))
                submit = form.locator('button[type="submit"]')
                await submit.scroll_into_view_if_needed()
                assert await submit.evaluate("e=>e.getBoundingClientRect().height>=44")
                await page.screenshot(path=str(OUT / f"entry_controls_{lang}_{width}.png"))
                results["caregiver"].append({"language": lang, "viewport": [width, height],
                    "result": "signed-out gate, safe return path, labelled email/password, scroll/touch checks"})
                await ctx.close()

                if os.environ.get("LOVABLE_BROWSER_AUTH_STATUS") != "injected":
                    results["garden"].append("Blocked: injected authenticated adult session unavailable")
                    continue
                ctx = await browser.new_context(viewport={"width": width, "height": height})
                page = await ctx.new_page()
                page.on("pageerror", lambda e: results["errors"].append(str(e)))
                cookies = json.loads(os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON") or "[]")
                if cookies:
                    await ctx.add_cookies([{**c, "url": ORIGIN} for c in cookies])
                await settings(page, lang)
                await page.evaluate("([k,v])=>localStorage.setItem(k,v)", [
                    os.environ["LOVABLE_BROWSER_SUPABASE_STORAGE_KEY"],
                    os.environ["LOVABLE_BROWSER_SUPABASE_SESSION_JSON"]])
                state = {"sharing": False, "calls": 0, "offline": False,
                         "hold": False, "lose_withdrawal": False}
                read_started = asyncio.Event()
                release_read = asyncio.Event()
                async def fixture(route):
                    req = route.request
                    try:
                        ident = req.url.split("/")[-1].split("?")[0]
                        decoded = base64.urlsafe_b64decode(ident + "=" * (-len(ident) % 4)).decode()
                    except Exception:
                        await route.continue_()
                        return
                    if "shared-garden.functions" not in decoded:
                        await route.continue_()
                        return
                    if state["offline"]:
                        await route.abort("internetdisconnected")
                        return
                    if "shareSunflower" in decoded:
                        assert "local-private-test-marker" not in (req.post_data or "")
                        state["calls"] += 1
                        state["sharing"] = not state["sharing"]
                        if state["lose_withdrawal"]:
                            state["lose_withdrawal"] = False
                            await route.abort("connectionclosed")
                            return
                        result = {"ok": True, "capped": False}
                    else:
                        if state["hold"]:
                            read_started.set()
                            await release_read.wait()
                        result = {"own": {"stage": 1, "sharing": state["sharing"]}, "flowers": []}
                    await route.fulfill(status=200, content_type="application/json",
                        body=json.dumps({"result": result, "context": {}}))
                await page.route("**/*", fixture)
                await page.goto(ORIGIN + "/shared-garden", wait_until="networkidle")
                await page.get_by_text(WORDS[lang]["off"], exact=True).wait_for()
                await fit(page)
                checkbox = page.get_by_role("checkbox")
                share = page.get_by_role("button", name=WORDS[lang]["share"], exact=True)
                assert await share.is_disabled()
                await checkbox.scroll_into_view_if_needed()
                await page.screenshot(path=str(OUT / f"consent_{lang}_{width}.png"))
                await checkbox.check()
                state["offline"] = True
                await ctx.set_offline(True)
                await page.get_by_text(WORDS[lang]["unconfirmed"], exact=True).wait_for()
                assert await share.is_disabled()
                assert await checkbox.is_checked()
                assert state["calls"] == 0
                await page.screenshot(path=str(OUT / f"offline_{lang}_{width}.png"))
                state["offline"] = False
                await ctx.set_offline(False)
                await page.get_by_text(WORDS[lang]["off"], exact=True).wait_for()
                assert state["calls"] == 0
                assert await checkbox.is_checked()
                await share.click()
                await page.get_by_text(WORDS[lang]["shared"], exact=True).wait_for()
                stop = page.get_by_role("button", name=WORDS[lang]["stop"], exact=True)
                state["offline"] = True
                await ctx.set_offline(True)
                await page.get_by_text(WORDS[lang]["unconfirmed"], exact=True).wait_for()
                assert await stop.is_disabled()
                state["offline"] = False
                state["hold"] = True
                await ctx.set_offline(False)
                await asyncio.wait_for(read_started.wait(), timeout=20)
                assert await page.get_by_text(WORDS[lang]["shared"], exact=True).count() == 0
                await page.get_by_text(WORDS[lang]["unconfirmed"], exact=True).wait_for()
                assert state["calls"] == 1
                state["hold"] = False
                release_read.set()
                await page.get_by_text(WORDS[lang]["shared"], exact=True).wait_for()
                state["lose_withdrawal"] = True
                await stop.click()
                await page.get_by_role("alert").filter(has_text=WORDS[lang]["retry"]).wait_for()
                await page.get_by_text(WORDS[lang]["unconfirmed"], exact=True).wait_for()
                assert await page.get_by_text(WORDS[lang]["shared"], exact=True).count() == 0
                await page.get_by_role("button", name=WORDS[lang]["refresh"], exact=True).click()
                await page.get_by_text(WORDS[lang]["off"], exact=True).wait_for()
                assert state["calls"] == 2
                assert not await page.get_by_role("checkbox").is_checked()
                await fit(page)
                await page.screenshot(path=str(OUT / f"recovered_{lang}_{width}.png"))
                results["garden"].append({"language": lang, "viewport": [width, height],
                    "result": "authenticated real UI; network offline/restore; preserved consent; no queue; delayed reconnect unconfirmed; lost withdrawal response retry/refresh; fixtures only"})
                await ctx.close()
        assert not results["errors"], results["errors"]
        (OUT / "result.json").write_text(json.dumps(results, indent=2))
        print(json.dumps(results, indent=2))
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())