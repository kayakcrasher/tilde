import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import {
  CHOICE_POINTS,
  TYPE_POINTS,
  answerOf,
  choicesFor,
  countFor,
  difficultyFor,
  gradeTyped,
  itemById,
  levelSpan,
  sentence,
} from "@/lib/tilde/engine";
import { usePlay } from "@/lib/tilde/store";
import { DIFFICULTIES, PERSONS, TENSES, type Difficulty, type Item, type Tense } from "@/lib/tilde/types";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: "Fácil",
  medio: "Medio",
  dificil: "Difícil",
};

const DIFFICULTY_EN: Record<Difficulty, string> = {
  facil: "Easy",
  medio: "Medium",
  dificil: "Hard",
};

const DIFFICULTY_HELP: Record<Difficulty, string> = {
  facil: "Present tense. A small line names the verb, the tense, and who does it.",
  medio: "Preterite and imperfect. You only get the verb and the tense.",
  dificil: "Future, conditional, and subjunctive. No hint — use the English meaning.",
};

export function Tilde() {
  const stats = usePlay((state) => state.stats);
  const cardId = usePlay((state) => state.cardId);
  const view = usePlay((state) => state.view);
  const difficulty = usePlay((state) => state.difficulty);
  const setView = usePlay((state) => state.setView);
  const setDifficulty = usePlay((state) => state.setDifficulty);
  const resolve = usePlay((state) => state.resolve);
  const draw = usePlay((state) => state.draw);
  const item = itemById(cardId);
  const span = levelSpan(stats.xp);

  useEffect(() => {
    void Promise.resolve(usePlay.persist.rehydrate()).then(() => {
      const state = usePlay.getState();
      if (!itemById(state.cardId)) state.draw();
    });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="mx-auto flex max-w-xl items-center gap-3 px-4 py-4">
        <p className="font-display text-3xl font-semibold tracking-tight text-fg">Tilde</p>
        <p className="text-sm text-muted tabular-nums">Level {span.level}</p>
        <p className="ml-auto flex items-center gap-1 text-sm tabular-nums text-fg" aria-label="Streak">
          <Flame className="size-4 text-accent" aria-hidden="true" />
          {stats.streak}
        </p>
      </header>
      <nav className="mx-auto flex max-w-xl gap-2 px-4" aria-label="Sections">
        <Tab on={view === "play"} onClick={() => setView("play")} label="Play" hint="Jugar" />
        <Tab on={view === "stats"} onClick={() => setView("stats")} label="Stats" hint="Progreso" />
      </nav>
      <div className="mx-auto mt-4 flex max-w-xl gap-2 px-4" role="group" aria-label="Difficulty">
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setDifficulty(level)}
            aria-pressed={difficulty === level}
            className={`tap min-h-11 flex-1 rounded-full border px-2 py-1 text-sm leading-tight ${
              difficulty === level ? "border-accent bg-accent text-ink" : "border-line text-fg"
            }`}
          >
            <span className="block">{DIFFICULTY_EN[level]}</span>
            <span className={`block text-xs ${difficulty === level ? "text-ink" : "text-muted"}`}>
              {DIFFICULTY_LABEL[level]}
            </span>
          </button>
        ))}
      </div>
      <p className="mx-auto mt-2 max-w-xl px-4 text-sm text-muted">
        {countFor(difficulty)} sentences. {DIFFICULTY_HELP[difficulty]}
      </p>
      <main className="mx-auto max-w-xl px-4 pt-6 pb-16">
        {view === "stats" || !item ? (
          <Progress stats={stats} span={span} onPractice={draw} />
        ) : (
          <Play key={item.id} item={item} onResolve={resolve} onNext={() => draw()} />
        )}
      </main>
    </div>
  );
}

