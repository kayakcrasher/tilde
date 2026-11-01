import { useSyncExternalStore } from "react";
import { pack } from "@/lib/tilde/lang";
import { pronounceText } from "@/lib/tilde/pron";

type Mode = "say" | "ipa" | "off";
const KEY = "tilde-pron-mode";
const listeners = new Set<() => void>();

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "ipa" || v === "off" ? v : "say";
  } catch {
    return "say";
  }
}

function setMode(mode: Mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable */
  }
  for (const l of listeners) l();
}

function usePronMode(): Mode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "say",
  );
}

const NEXT: Record<Mode, Mode> = { say: "ipa", ipa: "off", off: "say" };
const LABEL: Record<Mode, string> = { say: "Say it", ipa: "IPA", off: "Show pronunciation" };

/**
 * Pronunciation under Irish text: each word's easy respelling (or IPA)
 * aligned under it. Tap the label to switch Say it → IPA → off.
 */
export function PronLine({ text, className = "" }: { text: string; className?: string }) {
  const mode = usePronMode();
  if (pack().code !== "ga") return null;
  const words = pronounceText(text);
  if (!words.some((w) => w.p)) return null;
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setMode(NEXT[mode])}
        className="tap rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted uppercase hover:text-fg"
        aria-label={`Pronunciation: ${LABEL[mode]}. Tap to change.`}
      >
        {mode === "off" ? LABEL.off : `${LABEL[mode]} ▸`}
      </button>
      {mode !== "off" ? (
        <p className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 leading-tight" aria-label="Pronunciation">
          {words.map((w, i) => (
            <span key={i} className="inline-flex flex-col">
              <span className={mode === "ipa" ? "font-sans text-[15px] text-accent" : "text-[15px] font-semibold text-accent"}>
                {w.p ? (mode === "ipa" ? `/${w.p.ipa}/` : w.p.say) : "·"}
              </span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
