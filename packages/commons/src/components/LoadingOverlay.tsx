import { Spinner } from "@heroui/react";
import clsx from "clsx";
import { type ReactNode, useEffect, useState } from "react";

interface LoadingOverlayProps {
  ready: boolean;
  children: ReactNode;
}

type Phase = "waiting" | "overlay" | "entered" | "exiting" | "done";

const DELAY_MS = 200;
const FADE_MS = 500;

function LoadingOverlay({ ready, children }: LoadingOverlayProps) {
  const [phase, setPhase] = useState<Phase>("waiting");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase((p) => (p === "waiting" ? "overlay" : p));
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "overlay") return;
    const timer = setTimeout(() => {
      setPhase((p) => (p === "overlay" ? "entered" : p));
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      setPhase((p) => {
        if (p === "waiting") return "done";
        if (p === "entered") return "exiting";
        return p;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [ready, phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = setTimeout(() => {
      setPhase((p) => (p === "exiting" ? "done" : p));
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const overlayVisible = phase === "overlay" || phase === "entered";
  const contentShown = phase === "exiting" || phase === "done";

  return (
      <>
        {phase !== "done" && (
            <div
                className={clsx(
                    "bg-background fixed inset-0 z-100 flex h-full w-full flex-col items-center justify-center transition-opacity duration-500",
                    overlayVisible ? "opacity-100" : "opacity-0",
                    overlayVisible ? "pointer-events-auto" : "pointer-events-none",
                )}
            >
              <div className="mb-8 flex items-center justify-center gap-6">
                <img src="/assets/images/fdfz.png" alt="" className="size-28" />
                <div>
                  <h1 className="m-0 mb-2 text-5xl font-semibold">复旦附中学生 ID</h1>
                  <h2 className="text-muted m-0 text-4xl font-semibold">FDFZ Student ID</h2>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Spinner size="lg" />
                <span className="text-muted">加载中…</span>
              </div>
            </div>
        )}

        <div
            className={clsx(
                "h-full w-full transition-opacity duration-500",
                contentShown ? "opacity-100" : "opacity-0",
                contentShown ? "pointer-events-auto" : "pointer-events-none",
            )}
        >
          {children}
        </div>
      </>
  );
}

export default LoadingOverlay;