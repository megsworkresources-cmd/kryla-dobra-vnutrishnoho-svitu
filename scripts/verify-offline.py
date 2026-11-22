"""Generated Workbox policy acceptance on a separate localhost fixture origin.

Run after scripts/offline-fixture.mts, passing its printed fixture directory.
This never registers a worker on the Lovable preview and does NOT validate
the actual deployed app's production chunks, hydration, media or installation.
"""
import asyncio
import functools
import json
from pathlib import Path
import sys
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.async_api import async_playwright

ROOT = Path(sys.argv[1])
EXCLUDED = ["/auth/confirm", "/caregiver-login", "/reset-password", "/parents",
            "/shared-garden", "/~oauth/authorize", "/.lovable/oauth/consent", "/api/public/mcp"]


class Handler(SimpleHTTPRequestHandler):
    offline = False

    def log_message(self, *args):
        pass

    def do_GET(self):
        if Handler.offline:
            self.close_connection = True
            self.connection.shutdown(socket.SHUT_RDWR)
            self.connection.close()
            return
        if self.path.split("?")[0] in ["/", "/garden", "/games", *EXCLUDED]:
            body = f"<html><head><title>Acceptance fixture</title></head><body><main><h1>Fixture {self.path}</h1></main></body></html>".encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()


async def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://localhost:{server.server_port}"
    screenshots = ROOT / "screenshots"
    screenshots.mkdir(exist_ok=True)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1280, "height": 1800})
            page = await context.new_page()
            await page.goto(origin)
            await page.evaluate("async () => { await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready; }")
            await page.reload()
            await page.wait_for_function("navigator.serviceWorker.controller !== null")
            for route in ["/", "/garden", "/games", *EXCLUDED]:
                await page.goto(origin + route)
                assert await page.locator("h1").inner_text() == "Fixture " + route
            await page.wait_for_function("async () => (await (await caches.open('pages')).keys()).length === 3")
            keys = await page.evaluate("async () => (await Promise.all((await caches.keys()).map(async n => (await (await caches.open(n)).keys()).map(r => new URL(r.url).pathname)))).flat()")
            assert not set(EXCLUDED).intersection(keys), keys
            # Chromium's context offline flag alone may not block worker-owned fetches.
            # Close origin connections too: every network path is genuinely unavailable.
            Handler.offline = True
            await context.set_offline(True)
            await page.close()
            page = await context.new_page()
            for i, route in enumerate(["/", "/garden", "/games"]):
                await page.goto(origin + route)
                assert await page.locator("h1").inner_text() == "Fixture " + route
                await page.screenshot(path=str(screenshots / f"{i}_cached.png"))
            await page.goto(origin + "/never-visited")
            await page.screenshot(path=str(screenshots / "uncached_fallback.png"))
            title = await page.title()
            assert title == "Без мережі — Тихе Місце", {"title": title, "content": await page.content(), "cache_paths": keys}
            fallback = await page.locator("h1").inner_text()
            await page.screenshot(path=str(screenshots / "uncached_fallback.png"))
            blocked = []
            for route in EXCLUDED:
                try:
                    await page.goto(origin + route)
                except Exception as e:
                    assert "ERR_INTERNET_DISCONNECTED" in str(e) or "ERR_FAILED" in str(e), str(e)
                    blocked.append(route)
                else:
                    raise AssertionError("Private route served offline: " + route)
            await context.set_offline(False)
            Handler.offline = False
            await page.goto(origin + "/games")
            assert await page.locator("h1").inner_text() == "Fixture /games"
            await browser.close()
            result = {"scope": "generated worker fixture; not production app", "precache": json.loads((ROOT / "acceptance.json").read_text())["count"], "cached_navigations": ["/", "/garden", "/games"], "uncached_fallback": fallback, "never_cached_and_blocked_offline": blocked, "reconnect": "passed", "cached_paths": sorted(keys)}
            (ROOT / "browser-result.json").write_text(json.dumps(result, indent=2))
            print(json.dumps(result, indent=2))
    finally:
        server.shutdown()


asyncio.run(main())