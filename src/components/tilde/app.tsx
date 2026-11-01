import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Flame,
  Globe,
  FlaskConical,
  Keyboard,
  LayoutGrid,
  Library,
  Lightbulb,
  Mic,
  Play as PlayIcon,
  RotateCcw,
  X,
} from "lucide-react";
import {
  CHOICE_POINTS,
  TYPE_POINTS,
  answerOf,
  atSentenceStart,
  capitalize,
  choicesFor,
  countFor,
  difficultyFor,
  gradeTyped,
  itemById,
  levelSpan,
  parts,
  sentence,
} from "@/lib/tilde/engine";
import { PACKS, pack, useLang, type LangCode } from "@/lib/tilde/lang";
import { switchLanguage, usePlay } from "@/lib/tilde/store";
import { DIFFICULTIES, type Difficulty, type Item, type Tense } from "@/lib/tilde/types";
import { BadgeGrid, BadgeToast, useBadgeWatcher } from "./badges";
import { Learn } from "./learn";
import { PLACEMENT_BLURB, PlacementTest } from "./placement";
import { Stories } from "./stories";
import { Chip, buzz } from "./shared";
import { Speak } from "./speak";

const DIFFICULTY_EN: Record<Difficulty, string> = {
  facil: "Easy",
  medio: "Medium",
  dificil: "Hard",
};

