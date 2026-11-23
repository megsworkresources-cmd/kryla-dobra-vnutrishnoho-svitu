"""Actual preview playback + deterministic garden UI acceptance (no live mutations).

Uses the injected caregiver session only at localhost. Service-worker acceptance
is separately run by verify-offline.py, never registered on the app preview.
Screenshots/results stay in /tmp/browser/tranche4.
"""
import asyncio
import base64
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("/tmp/browser/tranche4")
OUT.mkdir(parents=True, exist_ok=True)
ORIGIN = "http://localhost:8080"
ROUTES = ["/", "/world", "/watch", "/story", "/garden", "/meadow/flower",
          "/meadow/wave", "/forest/body", "/dreams", "/wonders", "/raindrop", "/trails", "/island"]


async def settings(page, lang="en"):
    await page.goto(ORIGIN)
    await page.evaluate("s=>localStorage.setItem('tyhe-mistse-v1',JSON.stringify(s))", {
        "lang": lang, "sound": False, "voice": False, "music": False,
        "reduceMotion": False, "completed": {"flower": 2},
        "comfort": ["local-private-test-marker"],
    })


async def start(page):
    play = page.get_by_role("button", name="Play", exact=True)
    if await play.count():
        await play.click()
    await page.wait_for_function("[...document.querySelectorAll('video')].some(v=>!v.paused&&v.currentTime>0.1)")
    await page.evaluate("window.__testedVideo=[...document.querySelectorAll('video')].find(v=>!v.paused)")
    before = await page.evaluate("window.__testedVideo.currentTime")
    await page.wait_for_function("window.__testedVideo.currentTime>" + str(before + 0.08))
    return await page.evaluate("({time:window.__testedVideo.currentTime,src:new URL(window.__testedVideo.currentSrc).pathname})")


