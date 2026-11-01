import { useMemo, useRef, useState } from "react";
import { Check, Keyboard, Puzzle, RotateCcw, Volume2, X } from "lucide-react";
import { answerOf, difficultyFor, fold, sentence } from "@/lib/tilde/engine";
import { pack } from "@/lib/tilde/lang";
import { canSpeak, speak } from "@/lib/tilde/speech";
import { usePlay } from "@/lib/tilde/store";
import type { Difficulty, Item } from "@/lib/tilde/types";
import { wordsIn } from "@/lib/tilde/vocab";
import { AccentKeys, Chip, buzz } from "./shared";

/** Longest sentence (in words) offered at each level. */
const MAX_WORDS: Record<Difficulty, number> = { facil: 8, medio: 11, dificil: 16 };
const BASE_XP: Record<Difficulty, number> = { facil: 5, medio: 7, dificil: 9 };

type Tile = { id: number; text: string };

/** Split a sentence into word tiles, dropping punctuation (¿ ¡ , . ? ! ;). */
function wordsOf(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[¿¡"“«(]+|[,.;:!?"”»)]+$/g, ""))
    .filter(Boolean);
}

/** Compare word by word; `ok` ignores case/accents, `exact` needs every mark. */
function grade(given: string[], target: string[]): { ok: boolean; exact: boolean } {
  if (given.length !== target.length) return { ok: false, exact: false };
  const ok = given.every((w, i) => fold(w) === fold(target[i]));
  const exact = ok && given.every((w, i) => w.toLowerCase().replace(/’/g, "'") === target[i].toLowerCase().replace(/’/g, "'"));
  return { ok, exact };
}

function pickItem(difficulty: Difficulty, avoid?: string): Item {
  const pool = pack().items.filter(
    (item) => difficultyFor(item) === difficulty && item.id !== avoid && wordsOf(sentence(item, answerOf(item))).length <= MAX_WORDS[difficulty],
  );
  const list = pool.length > 0 ? pool : pack().items;
  return list[Math.floor(Math.random() * list.length)];
}

