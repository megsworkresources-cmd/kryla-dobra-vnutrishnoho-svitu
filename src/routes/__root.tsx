import { TouchSparkles } from "@/components/TouchSparkles";
import { PLACES } from "@/content/places";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  useLocation,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  ambientFor,
  playAmbient,
  sfx,
  unlockAudio,
  stopAmbient,
  stopSoundscape,
  syncVolume,
} from "@/lib/audio";
import { markVisit, useStore } from "../lib/store";
import { t, useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { authTransition, RECOVERY_KEY } from "@/lib/caregiver-session";
import { safeReturnPath } from "@/lib/caregiver-guard";
import { stopSpeaking, syncSpeechVolume, unlockSpeech } from "@/lib/speak";

function NotFoundComponent() {
  const t = useT();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("Такої сторінки немає")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Здається, ця стежка нікуди не веде.")}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("На початок")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const t = useT();
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("Щось пішло не так")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Спробуй ще раз або повернися на початок.")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("Спробувати ще")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("На початок")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f7f1e3" },
      { title: "Тихе Місце" },
      {
        name: "description",
        content: "Чарівний світ для дітей, де можна пізнавати почуття, дихати й заспокоюватися.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Philosopher:wght@400;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      const transition = authTransition(event);
      if (!transition.invalidate) return;
      // Do not call Auth again inside its synchronous subscriber (SDK lock).
      if (transition.recovery) {
        try {
          sessionStorage.setItem(RECOVERY_KEY, "1");
        } catch {
          /* optional storage */
        }
        window.dispatchEvent(new Event("caregiver-recovery"));
      }
      if (transition.signedOut) {
        try {
          sessionStorage.removeItem(RECOVERY_KEY);
        } catch {
          /* optional storage */
        }
      }
      setTimeout(() => {
        const location = router.state.location;
        if (transition.recovery && location.pathname !== "/reset-password") {
          void router.navigate({ to: "/reset-password", replace: true });
        } else if (event === "SIGNED_IN" && location.pathname === "/caregiver-login") {
          const params = new URLSearchParams(location.searchStr);
          void router.navigate({
            to: safeReturnPath(params.get("next") ?? params.get("redirect")) as never,
            replace: true,
          });
        }
        if (transition.signedOut) {
          void queryClient.cancelQueries().then(() => {
            queryClient.clear();
            void router.invalidate();
          });
        } else {
          void router.invalidate();
          if (transition.refetch) void queryClient.invalidateQueries();
        }
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, router]);
  const reduce = useStore((s) => s.reduceMotion);
  const textSize = useStore((s) => s.textSize);
  const music = useStore((s) => s.sound && s.music);
  const volume = useStore((s) => s.volume);
  const sound = useStore((s) => s.sound);
  const voiceVolume = useStore((s) => s.voiceVolume);
  const voice = useStore((s) => s.voice);
  const musicVolume = useStore((s) => s.musicVolume);
  const musicStyle = useStore((s) => s.musicStyle);
  const lang = useStore((s) => s.lang);
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduce);
  }, [reduce]);
  useEffect(() => {
    document.documentElement.dataset["text"] = textSize;
  }, [textSize]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(syncSpeechVolume, [sound, voice, volume, voiceVolume]);
  useEffect(syncVolume, [sound, volume, musicVolume]);
  // Stop the page we are leaving. This has to be a cleanup: a new page's characters
  // start their line while it mounts, and a plain effect would cut them off.
  useEffect(() => () => stopSpeaking(), [pathname]);
  // A chosen nature sound belongs to its activity, not to the next page.
  useEffect(() => () => stopSoundscape(), [pathname]);
  // Audio only starts after the first touch (browser autoplay rules), then follows the page.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      unlockAudio();
      unlockSpeech();
      playAmbient(ambientFor(window.location.pathname));
      const el = (e.target as HTMLElement).closest("a,button");
      if (el && !el.closest("[data-no-tap]")) sfx("tap");
    };
    window.addEventListener("pointerdown", onDown, true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        unlockAudio();
        unlockSpeech();
        playAmbient(ambientFor(window.location.pathname));
      }
    };
    window.addEventListener("keydown", onKey, true);
    const onVisibility = () => {
      if (document.hidden) {
        stopSpeaking();
        stopAmbient();
        stopSoundscape();
      } else playAmbient(ambientFor(window.location.pathname));
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onExit = () => {
      stopSpeaking();
      stopAmbient();
      stopSoundscape();
    };
    window.addEventListener("pagehide", onExit);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onExit);
    };
  }, []);
  useEffect(() => {
    playAmbient(music ? ambientFor(pathname) : null);
    sfx("page");
  }, [pathname, music, musicStyle, musicVolume, volume]);
  useEffect(() => {
    const seg = pathname.split("/")[1];
    if (seg && PLACES.some((p) => p.id === seg)) markVisit(seg);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <Outlet />
      </main>
      <TouchSparkles />
    </QueryClientProvider>
  );
}