async def main():
    results = {"playback": [], "screens": [], "garden": "not run"}
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 393, "height": 852})
        page = await ctx.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        await settings(page)
        await page.goto(ORIGIN + "/watch", wait_until="networkidle")
        await page.get_by_role("button", name="The Sunflower Who Looked for the Sun", exact=True).click()
        results["playback"].append(await start(page))
        await page.get_by_role("button", name="Pause", exact=True).click()
        assert await page.evaluate("window.__testedVideo.paused")
        await start(page)
        await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
        await page.wait_for_function("window.__testedVideo.paused")
        await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
        assert await page.evaluate("window.__testedVideo.paused")
        await start(page)
        await page.evaluate("window.dispatchEvent(new Event('pagehide'))")
        await page.wait_for_function("window.__testedVideo.paused")
        await page.evaluate("window.dispatchEvent(new Event('pageshow'))")
        assert await page.evaluate("window.__testedVideo.paused")
        await start(page)
        await page.get_by_role("link", name="World map (main menu)", exact=True).click()
        await page.wait_for_url("**/world")
        await page.wait_for_function("window.__testedVideo.paused&&!window.__testedVideo.isConnected")
        assert await page.evaluate("window.__testedVideo.paused&&!window.__testedVideo.isConnected")
        results["playback"].append("pause/resume; simulated hidden/visible and pagehide/pageshow; real SPA navigation: passed")
        await page.screenshot(path=str(OUT / "video_left.png"))
        await ctx.close()

        for width, height in [(320, 568), (393, 852), (1280, 1800)]:
            for lang in ["uk", "en"]:
                ctx = await browser.new_context(viewport={"width": width, "height": height})
                page = await ctx.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                await settings(page, lang)
                for route in ROUTES:
                    await page.goto(ORIGIN + route, wait_until="networkidle")
                    assert not await page.evaluate("document.documentElement.scrollWidth>innerWidth+1"), (width, route)
                    assert await page.get_by_role("main").count() == 1
                    assert await page.locator('button:not([aria-label])').evaluate_all("els=>els.every(e=>e.textContent.trim()||e.getAttribute('title'))"), route
                    name = route.strip("/").replace("/", "_") or "home"
                    await page.screenshot(path=str(OUT / f"after_{width}_{lang}_{name}.png"))
                    results["screens"].append([width, height, lang, route])
                await ctx.close()

        ctx = await browser.new_context(viewport={"width": 393, "height": 852}, reduced_motion="reduce")
        page = await ctx.new_page()
        await settings(page)
        await page.goto(ORIGIN + "/watch", wait_until="networkidle")
        await page.get_by_role("button", name="The Sunflower Who Looked for the Sun", exact=True).click()
        await page.wait_for_function("[...document.querySelectorAll('video')].every(v=>v.paused)")
        await page.screenshot(path=str(OUT / "reduced_motion.png"))
        results["playback"].append("system reduced motion: all videos paused, poster visible")
        await ctx.close()

        if os.environ.get("LOVABLE_BROWSER_AUTH_STATUS") == "injected":
            ctx = await browser.new_context(viewport={"width": 393, "height": 852})
            page = await ctx.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            cookies = json.loads(os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON") or "[]")
            if cookies:
                await ctx.add_cookies([{**c, "url": ORIGIN} for c in cookies])
            await settings(page)
            await page.evaluate("([k,v])=>localStorage.setItem(k,v)", [os.environ["LOVABLE_BROWSER_SUPABASE_STORAGE_KEY"], os.environ["LOVABLE_BROWSER_SUPABASE_SESSION_JSON"]])
            state = {"sharing": False, "calls": 0, "offline": False}
            async def fixture(route):
                request = route.request
                try:
                    ident = request.url.split("/")[-1].split("?")[0]
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
                    assert "local-private-test-marker" not in (request.post_data or "")
                    state["calls"] += 1
                    state["sharing"] = not state["sharing"]
                    result = {"ok": True, "capped": False}
                else:
                    result = {"own": {"stage": 1, "sharing": state["sharing"]}, "flowers": []}
                await route.fulfill(status=200, content_type="application/json", body=json.dumps({"result": result, "context": {}}))
            await page.route("**/*", fixture)
            await page.goto(ORIGIN + "/shared-garden", wait_until="networkidle")
            await page.get_by_role("checkbox").check()
            state["offline"] = True
            await ctx.set_offline(True)
            await page.get_by_text("The current sharing status is not confirmed.", exact=True).wait_for()
            assert await page.get_by_role("button", name="Share sunflower", exact=True).is_disabled()
            assert state["calls"] == 0
            await page.screenshot(path=str(OUT / "shared_offline.png"))
            state["offline"] = False
            await ctx.set_offline(False)
            await page.get_by_role("button", name="Share sunflower", exact=True).wait_for()
            assert state["calls"] == 0
            await page.get_by_role("button", name="Share sunflower", exact=True).click()
            stop = page.get_by_role("button", name="Stop sharing", exact=True)
            await stop.wait_for()
            state["offline"] = True
            await ctx.set_offline(True)
            assert await stop.is_disabled()
            state["offline"] = False
            await ctx.set_offline(False)
            await stop.click()
            await page.get_by_role("checkbox").wait_for()
            assert state["calls"] == 2
            # Local route was loaded before losing connectivity: preview has no worker.
            await page.goto(ORIGIN + "/garden", wait_until="networkidle")
            local = await page.evaluate("localStorage.getItem('tyhe-mistse-v1')")
            await ctx.set_offline(True)
            await page.get_by_text("Your garden is saved on this device. It doesn't need the internet.", exact=True).wait_for()
            pause = page.get_by_role("button", name="Pause", exact=True)
            if await pause.count():
                await pause.click()
            else:
                await page.get_by_role("button", name="Watch it grow", exact=True).click()
            assert await page.evaluate("localStorage.getItem('tyhe-mistse-v1')") == local
            assert state["calls"] == 2
            await page.screenshot(path=str(OUT / "local_offline.png"))
            await ctx.set_offline(False)
            results["garden"] = "real signed-in UI + deterministic read/share fixtures: offline guards, no deferred action, reconnect explicit opt-in/out, local persistence passed; no live garden mutation"
            await ctx.close()
        else:
            results["garden"] = "blocked: injected caregiver session unavailable (unit tests still run)"
        results["page_errors"] = errors
        assert not errors, errors
        (OUT / "result.json").write_text(json.dumps(results, indent=2))
        print(json.dumps({"playback": results["playback"], "screens": len(results["screens"]), "garden": results["garden"], "page_errors": errors}, indent=2))
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())