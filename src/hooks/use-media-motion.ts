import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

/** Saved and operating-system preferences both suppress recorded motion. */
export function useMediaMotion() {
  const saved = useStore((s) => s.reduceMotion);
  const [system, setSystem] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystem(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return !(saved || system);
}
