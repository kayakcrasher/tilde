import type { ReactNode, RefObject } from "react";

export const ACCENT_KEYS = ["á", "é", "í", "ó", "ú", "ü", "ñ"] as const;

/** Short haptic tick on devices that support it (Android); silently ignored elsewhere. */
export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

export function Chip({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "accent" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase ${
        tone === "accent" ? "bg-accent/15 text-accent" : "bg-line/70 text-muted"
      }`}
    >
      {children}
    </span>
  );
}

/** Insert `char` at the cursor of `input`, keeping focus and caret in place. */
export function insertAtCursor(
  input: HTMLInputElement | null,
  value: string,
  char: string,
  setValue: (next: string) => void,
) {
  if (!input) {
    setValue(value + char);
    return;
  }
  const start = input.selectionStart ?? value.length;
  const end = input.selectionEnd ?? value.length;
  setValue(value.slice(0, start) + char + value.slice(end));
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(start + char.length, start + char.length);
  });
}

export function AccentKeys({
  inputRef,
  value,
  onChange,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Insert accented letter">
      {ACCENT_KEYS.map((char) => (
        <button
          key={char}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => insertAtCursor(inputRef.current, value, char, onChange)}
          className="tap h-10 min-w-10 flex-1 rounded-xl border border-line bg-surface/60 font-display text-lg text-fg hover:border-muted"
          aria-label={`Insert ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
}

