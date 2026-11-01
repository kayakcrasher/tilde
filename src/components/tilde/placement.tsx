import { useMemo, useState } from "react";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { answerOf, choicesFor, difficultyFor, gradeTyped, parts } from "@/lib/tilde/engine";
import { pack } from "@/lib/tilde/lang";
import { usePlay, type Placement } from "@/lib/tilde/store";
import { DIFFICULTIES, type Difficulty, type Item } from "@/lib/tilde/types";
import { Chip, buzz } from "./shared";

const PER_LEVEL = 5;
const LEVEL_EN = { facil: "Easy", medio: "Medium", dificil: "Hard" } as const;

/** Five sentences per level, spread across that level's tenses, easiest first. */
function buildTest(): Item[] {
  const out: Item[] = [];
  for (const level of DIFFICULTIES) {
    const pool = [...pack().items.filter((item) => difficultyFor(item) === level)].sort(() => Math.random() - 0.5);
    const byTense = new Map<string, Item[]>();
    for (const item of pool) byTense.set(item.tense, [...(byTense.get(item.tense) ?? []), item]);
    const picked: Item[] = [];
    while (picked.length < PER_LEVEL && [...byTense.values()].some((list) => list.length > 0)) {
      for (const list of byTense.values()) {
        const next = list.shift();
        if (next && picked.length < PER_LEVEL) picked.push(next);
      }
    }
    out.push(...picked);
  }
  return out;
}

function scoreTest(items: Item[], correct: boolean[]): Placement {
  const byLevel = {
    facil: { right: 0, total: 0 },
    medio: { right: 0, total: 0 },
    dificil: { right: 0, total: 0 },
  };
  items.forEach((item, i) => {
    const level = difficultyFor(item);
    byLevel[level].total += 1;
    if (correct[i]) byLevel[level].right += 1;
  });
  const pct = (l: Difficulty) => (byLevel[l].total ? byLevel[l].right / byLevel[l].total : 0);
  let level: Difficulty = "facil";
  let label = "Beginner";
  if (pct("facil") >= 0.6) label = "Elementary";
  if (pct("facil") >= 0.8 && pct("medio") >= 0.6) {
    level = "medio";
    label = "Intermediate";
  }
  if (pct("facil") >= 0.8 && pct("medio") >= 0.8 && pct("dificil") >= 0.6) {
    level = "dificil";
    label = "Advanced";
  }
  const right = correct.filter(Boolean).length;
  return { right, total: items.length, level, label, byLevel, at: Date.now() };
}

export const PLACEMENT_BLURB: Record<string, string> = {
  Beginner: "You're at the start — Easy mode will build the foundations fast.",
  Elementary: "You know the basics. Keep going with Easy until it feels automatic.",
  Intermediate: "You're comfortable with the present and ready for the past tenses.",
  Advanced: "You handle the hard tenses well. Jump straight into Hard.",
};

export function PlacementTest() {
  const setView = usePlay((state) => state.setView);
  const savePlacement = usePlay((state) => state.savePlacement);
  const items = useMemo(buildTest, []);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState<boolean[]>([]);
  const [result, setResult] = useState<Placement | null>(null);

  if (result) {
    return (
      <div className="rise">
        <article className="card rounded-3xl border border-line p-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <FlaskConical className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs font-semibold tracking-widest text-muted uppercase">Your {pack().name} level</p>
          <h1 className="mt-1 font-display text-4xl font-bold">{result.label}</h1>
          <p className="mt-2 text-sm text-muted tabular-nums">
            {result.right} of {result.total} correct
          </p>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed">{PLACEMENT_BLURB[result.label]}</p>
          <dl className="mt-6 grid grid-cols-3 gap-2 text-left">
            {DIFFICULTIES.map((level) => (
              <div key={level} className="rounded-2xl border border-line bg-surface px-3 py-3">
                <dt className="text-[11px] font-semibold tracking-widest text-muted uppercase">{LEVEL_EN[level]}</dt>
                <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
                  {result.byLevel[level].right}/{result.byLevel[level].total}
                </dd>
              </div>
            ))}
          </dl>
        </article>
        <button
          type="button"
          onClick={() => {
            savePlacement(result);
            setView("play");
          }}
          className="tap mt-4 min-h-13 w-full rounded-2xl bg-accent font-semibold text-ink"
        >
          Start practising at {LEVEL_EN[result.level]}
        </button>
      </div>
    );
  }

  const item = items[index];
  const { left, tail } = parts(item);
  const answer = answerOf(item);

  function pick(choice: string) {
    const ok = gradeTyped(choice, answer).ok;
    buzz(8);
    const next = [...correct, ok];
    setCorrect(next);
    if (index + 1 >= items.length) setResult(scoreTest(items, next));
    else setIndex(index + 1);
  }

  return (
    <div className="rise">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView("stats")}
          className="tap flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Leave test
        </button>
        <span className="ml-auto text-sm text-muted tabular-nums">
          {index + 1} / {items.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="xp-fill h-full rounded-full" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>

      <article key={item.id} className="rise card mt-4 rounded-3xl border border-line p-5 sm:p-7">
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="accent">{item.verb}</Chip>
          <Chip>{pack().tenseTitle(item.tense)}</Chip>
        </div>
        <h1 className="mt-5 font-display text-[1.75rem] leading-[1.25] font-semibold sm:text-3xl" lang={pack().code}>
          {left}
          <span className="inline-block min-w-20 border-b-[3px] border-accent align-baseline">{" "}</span>
          {tail}
        </h1>
        <p className="mt-5 border-t border-line pt-4 text-[15px] text-muted">{item.en}</p>
      </article>

      <ul key={`c-${item.id}`} className="mt-4 grid grid-cols-2 gap-2">
        {choicesFor(item).map((choice) => (
          <li key={choice}>
            <button
              type="button"
              onClick={() => pick(choice)}
              className="tap min-h-16 w-full rounded-2xl border border-line bg-surface px-3 font-display text-lg font-semibold hover:border-accent"
            >
              {choice}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-xs text-muted">
        No feedback until the end — just pick what you think. It gets harder as you go.
      </p>
    </div>
  );
}
