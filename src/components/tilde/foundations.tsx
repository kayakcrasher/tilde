import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, RotateCcw, Volume2, X } from "lucide-react";
import { LESSONS, type Lesson, type LessonTask } from "@/lib/tilde/packs/ga/foundations";
import { hasVoice, speakIn } from "@/lib/tilde/speech";
import { usePlay, type View } from "@/lib/tilde/store";
import { KnotDivider, Ogham, Triskele } from "./celtic";
import { PronLine } from "./pronline";
import { buzz } from "./shared";

function shuffled<T>(list: T[], seed: string): T[] {
  const copy = [...list];
  let n = 0;
  for (let i = 0; i < seed.length; i += 1) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    n = (n * 1103515245 + 12345) >>> 0;
    const j = n % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function Foundations() {
  const lessons = usePlay((s) => s.lessons);
  const [openId, setOpenId] = useState<string | null>(null);
  const lesson = LESSONS.find((l) => l.id === openId);
  if (lesson) return <LessonView key={lesson.id} lesson={lesson} onBack={() => setOpenId(null)} onOpen={setOpenId} />;

  const done = LESSONS.filter((l) => lessons[l.id]).length;
  const nextUp = LESSONS.find((l) => !lessons[l.id]);
  return (
    <div className="rise">
      <div className="card flex items-center gap-4 rounded-3xl border border-line p-5">
        <Triskele progress={done / LESSONS.length} className="size-20 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">An Bunús · Foundations</p>
          <h1 className="mt-1 font-display text-2xl leading-tight font-bold">How Irish thinks</h1>
          <p className="mt-1 text-sm text-muted tabular-nums">
            {done} of {LESSONS.length} lessons
          </p>
        </div>
      </div>
      <p className="mt-4 px-1 text-sm leading-relaxed text-muted">
        Irish isn't English with different words. It puts the verb first, has no word for “have”, lets feelings sit on you,
        and changes the first sound of words to carry meaning. These short lessons build that foundation, one idea at a
        time — each with the <span className="font-semibold text-fg">Irish lens</span>: the English rebuilt in Irish order.
      </p>
      <KnotDivider className="my-5" />
      <ol className="relative space-y-3 pl-6">
        <span className="absolute top-3 bottom-3 left-[11px] w-0.5 rounded bg-line" aria-hidden="true" />
        {LESSONS.map((l, i) => {
          const isDone = Boolean(lessons[l.id]);
          const isNext = nextUp?.id === l.id;
          return (
            <li key={l.id} className="relative">
              <span
                className={`absolute top-1/2 -left-6 grid size-6 -translate-y-1/2 place-items-center rounded-full border-2 text-[10px] font-bold ${
                  isDone ? "border-accent bg-accent text-ink" : isNext ? "border-accent bg-bg text-accent" : "border-line bg-bg text-muted"
                }`}
                aria-hidden="true"
              >
                {isDone ? <Check className="size-3" strokeWidth={3.5} /> : i + 1}
              </span>
              <button
                type="button"
                onClick={() => setOpenId(l.id)}
                className={`tap card flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                  isNext ? "border-accent/60" : "border-line"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold tracking-wider text-accent" lang="ga">
                    {l.ga}
                  </span>
                  <span className="block font-semibold">{l.title}</span>
                </span>
                {isNext ? <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">Next</span> : null}
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LessonView({ lesson, onBack, onOpen }: { lesson: Lesson; onBack: () => void; onOpen: (id: string) => void }) {
  const finishLesson = usePlay((s) => s.finishLesson);
  const setView = usePlay((s) => s.setView);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const index = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[index + 1];
  const allDone = lesson.tasks.every((_, i) => answers[i] !== undefined);
  const right = Object.values(answers).filter(Boolean).length;

  return (
    <div className="rise space-y-5">
      <button type="button" onClick={onBack} className="tap flex items-center gap-1.5 px-1 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" /> All lessons
      </button>
      <header className="px-1">
        <Ogham text={lesson.ga} />
        <p className="mt-2 text-sm font-semibold tracking-wide text-accent" lang="ga">
          {index + 1}. {lesson.ga}
        </p>
        <h1 className="font-display text-3xl leading-tight font-bold">{lesson.title}</h1>
      </header>
      <p className="px-1 text-[15px] leading-relaxed text-fg/90">{lesson.intro}</p>
      <ul className="card space-y-2 rounded-3xl border border-line p-4">
        {lesson.points.map((p) => (
          <li key={p} className="flex gap-2.5 text-sm leading-relaxed">
            <span className="mt-1.5 size-2 shrink-0 rotate-45 rounded-[2px] bg-accent" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="px-1 text-xs font-semibold tracking-widest text-muted uppercase">Through the Irish lens</h2>
        <div className="mt-2 space-y-2">
          {lesson.examples.map((ex) => (
            <article key={ex.ga} className="card rounded-2xl border border-line p-4">
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 font-display text-xl leading-snug font-semibold" lang="ga">
                  {ex.ga}
                </p>
                {hasVoice("ga") ? (
                  <button
                    type="button"
                    onClick={() => void speakIn("ga", ex.ga)}
                    className="tap grid size-9 shrink-0 place-items-center rounded-full border border-line"
                    aria-label={`Listen: ${ex.ga}`}
                  >
                    <Volume2 className="size-4 text-accent" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <PronLine text={ex.ga} className="mt-1.5" />
              <p className="mt-2 text-[15px] text-accent italic">{ex.lens}</p>
              <p className="text-sm text-muted">{ex.en}</p>
              {ex.note ? <p className="mt-1 text-xs text-muted">↳ {ex.note}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <KnotDivider />

      <section>
        <h2 className="px-1 text-xs font-semibold tracking-widest text-muted uppercase">Try it</h2>
        <div className="mt-2 space-y-3">
          {lesson.tasks.map((task, i) => (
            <Task key={i} task={task} seed={`${lesson.id}-${i}`} onAnswer={(ok) => setAnswers((a) => (a[i] === undefined ? { ...a, [i]: ok } : a))} />
          ))}
        </div>
      </section>

      {allDone ? (
        <div className="rise card rounded-3xl border border-accent/40 p-5 text-center">
          <p className="font-display text-2xl font-bold">Maith thú!</p>
          <p className="text-sm text-muted">
            Well done — {right} of {lesson.tasks.length} right first time.
          </p>
          <div className="mt-4 grid gap-2">
            {lesson.next ? (
              <button
                type="button"
                onClick={() => {
                  finishLesson(lesson.id, right);
                  setView(lesson.next!.view as View);
                }}
                className="tap min-h-12 rounded-2xl bg-accent font-semibold text-ink"
              >
                {lesson.next.label}
              </button>
            ) : null}
            {next ? (
              <button
                type="button"
                onClick={() => {
                  finishLesson(lesson.id, right);
                  onOpen(next.id);
                }}
                className={`tap min-h-12 rounded-2xl font-semibold ${lesson.next ? "border border-line bg-surface" : "bg-accent text-ink"}`}
              >
                Next: {next.title}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                finishLesson(lesson.id, right);
                onBack();
              }}
              className="tap min-h-11 text-sm font-semibold text-muted"
            >
              Back to lessons
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Task({ task, seed, onAnswer }: { task: LessonTask; seed: string; onAnswer: (ok: boolean) => void }) {
  if (task.type === "choice") return <ChoiceTask task={task} seed={seed} onAnswer={onAnswer} />;
  return <OrderTask task={task} seed={seed} onAnswer={onAnswer} />;
}

function ChoiceTask({ task, seed, onAnswer }: { task: Extract<LessonTask, { type: "choice" }>; seed: string; onAnswer: (ok: boolean) => void }) {
  const correct = task.options[task.answer];
  const options = useMemo(() => shuffled(task.options, seed), [task, seed]);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="card rounded-3xl border border-line p-4">
      <p className="font-semibold">{task.q}</p>
      <div className="mt-3 grid gap-2">
        {options.map((o) => {
          const tone = picked
            ? o === correct
              ? "border-good/60 bg-good/10"
              : o === picked
                ? "border-bad/60 bg-bad/10"
                : "border-line opacity-50"
            : "border-line bg-surface/60 hover:border-accent";
          return (
            <button
              key={o}
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(o);
                onAnswer(o === correct);
                buzz(o === correct ? 10 : [20, 40, 20]);
              }}
              className={`tap flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[15px] ${tone}`}
            >
              <span className="min-w-0 flex-1">{o}</span>
              {picked && o === correct ? <Check className="size-4 text-good" aria-hidden="true" /> : null}
              {picked === o && o !== correct ? <X className="size-4 text-bad" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Rebuild the English in Irish word order. */
function OrderTask({ task, seed, onAnswer }: { task: Extract<LessonTask, { type: "order" }>; seed: string; onAnswer: (ok: boolean) => void }) {
  const bank = useMemo(() => {
    let order = shuffled(task.tiles.map((t, i) => ({ t, i })), seed);
    // Never start already solved.
    if (order.every((x, i) => x.i === i)) order = [...order.slice(1), order[0]];
    return order;
  }, [task, seed]);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const built = picked.map((i) => task.tiles[i]);
  const complete = picked.length === task.tiles.length;
  return (
    <div className="card rounded-3xl border border-line p-4">
      <p className="text-xs font-semibold tracking-widest text-accent uppercase">Put it in Irish order</p>
      <p className="mt-1 font-semibold">“{task.en}”</p>
      <div className={`mt-3 flex min-h-12 flex-wrap gap-2 border-b-2 pb-2 ${result === null ? "border-line" : result ? "border-good/60" : "border-bad/60"}`}>
        {picked.map((i) => (
          <button
            key={i}
            type="button"
            disabled={result !== null}
            onClick={() => setPicked((p) => p.filter((x) => x !== i))}
            className="tap pop rounded-xl border border-accent/50 bg-accent/10 px-3 py-1.5 font-semibold"
          >
            {task.tiles[i]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {bank.map(({ t, i }) => (
          <button
            key={i}
            type="button"
            disabled={picked.includes(i) || result !== null}
            onClick={() => setPicked((p) => [...p, i])}
            className={`tap rounded-xl border px-3 py-1.5 font-semibold ${
              picked.includes(i) ? "border-line/50 bg-line/30 text-transparent" : "border-line bg-surface hover:border-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {result === null ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setPicked([])}
            disabled={picked.length === 0}
            className="tap grid size-11 place-items-center rounded-2xl border border-line disabled:opacity-40"
            aria-label="Clear"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={!complete}
            onClick={() => {
              const ok = built.every((w, k) => w === task.tiles[k]);
              setResult(ok);
              onAnswer(ok);
              buzz(ok ? 10 : [20, 40, 20]);
            }}
            className="tap min-h-11 flex-1 rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
          >
            Check
          </button>
        </div>
      ) : (
        <div className="rise mt-3 rounded-2xl bg-line/40 px-3 py-2 text-sm">
          <p className={result ? "font-semibold text-good" : "font-semibold text-bad"}>
            {result ? "That's the Irish shape!" : `Irish order: ${task.tiles.join(" ")}`}
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold" lang="ga">
            {task.ga}
          </p>
          <PronLine text={task.ga} className="mt-1" />
        </div>
      )}
    </div>
  );
}