export function Tilde() {
  const stats = usePlay((state) => state.stats);
  const cardId = usePlay((state) => state.cardId);
  const view = usePlay((state) => state.view);
  const difficulty = usePlay((state) => state.difficulty);
  const setView = usePlay((state) => state.setView);
  const setDifficulty = usePlay((state) => state.setDifficulty);
  const resolve = usePlay((state) => state.resolve);
  const reset = usePlay((state) => state.reset);
  const draw = usePlay((state) => state.draw);
  // In Speak, switching level shouldn't jump back to Play.
  const setLevel = (level: Difficulty) => usePlay.setState({ difficulty: level });
  const item = itemById(cardId);
  const span = levelSpan(stats.xp);
  const xpWidth = Math.min(100, Math.round((span.into / span.need) * 100));

  const lang = useLang((state) => state.code);
  const setLang = useLang((state) => state.setCode);
  const [ready, setReady] = useState(false);
  const current = pack();

  // Load the saved language's progress once on start.
  useEffect(() => {
    switchLanguage(useLang.getState().code);
    setReady(true);
  }, []);

  // Activate the new language *before* re-rendering, so no screen ever reads
  // one language's sentences against another language's tables.
  const changeLang = (code: LangCode) => {
    switchLanguage(code);
    setLang(code);
  };

  useBadgeWatcher();
  const placement = usePlay((state) => state.placement);
  const [skipPlacement, setSkipPlacement] = useState(() => {
    try {
      return localStorage.getItem("tilde-skip-placement") === "1";
    } catch {
      return false;
    }
  });
  const dismissPlacement = () => {
    setSkipPlacement(true);
    try {
      localStorage.setItem("tilde-skip-placement", "1");
    } catch {
      /* storage unavailable */
    }
  };

  if (!ready) return <div className="min-h-screen bg-bg" />;

  return (
    <div className="safe-area relative min-h-screen overflow-x-hidden bg-bg text-fg">
      <div className="glow pointer-events-none absolute inset-x-0 top-0 h-80" aria-hidden="true" />
      <div className="relative mx-auto max-w-xl px-4">
        <header className="flex items-center gap-3 pt-5">
          <Logo />
          <p className="font-display text-[1.7rem] leading-none font-bold tracking-tight">Tilde</p>
          <div className="ml-auto flex items-center gap-2">
            <label className="tap relative flex h-8 items-center gap-1 rounded-full border border-line bg-surface pr-2 pl-2.5 text-sm font-semibold">
              <Globe className="size-3.5 text-accent" aria-hidden="true" />
              <span className="uppercase">{current.code}</span>
              <ChevronDown className="size-3 text-muted" aria-hidden="true" />
              <select
                value={lang}
                onChange={(event) => changeLang(event.target.value as LangCode)}
                aria-label="Language"
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {PACKS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.native} · {p.name}
                  </option>
                ))}
              </select>
            </label>
            <Pill label="Streak">
              <Flame className={`size-4 ${stats.streak > 0 ? "text-accent" : "text-muted"}`} aria-hidden="true" />
              <span key={stats.streak} className={stats.streak > 0 ? "pop" : undefined}>
                {stats.streak}
              </span>
            </Pill>
            <Pill label="Level">
              <span className="text-muted">Lv</span> {span.level}
            </Pill>
          </div>
        </header>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label="Experience to next level"
          aria-valuenow={span.into}
          aria-valuemax={span.need}
        >
          <div className="xp-fill h-full rounded-full" style={{ width: `${xpWidth}%` }} />
        </div>

        <nav className={`mt-5 grid ${current.speechLang ? "grid-cols-5" : "grid-cols-4"} gap-1 rounded-full border border-line bg-surface p-1`} aria-label="Sections">
          <Segment on={view === "play"} onClick={() => setView("play")}>
            <PlayIcon className="size-3.5" aria-hidden="true" /> Play
          </Segment>
          <Segment on={view === "learn"} onClick={() => setView("learn")}>
            <BookOpen className="size-3.5" aria-hidden="true" /> Learn
          </Segment>
          <Segment on={view === "stories"} onClick={() => setView("stories")}>
            <Library className="size-3.5" aria-hidden="true" /> Stories
          </Segment>
          {current.speechLang ? (
            <Segment on={view === "speak"} onClick={() => setView("speak")}>
              <Mic className="size-3.5" aria-hidden="true" /> Speak
            </Segment>
          ) : null}
          <Segment on={view === "stats"} onClick={() => setView("stats")}>
            <BarChart3 className="size-3.5" aria-hidden="true" /> Stats
          </Segment>
        </nav>

        {view === "play" || view === "speak" ? (
          <section className="mt-4" aria-label="Difficulty">
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Difficulty">
              {DIFFICULTIES.map((level) => {
                const on = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => (view === "speak" ? setLevel(level) : setDifficulty(level))}
                    aria-pressed={on}
                    className={`tap rounded-2xl border px-2 py-2 text-left leading-tight ${
                      on ? "border-accent bg-accent/12 text-fg" : "border-line bg-surface/60 text-fg"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Dots count={DIFFICULTIES.indexOf(level) + 1} on={on} />
                      {DIFFICULTY_EN[level]}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {current.levels[level].native} · {countFor(level)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-xs text-muted">{current.levels[difficulty].help}</p>
          </section>
        ) : null}

        {view === "play" && stats.seen === 0 && !placement && !skipPlacement ? (
          <div className="rise mt-4 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-3">
            <FlaskConical className="size-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm">
              New to {current.name}? Take a 2-minute placement test to find your level.
            </p>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => setView("placement")}
                className="tap rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-ink"
              >
                Take test
              </button>
              <button type="button" onClick={dismissPlacement} className="tap text-xs text-muted underline">
                No thanks
              </button>
            </div>
          </div>
        ) : null}

        <main className="pt-5 pb-16">
          {view === "placement" ? (
            <PlacementTest key={lang} />
          ) : view === "stories" ? (
            <Stories key={lang} />
          ) : view === "learn" ? (
            <Learn key={lang} />
          ) : view === "speak" && current.speechLang ? (
            <Speak key={lang} />
          ) : view === "stats" || !item ? (
            <Progress stats={stats} span={span} onPractice={draw} onReset={reset} />
          ) : (
            <Play key={item.id} item={item} onResolve={resolve} onNext={() => draw()} />
          )}
        </main>
      </div>
      <BadgeToast />
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-surface" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" className="stroke-line" />
      <path
        d="M7 17.6C9.3 11.8 12.4 11.8 16 17.6C19.6 23.4 22.7 23.4 25 17.6"
        fill="none"
        className="stroke-accent"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Pill({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p
      className="flex h-8 items-center gap-1 rounded-full border border-line bg-surface px-3 text-sm font-semibold tabular-nums"
      aria-label={label}
    >
      {children}
    </p>
  );
}

function Dots({ count, on }: { count: number; on: boolean }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`size-1.5 rounded-full ${n <= count ? (on ? "bg-accent" : "bg-fg/70") : "bg-line"}`}
        />
      ))}
    </span>
  );
}

function Segment({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on ? "page" : undefined}
      className={`tap flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-semibold min-[400px]:flex-row min-[400px]:gap-1.5 min-[400px]:text-sm ${
        on ? "bg-fg text-bg shadow-sm" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Play({
  item,
  onResolve,
  onNext,
}: {
  item: Item;
  onResolve: (item: Item, ok: boolean, via: "type" | "choice", accent: boolean) => number;
  onNext: () => void;
}) {
  const [draft, setDraft] = useState("");
  const typeMode = usePlay((state) => state.typeMode);
  const setTypeMode = usePlay((state) => state.setTypeMode);
  // Typing only earns full points if the choices were never shown for this card.
  const [sawChoices, setSawChoices] = useState(!typeMode);
  const open = !typeMode;
  const [result, setResult] = useState<{
    ok: boolean;
    points: number;
    accent: boolean;
    via: "type" | "choice";
    given: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const answer = answerOf(item);
  const shown = atSentenceStart(item) ? capitalize(answer) : answer;
  const choices = choicesFor(item);
  const difficulty = difficultyFor(item);
  const typePoints = TYPE_POINTS[difficulty];
  const choicePoints = CHOICE_POINTS[difficulty];
  const { left, tail } = parts(item);
  const showVerb = difficulty !== "dificil" || result !== null;
  const showPerson = difficulty === "facil" || result !== null;

  function finish(raw: string, via: "type" | "choice") {
    if (result) return;
    const graded = gradeTyped(raw, answer);
    const accent = via === "type" && graded.accent;
    const points = onResolve(item, graded.ok, via, accent);
    setResult({ ok: graded.ok, points, accent, via, given: raw.trim() });
    buzz(graded.ok ? 12 : [30, 60, 30]);
  }

  function insert(char: string) {
    const input = inputRef.current;
    if (!input) {
      setDraft((value) => value + char);
      return;
    }
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + char + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    });
  }

  function goNext() {
    setDraft("");
    setResult(null);
    onNext();
  }

  function switchToTyping() {
    setTypeMode(true);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }

  function switchToChoices() {
    setSawChoices(true);
    setTypeMode(false);
  }

  // In typing mode, focus the answer on desktop (fine pointer) so you can type
  // straight away; on phones this would pop the keyboard over the sentence.
  useEffect(() => {
    if (typeMode && window.matchMedia?.("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, [typeMode]);

  useEffect(() => {
    if (result) nextRef.current?.focus({ preventScroll: true });
  }, [result]);

  // Keys 1-4 pick a choice once the choices are open.
  useEffect(() => {
    if (!open || result) return;
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement && event.target.value) return;
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < choices.length) {
        event.preventDefault();
        finish(choices[index], "choice");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="rise">
      <article
        className={`card rounded-3xl border p-5 sm:p-7 ${
          result ? (result.ok ? "border-good/40" : "border-bad/40") : "border-line"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {showVerb ? (
            <>
              <Chip tone="accent">{item.verb}</Chip>
              <Chip>{pack().tenseTitle(item.tense)}</Chip>
              {showPerson ? <Chip>{pack().persons[item.person]}</Chip> : null}
            </>
          ) : (
            <Chip>
              <span className="inline-flex items-center gap-1">
                <Lightbulb className="size-3" aria-hidden="true" /> No hints
              </span>
            </Chip>
          )}
        </div>
        <h1 className="mt-5 font-display text-[1.9rem] leading-[1.25] font-semibold text-fg sm:text-4xl">
          {left}
          <span
            className={
              result
                ? `pop rounded-lg px-1 ${result.ok ? "bg-good/15 text-good" : "bg-bad/15 text-fg"}`
                : "gap-slot inline-block min-w-20 border-b-[3px] border-accent align-baseline"
            }
          >
            {result ? shown : " "}
          </span>
          {tail}
        </h1>
        <p className="mt-5 border-t border-line pt-4 text-[15px] leading-relaxed text-muted">{item.en}</p>
      </article>

      {result ? (
        <div
          className={`rise mt-4 flex items-start gap-3 rounded-3xl border p-4 ${
            result.ok ? "border-good/30 bg-good/10" : "border-bad/30 bg-bad/10"
          }`}
          aria-live="polite"
        >
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-full ${
              result.ok ? "bg-good text-ink" : "bg-bad text-ink"
            }`}
            aria-hidden="true"
          >
            {result.ok ? <Check className="size-5" strokeWidth={3} /> : <X className="size-5" strokeWidth={3} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold">{result.ok ? "¡Correcto!" : "Not quite."}</p>
            <p className="mt-0.5 text-sm text-muted">
              {result.ok
                ? result.via === "type" && !result.accent
                  ? `Right verb — watch the ${pack().markWord}: ${answer}.`
                  : result.via === "type"
                    ? "Typed it perfectly."
                    : "Picked the right form."
                : `You said “${result.given}”. It's ${answer}. Streak reset.`}
            </p>
          </div>
          {result.ok ? (
            <span className="pop shrink-0 rounded-full bg-good px-2.5 py-1 text-sm font-bold text-ink tabular-nums">
              +{result.points}
            </span>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <button
          ref={nextRef}
          type="button"
          onClick={goNext}
          className="tap mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-ink shadow-[0_8px_24px_-8px] shadow-accent/60"
        >
          Next sentence
          <span className="hidden rounded-md bg-ink/15 px-1.5 text-xs [@media(pointer:fine)]:inline">↵</span>
        </button>
      ) : (
        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            finish(draft, sawChoices ? "choice" : "type");
          }}
        >
          {open ? (
            <>
              <p className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
                <span>Pick the right form</span>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 font-bold text-accent tabular-nums">
                  +{choicePoints}
                </span>
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {choices.map((choice, index) => (
                  <li key={choice} className="rise" style={{ animationDelay: `${index * 40}ms` }}>
                    <button
                      type="button"
                      onClick={() => finish(choice, "choice")}
                      className="tap relative min-h-16 w-full rounded-2xl border border-line bg-surface px-3 font-display text-lg font-semibold text-fg hover:border-accent"
                    >
                      <span className="absolute top-1.5 left-2.5 hidden font-sans text-[10px] font-normal text-muted [@media(pointer:fine)]:block">
                        {index + 1}
                      </span>
                      {choice}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={switchToTyping}
                className="tap mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-semibold text-muted hover:border-muted hover:text-fg"
              >
                <Keyboard className="size-4" aria-hidden="true" /> Type it instead
              </button>
              <p className="mt-2 text-center text-xs text-muted">
                Type without seeing the choices for {typePoints} points.
              </p>
            </>
          ) : (
            <>
              <label className="sr-only" htmlFor="answer">
                Missing verb
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 focus-within:border-accent">
                <input
                  ref={inputRef}
                  id="answer"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  lang={pack().code}
                  enterKeyHint="done"
                  placeholder="Type the verb…"
                  className="min-w-0 flex-1 bg-transparent py-3.5 font-display text-2xl font-semibold text-fg placeholder:text-muted/50 focus:outline-none"
                />
                <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent tabular-nums">
                  +{sawChoices ? choicePoints : typePoints}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Insert accented letter">
                {pack().accentKeys.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => insert(char)}
                    className="tap h-10 min-w-10 flex-1 rounded-xl border border-line bg-surface/60 font-sans text-lg font-semibold text-fg hover:border-muted"
                    aria-label={`Insert ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="tap min-h-13 rounded-2xl bg-accent text-base font-semibold text-ink shadow-[0_8px_24px_-8px] shadow-accent/60 disabled:opacity-40 disabled:shadow-none"
                >
                  Check
                </button>
                <button
                  type="button"
                  onClick={switchToChoices}
                  className="tap flex min-h-13 items-center gap-1.5 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold text-fg"
                >
                  <LayoutGrid className="size-4" aria-hidden="true" /> Choices
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                {sawChoices
                  ? `You've seen the choices, so this scores ${choicePoints}.`
                  : `Typing scores ${typePoints}. Getting every ${pack().markWord} right earns a bonus.`}
              </p>
            </>
          )}
        </form>
      )}
    </div>
  );
}

function Progress({
  stats,
  span,
  onPractice,
  onReset,
}: {
  stats: ReturnType<typeof usePlay.getState>["stats"];
  span: { level: number; into: number; need: number };
  onPractice: (id: string) => void;
  onReset: () => void;
}) {
  const speech = usePlay((state) => state.speech);
  const [confirming, setConfirming] = useState(false);
  const rate = stats.seen === 0 ? 0 : Math.round((stats.correct / stats.seen) * 100);
  const ratio = Math.min(1, span.into / span.need);
  const r = 34;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="rise">
      <div className="card flex items-center gap-5 rounded-3xl border border-line p-5">
        <svg viewBox="0 0 80 80" className="size-24 shrink-0 -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-line" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            className="stroke-accent transition-[stroke-dashoffset] duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
          />
          <text
            x="40"
            y="40"
            dy="0.35em"
            textAnchor="middle"
            className="rotate-90 fill-fg font-display text-[26px] font-bold"
            style={{ transformOrigin: "40px 40px" }}
          >
            {span.level}
          </text>
        </svg>
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">Level</p>
          <p className="font-display text-3xl font-bold">Nivel {span.level}</p>
          <p className="mt-1 text-sm text-muted tabular-nums">
            {span.need - span.into} XP to level {span.level + 1}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Streak" value={String(stats.streak)} />
        <Stat label="Best" value={String(stats.best)} />
        <Stat label="Accuracy" value={stats.seen === 0 ? "—" : `${rate}%`} />
      </dl>
      <p className="mt-2 px-1 text-xs text-muted tabular-nums">
        {stats.seen} answered · {stats.typed} typed · {stats.picked} chosen
      </p>
      {speech.tries > 0 ? (
        <p className="mt-1 flex items-center gap-1 px-1 text-xs text-muted tabular-nums">
          <Mic className="size-3" aria-hidden="true" /> {speech.perfect} of {speech.tries} spoken perfectly · best
          speaking streak {speech.best}
        </p>
      ) : null}

      <PlacementCard />

      <BadgeGrid />

      <h2 className="mt-7 px-1 text-xs font-semibold tracking-widest text-muted uppercase">By tense</h2>
      <ul className="card mt-2 divide-y divide-line rounded-3xl border border-line px-4">
        {pack().tenses.map((tense) => {
          const row = stats.byTense[tense];
          const rowRate = !row || row.seen === 0 ? 0 : Math.round((row.correct / row.seen) * 100);
          return (
            <li key={tense} className="flex items-center gap-3 py-3">
              <div className="w-28">
                <p className="text-sm font-semibold">{pack().tenseTitle(tense)}</p>
                <p className="text-xs text-muted">{tenseHome(tense)}</p>
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="xp-fill h-full rounded-full" style={{ width: `${rowRate}%` }} />
              </div>
              <p className="w-16 text-right text-sm text-muted tabular-nums">
                {!row || row.seen === 0 ? "—" : `${rowRate}%`}
              </p>
            </li>
          );
        })}
      </ul>

      {stats.misses.length > 0 ? (
        <>
          <h2 className="mt-7 px-1 text-xs font-semibold tracking-widest text-muted uppercase">Review your misses</h2>
          <ul className="mt-2 space-y-2">
            {stats.misses.map((id) => {
              const missed = itemById(id);
              if (!missed) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onPractice(id)}
                    className="tap flex min-h-12 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-2 text-left text-sm hover:border-accent"
                  >
                    <RotateCcw className="size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{sentence(missed)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {stats.seen > 0 ? (
        <div className="mt-10 border-t border-line pt-5">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="w-full text-sm text-muted">Erase your level, streaks and history on this device?</p>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setConfirming(false);
                }}
                className="tap min-h-11 rounded-full bg-bad px-5 font-semibold text-ink"
              >
                Erase progress
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="tap min-h-11 rounded-full border border-line px-5 text-fg"
              >
                Keep it
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="tap text-sm text-muted underline">
              Reset progress
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PlacementCard() {
  const placement = usePlay((state) => state.placement);
  const setView = usePlay((state) => state.setView);
  return (
    <div className="card mt-3 flex items-center gap-3 rounded-2xl border border-line p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent" aria-hidden="true">
        <FlaskConical className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        {placement ? (
          <>
            <p className="text-sm font-semibold">
              Placement: {placement.label}{" "}
              <span className="font-normal text-muted tabular-nums">
                ({placement.right}/{placement.total})
              </span>
            </p>
            <p className="text-xs text-muted">{PLACEMENT_BLURB[placement.label]}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">Placement test</p>
            <p className="text-xs text-muted">Optional · 15 questions · finds your level</p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => setView("placement")}
        className="tap shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
      >
        {placement ? "Retake" : "Start"}
      </button>
    </div>
  );
}

function tenseHome(tense: Tense): string {
  const band = pack().items.find((item) => item.tense === tense)?.band ?? 1;
  const level: Difficulty = band <= 2 ? "facil" : band <= 4 ? "medio" : "dificil";
  return pack().levels[level].native;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card rounded-2xl border border-line px-3 py-3">
      <dt className="text-[11px] font-semibold tracking-widest text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