function Tab({
  on,
  onClick,
  label,
  hint,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on ? "page" : undefined}
      className={`tap min-h-11 rounded-full px-4 py-1 text-sm leading-tight ${on ? "bg-accent text-ink" : "text-fg"}`}
    >
      <span className="block">{label}</span>
      <span className={`block text-xs ${on ? "text-ink" : "text-muted"}`}>{hint}</span>
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
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; points: number; accent: boolean; via: "type" | "choice" } | null>(
    null,
  );
  const answer = answerOf(item);
  const choices = choicesFor(item);
  const difficulty = difficultyFor(item);
  const typePoints = TYPE_POINTS[difficulty];
  const choicePoints = CHOICE_POINTS[difficulty];
  const showHint = difficulty !== "dificil" || result !== null;
  const left = !item.before ? "" : /[¿¡]$/.test(item.before) ? item.before : `${item.before} `;
  const tail = !item.after ? "" : /^[,.?;!]/.test(item.after) ? item.after : ` ${item.after}`;

  function finish(raw: string, via: "type" | "choice") {
    if (result) return;
    const graded = gradeTyped(raw, answer);
    const accent = via === "type" && graded.accent;
    const points = onResolve(item, graded.ok, via, accent);
    setResult({ ok: graded.ok, points, accent, via });
  }

  function goNext() {
    setDraft("");
    setOpen(false);
    setResult(null);
    onNext();
  }

  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">
        {showHint
          ? `${item.verb} · ${item.tense}${difficulty === "facil" || result ? ` · ${PERSONS[item.person]}` : ""}`
          : "No hint"}
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold leading-snug text-fg md:text-4xl">
        {left}
        <span className={result ? "text-accent" : "inline-block min-w-16 border-b-2 border-accent"}>
          {result ? answer : "\u00a0"}
        </span>
        {tail}
      </h1>
      <p className="mt-4 text-base text-muted">{item.en}</p>

      {result ? (
        <div className="mt-8">
          <p className="font-display text-3xl font-semibold text-fg">{result.ok ? "Correct." : "Not that one."}</p>
          <p className="mt-2 text-base text-muted">
            {result.ok
              ? result.via === "type" && !result.accent
                ? `Right verb, missing the accent. +${result.points}`
                : `+${result.points}`
              : `The form is ${answer}. Streak back to zero.`}
          </p>
          <button type="button" onClick={goNext} className="tap mt-6 min-h-11 rounded-full bg-accent px-5 text-ink">
            Next
          </button>
        </div>
      ) : (
        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            finish(draft, open ? "choice" : "type");
          }}
        >
          <label className="text-sm text-muted" htmlFor="answer">
            {open
              ? `Choices are worth ${choicePoints}. Typing now scores the same, because you can see them.`
              : `Type the missing verb for ${typePoints} points. A choice is worth ${choicePoints}.`}
          </label>
          <input
            id="answer"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            lang="es"
            placeholder="type the verb"
            className="mt-2 w-full border-b border-line bg-transparent py-3 font-display text-3xl font-semibold text-fg placeholder:text-muted"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" className="tap min-h-11 rounded-full bg-accent px-5 text-ink">
              Check
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="tap min-h-11 rounded-full border border-line px-5 text-fg"
            >
              Choices
            </button>
          </div>
          {open ? (
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {choices.map((choice) => (
                <li key={choice}>
                  <button
                    type="button"
                    onClick={() => finish(choice, "choice")}
                    className="tap min-h-11 w-full rounded-2xl border border-line bg-surface px-3 text-fg"
                  >
                    {choice}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </form>
      )}
    </div>
  );
}

function Progress({
  stats,
  span,
  onPractice,
}: {
  stats: ReturnType<typeof usePlay.getState>["stats"];
  span: { level: number; into: number; need: number };
  onPractice: (id: string) => void;
}) {
  const rate = stats.seen === 0 ? 0 : Math.round((stats.correct / stats.seen) * 100);
  const width = Math.min(100, Math.round((span.into / span.need) * 100));
  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">Stats</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-fg">Level {span.level}</h1>
      <p className="mt-2 text-sm text-muted tabular-nums">{span.into} / {span.need} XP to the next level.</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full bg-accent" style={{ width: `${width}%` }} />
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Streak" value={String(stats.streak)} />
        <Stat label="Best" value={String(stats.best)} />
        <Stat label="Accuracy" value={stats.seen === 0 ? "—" : `${rate}%`} />
      </dl>
      <p className="mt-3 text-sm text-muted tabular-nums">
        Typed {stats.typed} · Chosen {stats.picked}
      </p>
      <ul className="mt-6 divide-y divide-line">
        {TENSES.map((tense) => {
          const row = stats.byTense[tense];
          const rowRate = !row || row.seen === 0 ? 0 : Math.round((row.correct / row.seen) * 100);
          return (
            <li key={tense} className="flex items-center gap-3 py-3">
              <p className="w-28 text-sm text-fg capitalize">{tense}</p>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent" style={{ width: `${rowRate}%` }} />
              </div>
              <p className="w-16 text-right text-sm text-muted">{tenseHome(tense)}</p>
            </li>
          );
        })}
      </ul>
      {stats.misses.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs tracking-widest text-muted uppercase">Review</p>
          <p className="mt-1 text-sm text-muted">Tap a sentence you missed.</p>
          <ul className="mt-3 space-y-2">
            {stats.misses.map((id) => {
              const missed = itemById(id);
              if (!missed) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onPractice(id)}
                    className="tap min-h-11 w-full rounded-2xl border border-line bg-surface px-4 text-left text-sm text-fg"
                  >
                    {sentence(missed)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function tenseHome(tense: Tense): string {
  if (tense === "presente") return "Fácil";
  if (tense === "pretérito" || tense === "imperfecto") return "Medio";
  return "Difícil";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-3">
      <dt className="text-xs tracking-widest text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold text-fg">{value}</dd>
    </div>
  );
}