/** Two or three wrong tiles: other forms of the verb, plus a word from elsewhere. */
function distractorsFor(item: Item, words: string[]): string[] {
  const taken = new Set(words.map((w) => w.toLowerCase()));
  const out: string[] = [];
  const row = pack().forms[item.verb]?.[item.tense] ?? [];
  for (const form of row) {
    if (out.length >= 2) break;
    if (!taken.has(form.toLowerCase()) && !out.includes(form)) out.push(form);
  }
  const others = pack().items;
  for (let tries = 0; tries < 20 && out.length < 3; tries += 1) {
    const other = others[Math.floor(Math.random() * others.length)];
    const ws = wordsOf(other.before + " " + other.after).filter((w) => w.length > 2 && !taken.has(w.toLowerCase()));
    if (ws.length) {
      const w = ws[Math.floor(Math.random() * ws.length)];
      if (!out.includes(w)) out.push(w);
    }
  }
  return out;
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function Build() {
  const difficulty = usePlay((state) => state.difficulty);
  const [item, setItem] = useState(() => pickItem(difficulty));
  const [level, setLevel] = useState(difficulty);
  if (level !== difficulty) {
    setLevel(difficulty);
    setItem(pickItem(difficulty));
  }
  return <BuildCard key={item.id} item={item} onNext={() => setItem(pickItem(difficulty, item.id))} />;
}

function BuildCard({ item, onNext }: { item: Item; onNext: () => void }) {
  const built = usePlay((state) => state.built);
  const markSeen = usePlay((state) => state.markSeen);
  const stats = usePlay((state) => state.build);
  const typeMode = usePlay((state) => state.typeMode);
  const setTypeMode = usePlay((state) => state.setTypeMode);
  const full = sentence(item, answerOf(item));
  const target = useMemo(() => wordsOf(full), [full]);
  const bank = useMemo<Tile[]>(
    () => shuffle([...target, ...distractorsFor(item, target)]).map((text, id) => ({ id, text })),
    [item, target],
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [draft, setDraft] = useState("");
  // Typing only earns the bonus if the tiles were never shown for this sentence.
  const [sawTiles, setSawTiles] = useState(!typeMode);
  const [result, setResult] = useState<null | { ok: boolean; exact: boolean; xp: number; typed: boolean }>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const base = BASE_XP[difficultyFor(item)];
  const voice = canSpeak() && Boolean(pack().speechLang);

  function finish(given: string[], typed: boolean) {
    const g = grade(given, target);
    const xp = built(g.ok, typed && !sawTiles, base, g.exact);
    markSeen(wordsIn(full));
    setResult({ ...g, xp, typed });
    buzz(g.ok ? 12 : [30, 60, 30]);
  }

  return (
    <div className="rise">
      <article className="card rounded-3xl border border-line p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="accent">
            <span className="inline-flex items-center gap-1">
              <Puzzle className="size-3" aria-hidden="true" /> Build it
            </span>
          </Chip>
          <Chip>{pack().tenseTitle(item.tense)}</Chip>
          <span className="ml-auto text-xs text-muted">in {pack().name}</span>
        </div>
        <h1 className="mt-4 font-display text-2xl leading-snug font-semibold sm:text-3xl">{item.en}</h1>

        {/* answer line */}
        <div
          className={`mt-5 flex min-h-14 flex-wrap content-start gap-2 border-b-2 pb-3 ${
            result ? (result.ok ? "border-good/60" : "border-bad/60") : "border-line"
          }`}
          aria-label="Your sentence"
        >
          {typeMode && !result ? null : picked.length === 0 && !result ? (
            <span className="self-center text-sm text-muted">Tap the words below in order…</span>
          ) : null}
          {!typeMode || result
            ? picked.map((tileId) => {
                const tile = bank[tileId];
                return (
                  <button
                    key={tileId}
                    type="button"
                    disabled={result !== null}
                    onClick={() => setPicked((list) => list.filter((id) => id !== tileId))}
                    className="tap pop rounded-xl border border-accent/50 bg-accent/10 px-3 py-2 font-display text-lg font-semibold"
                    lang={pack().code}
                  >
                    {tile.text}
                  </button>
                );
              })
            : null}
        </div>
      </article>

      {result ? (
        <div className="rise mt-4">
          <div
            className={`flex items-start gap-3 rounded-3xl border p-4 ${
              result.ok ? "border-good/30 bg-good/10" : "border-bad/30 bg-bad/10"
            }`}
            aria-live="polite"
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-full text-ink ${result.ok ? "bg-good" : "bg-bad"}`}
              aria-hidden="true"
            >
              {result.ok ? <Check className="size-5" strokeWidth={3} /> : <X className="size-5" strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold">
                {result.ok ? (result.typed && !result.exact ? `Right — watch the ${pack().markWord}s` : "Nicely done!") : "Not quite."}
              </p>
              <p className="mt-1 font-display text-lg leading-snug" lang={pack().code}>
                {full}
              </p>
            </div>
            {result.xp > 0 ? (
              <span className="pop shrink-0 rounded-full bg-good px-2.5 py-1 text-sm font-bold text-ink">+{result.xp}</span>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
            {voice ? (
              <button
                type="button"
                onClick={() => void speak(full)}
                className="tap grid min-h-13 place-items-center rounded-2xl border border-line bg-surface px-4"
                aria-label="Listen"
              >
                <Volume2 className="size-5 text-accent" aria-hidden="true" />
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              autoFocus
              onClick={onNext}
              className="tap min-h-13 rounded-2xl bg-accent text-base font-semibold text-ink shadow-[0_8px_24px_-8px] shadow-accent/60"
            >
              Next sentence
            </button>
          </div>
        </div>
      ) : typeMode ? (
        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim()) finish(wordsOf(draft), true);
          }}
        >
          <label className="sr-only" htmlFor="build-input">
            Type the sentence
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 focus-within:border-accent">
            <input
              ref={inputRef}
              id="build-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              lang={pack().code}
              enterKeyHint="done"
              placeholder={`Type it in ${pack().name}…`}
              className="min-w-0 flex-1 bg-transparent py-3.5 text-lg font-semibold text-fg placeholder:text-muted/50 focus:outline-none"
            />
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent tabular-nums">
              +{sawTiles ? base : base * 2}
            </span>
          </div>
          <AccentKeys inputRef={inputRef} value={draft} onChange={setDraft} />
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <button
              type="submit"
              disabled={!draft.trim()}
              className="tap min-h-13 rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
            >
              Check
            </button>
            <button
              type="button"
              onClick={() => {
                setSawTiles(true);
                setTypeMode(false);
              }}
              className="tap min-h-13 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold"
            >
              Word tiles
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            {sawTiles ? `You've seen the tiles, so this scores ${base}.` : `Typing scores double (${base * 2}), plus a bonus for every ${pack().markWord}.`}
          </p>
        </form>
      ) : (
        <div className="mt-5">
          <div className="flex flex-wrap justify-center gap-2" aria-label="Word bank">
            {bank.map((tile) => {
              const used = picked.includes(tile.id);
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={used}
                  onClick={() => setPicked((list) => [...list, tile.id])}
                  className={`tap rounded-xl border px-3 py-2 font-display text-lg font-semibold ${
                    used ? "border-line/50 bg-line/30 text-transparent" : "border-line bg-surface hover:border-accent"
                  }`}
                  lang={pack().code}
                >
                  {tile.text}
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              onClick={() => setPicked([])}
              disabled={picked.length === 0}
              className="tap grid min-h-13 place-items-center rounded-2xl border border-line bg-surface px-4 disabled:opacity-40"
              aria-label="Clear"
            >
              <RotateCcw className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => finish(picked.map((id) => bank[id].text), false)}
              disabled={picked.length === 0}
              className="tap min-h-13 rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
            >
              Check
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setTypeMode(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="tap mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-semibold text-muted hover:text-fg"
          >
            <Keyboard className="size-4" aria-hidden="true" /> Type the whole sentence instead
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted tabular-nums">
        {stats.right} built · {stats.typed} typed · best run {stats.best}
      </p>
    </div>
  );
}
