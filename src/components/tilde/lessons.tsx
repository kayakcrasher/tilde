import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Crown, Heart, Lightbulb, Lock, Sparkles, Star, Trophy, Turtle, Volume2, X, Zap } from "lucide-react";
import { pack } from "@/lib/tilde/lang";
import { hasVoice, speak } from "@/lib/tilde/speech";
import { usePlay } from "@/lib/tilde/store";
import { gradeWords, isTeaching, lessonsInOrder, makeLesson, makeTestOut, type Exercise, type FlatLesson } from "@/lib/tilde/tree";
import type { Phrase } from "@/lib/tilde/types";
import { wordsIn } from "@/lib/tilde/vocab";
import { PronLine } from "./pronline";
import { buzz } from "./shared";

const UNIT_COLORS = ["#ff5a36", "#4cc38a", "#5aa9ff", "#c084fc", "#f5b942", "#ff6b9a"];
/** Irish keeps to its Celtic greens and golds. */
const UNIT_COLORS_GA = ["#4cc38a", "#e0b45a", "#5fb3b3", "#9ccf6e", "#d9925a", "#7fb2e0"];
const unitColor = (i: number) => {
  const list = pack().code === "ga" ? UNIT_COLORS_GA : UNIT_COLORS;
  return list[i % list.length];
};
/** Each lesson can be finished this many times (crowns). */
const CROWNS = 3;

/** What's planned after the beginner units (shown at the end of the path). */
const COMING = ["Daily routine", "Describing things", "Weather & seasons", "Shopping", "Plans for the weekend", "What happened yesterday"];

type Session = { kind: "lesson"; index: number } | { kind: "test"; unitIndex: number };

export function Lessons() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [session]);
  if (session) return <Runner key={JSON.stringify(session)} session={session} onExit={() => setSession(null)} />;
  return <Path onStart={setSession} />;
}

const say = (text: string, slow = false) => {
  void speak(text, slow).catch(() => {});
};

// ---------------- the path ----------------

function Path({ onStart }: { onStart: (s: Session) => void }) {
  const done = usePlay((s) => s.skills);
  const testedOut = usePlay((s) => s.testedOut);
  const units = pack().course;
  const flat = lessonsInOrder();
  const [open, setOpen] = useState<string | null>(null);
  const count = (l: FlatLesson) => done[l.id] ?? 0;
  const unlocked = (l: FlatLesson) => l.index === 0 || count(l) > 0 || testedOut.includes(l.unit.id) || count(flat[l.index - 1]) > 0;
  const current = flat.find((l) => unlocked(l) && count(l) === 0);
  const finished = flat.filter((l) => count(l) > 0).length;
  const crowns = flat.reduce((n, l) => n + count(l), 0);

  return (
    <div className="rise">
      <div className="card flex items-center gap-4 rounded-3xl border border-line p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">Lessons</p>
          <p className="mt-0.5 font-display text-xl font-bold">
            {pack().native} · {finished}/{flat.length}
          </p>
          <p className="mt-0.5 text-xs text-muted">Start from zero: words and phrases first, with pictures and sound.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 font-bold text-accent tabular-nums" aria-label={`${crowns} crowns`}>
          <Crown className="size-4" aria-hidden="true" /> {crowns}
        </div>
      </div>

      {units.map((unit, ui) => {
        const color = unitColor(ui);
        const lessons = flat.filter((l) => l.unitIndex === ui);
        const unitOpen = lessons.some(unlocked);
        const allDone = lessons.every((l) => count(l) > 0);
        return (
          <section key={unit.id} className="mt-7">
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink" style={{ background: color }}>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-widest uppercase opacity-80">Unit {ui + 1}</p>
                <p className="font-display text-lg leading-tight font-bold">{unit.title}</p>
                <p className="text-xs opacity-80">{unit.about}</p>
              </div>
              {!unitOpen ? (
                <button
                  type="button"
                  onClick={() => onStart({ kind: "test", unitIndex: ui })}
                  className="tap flex shrink-0 items-center gap-1 rounded-full bg-ink/85 px-3 py-2 text-xs font-bold text-white"
                >
                  <Zap className="size-3.5" aria-hidden="true" /> Jump here?
                </button>
              ) : null}
            </div>
            <ol className="mt-5 flex flex-col items-center gap-3">
              {lessons.map((lesson, li) => {
                const isOpen = unlocked(lesson);
                const offset = [0, 52, 72, 52, 0, -52, -72, -52][li % 8];
                return (
                  <li key={lesson.id} className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
                    {current?.id === lesson.id ? (
                      <span className="pop mb-1 rounded-xl border border-line bg-surface px-3 py-1 text-xs font-bold text-accent shadow">Start</span>
                    ) : null}
                    <LessonNode lesson={lesson} crowns={count(lesson)} locked={!isOpen} color={color} onClick={() => setOpen(open === lesson.id ? null : lesson.id)} />
                    <span className={`mt-1 text-xs font-semibold ${isOpen ? "text-fg" : "text-muted"}`}>{lesson.title}</span>
                    {open === lesson.id ? (
                      <LessonCard lesson={lesson} crowns={count(lesson)} locked={!isOpen} color={color} onStart={() => onStart({ kind: "lesson", index: lesson.index })} />
                    ) : null}
                  </li>
                );
              })}
              <li className="flex flex-col items-center">
                <span
                  className={`grid size-14 place-items-center rounded-2xl border-4 ${allDone ? "text-ink" : "border-line bg-surface text-muted"}`}
                  style={allDone ? { background: color, borderColor: color } : undefined}
                  aria-label={allDone ? "Unit complete" : "Unit checkpoint"}
                >
                  <Trophy className="size-6" aria-hidden="true" />
                </span>
              </li>
            </ol>
          </section>
        );
      })}

      <section className="card mt-8 rounded-3xl border border-dashed border-line p-5 text-center">
        <Sparkles className="mx-auto size-6 text-accent" aria-hidden="true" />
        <p className="mt-2 font-display text-lg font-bold">More units on the way</p>
        <p className="mt-1 text-sm text-muted">{COMING.join(" · ")}</p>
        <p className="mt-2 text-xs text-muted">Meanwhile, Play has hundreds of Cloze sentences to sharpen your verbs.</p>
      </section>
    </div>
  );
}

function LessonNode({ lesson, crowns, locked, color, onClick }: { lesson: FlatLesson; crowns: number; locked: boolean; color: string; onClick: () => void }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap relative grid size-[76px] place-items-center"
      aria-label={`${lesson.title}${locked ? ", locked" : crowns ? `, done ${crowns} of ${CROWNS}` : ""}`}
    >
      <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="5" className="stroke-line" />
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="5" stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(crowns, CROWNS) / CROWNS)} />
      </svg>
      <span
        className={`grid size-[58px] place-items-center rounded-full border-b-4 ${locked ? "border-line bg-line/60 text-muted" : "text-ink"}`}
        style={locked ? undefined : { background: color, borderColor: "rgb(0 0 0 / 0.25)" }}
      >
        {locked ? <Lock className="size-6" aria-hidden="true" /> : crowns >= CROWNS ? <Crown className="size-7" aria-hidden="true" /> : crowns > 0 ? <Check className="size-7" strokeWidth={3} aria-hidden="true" /> : <Star className="size-7 fill-current" aria-hidden="true" />}
      </span>
    </button>
  );
}

function LessonCard({ lesson, crowns, locked, color, onStart }: { lesson: FlatLesson; crowns: number; locked: boolean; color: string; onStart: () => void }) {
  return (
    <div className="rise z-10 mt-2 w-64 rounded-2xl border p-4 text-center text-ink shadow-xl" style={{ background: color, borderColor: color }}>
      <p className="font-display text-lg leading-tight font-bold">{lesson.title}</p>
      <p className="mt-1 text-sm opacity-90" lang={pack().code}>
        {lesson.phrases
          .slice(0, 4)
          .map((p) => p.t)
          .join(" · ")}
        {lesson.phrases.length > 4 ? " …" : ""}
      </p>
      <p className="mt-1 text-xs opacity-80">
        {locked ? "Finish the lesson before this one to unlock it." : crowns > 0 ? "Done — practise to earn another crown." : `${lesson.phrases.length} new words and phrases`}
      </p>
      <button type="button" disabled={locked} onClick={onStart} className="tap mt-3 min-h-11 w-full rounded-xl bg-ink/85 font-bold text-white disabled:opacity-50">
        {locked ? "Locked" : crowns > 0 ? "Practise" : "Start"}
      </button>
    </div>
  );
}

// ---------------- session runner ----------------

type Outcome = { ok: boolean; solution: string; meaning?: string };

function Runner({ session, onExit }: { session: Session; onExit: () => void }) {
  const complete = usePlay((s) => s.completeSkillLesson);
  const passTestOut = usePlay((s) => s.passTestOut);
  const markSeen = usePlay((s) => s.markSeen);
  const crowns = usePlay((s) => (session.kind === "lesson" ? s.skills[lessonsInOrder()[session.index].id] ?? 0 : 0));
  const voice = hasVoice();
  const initial = useMemo(
    () => (session.kind === "lesson" ? makeLesson(session.index, crowns > 0, voice) : makeTestOut(session.unitIndex, voice)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const graded = initial.filter((e) => !isTeaching(e)).length;
  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [right, setRight] = useState(0);
  const missed = useRef(new Set<Exercise>());
  // Test-out: three hearts on screen. Three right in a row quietly earns a
  // spare, which is never shown.
  const [lives, setLives] = useState(3);
  const [wrongs, setWrongs] = useState(0);
  const [streak, setStreak] = useState(0);
  const bonusGiven = useRef(false);
  const [finished, setFinished] = useState<null | { xp: number; passed: boolean }>(null);
  const isTest = session.kind === "test";
  const exercise = queue[index];
  // Hearts drop with every mistake; the hidden spare only shows as "still going on the last heart".
  const shown = lives <= 0 ? 0 : Math.max(1, Math.min(3 - wrongs, lives));

  function onAnswer(o: Outcome) {
    setOutcome(o);
    buzz(o.ok ? 12 : [30, 60, 30]);
    if ("p" in exercise) markSeen(wordsIn(exercise.p.t));
    if (o.ok) {
      if (!missed.current.has(exercise)) setRight((r) => r + 1);
      if (isTest) {
        const s = streak + 1;
        setStreak(s);
        if (s >= 3 && !bonusGiven.current) {
          bonusGiven.current = true;
          setLives((l) => l + 1);
        }
      }
    } else {
      missed.current.add(exercise);
      if (isTest) {
        setStreak(0);
        setWrongs((w) => w + 1);
        setLives((l) => l - 1);
      } else {
        // Lessons: bring it back at the end.
        setQueue((q) => [...q, exercise]);
      }
    }
  }

  function next() {
    setOutcome(null);
    if (isTest && lives <= 0) {
      setFinished({ xp: 0, passed: false });
      return;
    }
    if (index + 1 >= queue.length) {
      if (session.kind === "lesson") {
        const xp = complete(lessonsInOrder()[session.index].id, right / Math.max(1, graded));
        setFinished({ xp, passed: true });
      } else {
        const ids = lessonsInOrder()
          .filter((l) => l.unitIndex <= session.unitIndex)
          .map((l) => l.id);
        passTestOut(pack().course[session.unitIndex].id, ids);
        setFinished({ xp: 30, passed: true });
      }
      return;
    }
    setIndex(index + 1);
  }

  if (finished) return <Finish passed={finished.passed} xp={finished.xp} test={isTest} accuracy={right / Math.max(1, graded)} onDone={onExit} />;

  return (
    <div className="rise pb-44">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} className="tap grid size-9 place-items-center rounded-full text-muted hover:text-fg" aria-label="Leave">
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-good transition-[width] duration-500" style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
        {isTest ? (
          <span className="flex items-center gap-0.5" aria-label={`${shown} lives`}>
            {[0, 1, 2].map((i) => (
              <Heart key={i} className={`size-5 ${i < shown ? "fill-bad text-bad" : "text-line"}`} aria-hidden="true" />
            ))}
          </span>
        ) : null}
      </div>
      <div className="mt-6" key={index}>
        {exercise.kind === "tip" ? (
          <TipCard ex={exercise} onNext={next} />
        ) : exercise.kind === "intro" ? (
          <IntroCard p={exercise.p} onNext={next} />
        ) : (
          <ExerciseView exercise={exercise} locked={outcome !== null} onAnswer={onAnswer} />
        )}
      </div>
      {outcome ? (
        <div className={`fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${outcome.ok ? "border-good/40 bg-[#123222]" : "border-bad/40 bg-[#3a1717]"}`}>
          <div className="mx-auto max-w-xl">
            <p className={`flex items-center gap-2 font-display text-xl font-bold ${outcome.ok ? "text-good" : "text-bad"}`}>
              {outcome.ok ? <Check className="size-6" strokeWidth={3} aria-hidden="true" /> : <X className="size-6" strokeWidth={3} aria-hidden="true" />}
              {outcome.ok ? ["Great!", "Nice!", "Correct!", "Spot on!"][index % 4] : "Correct answer:"}
            </p>
            {!outcome.ok ? (
              <p className="mt-1 text-[17px] font-semibold text-fg" lang={pack().code}>
                {outcome.solution}
              </p>
            ) : null}
            {outcome.meaning ? <p className="mt-0.5 text-sm text-muted">{outcome.meaning}</p> : null}
            <button type="button" autoFocus onClick={next} className={`tap mt-3 min-h-13 w-full rounded-2xl font-bold text-ink ${outcome.ok ? "bg-good" : "bg-bad"}`}>
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Finish({ passed, xp, test, accuracy, onDone }: { passed: boolean; xp: number; test: boolean; accuracy: number; onDone: () => void }) {
  return (
    <div className="rise card mt-6 rounded-3xl border border-line p-6 text-center">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-accent/15 text-accent">
        {passed ? <Trophy className="size-10" aria-hidden="true" /> : <Heart className="size-10" aria-hidden="true" />}
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold">{passed ? (test ? "You tested out!" : "Lesson complete!") : "Out of hearts"}</h1>
      <p className="mt-2 text-sm text-muted">
        {passed
          ? test
            ? "Everything up to this unit is unlocked. Nicely done."
            : `${Math.round(accuracy * 100)}% right first time.`
          : "Not this time — work through the lessons and try the jump again later."}
      </p>
      {xp > 0 ? <p className="pop mx-auto mt-4 w-fit rounded-full bg-good px-4 py-1.5 font-bold text-ink">+{xp} XP</p> : null}
      <button type="button" onClick={onDone} className="tap mt-6 min-h-13 w-full rounded-2xl bg-accent font-bold text-ink">
        Continue
      </button>
    </div>
  );
}

// ---------------- teaching cards ----------------

function BottomButton({ label, disabled = false, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
      <button type="button" disabled={disabled} onClick={onClick} className="tap mx-auto block min-h-13 w-full max-w-xl rounded-2xl bg-accent font-bold text-ink disabled:opacity-40">
        {label}
      </button>
    </div>
  );
}

function TipCard({ ex, onNext }: { ex: Extract<Exercise, { kind: "tip" }>; onNext: () => void }) {
  return (
    <div className="card rounded-3xl border border-line p-6">
      <div className="flex items-center gap-2 text-accent">
        <Lightbulb className="size-5" aria-hidden="true" />
        <p className="text-xs font-bold tracking-widest uppercase">Tip · {ex.title}</p>
      </div>
      <p className="mt-3 text-lg leading-relaxed">{ex.text}</p>
      <BottomButton label="Got it" onClick={onNext} />
    </div>
  );
}

function SpeakButtons({ text, size = "md" }: { text: string; size?: "md" | "lg" }) {
  if (!hasVoice()) return null;
  const big = size === "lg";
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => say(text)} className={`tap grid place-items-center rounded-2xl bg-accent text-ink ${big ? "size-20" : "size-11"}`} aria-label="Listen">
        <Volume2 className={big ? "size-9" : "size-5"} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => say(text, true)} className={`tap grid place-items-center rounded-2xl border-2 border-line bg-surface ${big ? "size-20" : "size-11"}`} aria-label="Listen slowly">
        <Turtle className={big ? "size-8" : "size-5"} aria-hidden="true" />
      </button>
    </div>
  );
}

function IntroCard({ p, onNext }: { p: Phrase; onNext: () => void }) {
  useEffect(() => {
    if (hasVoice()) say(p.t);
  }, [p.t]);
  const many = p.t.trim().includes(" ");
  return (
    <div className="card rounded-3xl border border-line p-6 text-center">
      <p className="text-xs font-bold tracking-widest text-accent uppercase">{many ? "New phrase" : "New word"}</p>
      {p.pic ? (
        <div className="mt-3 text-6xl" aria-hidden="true">
          {p.pic}
        </div>
      ) : null}
      <p className="mt-3 font-display text-4xl leading-tight font-bold" lang={pack().code}>
        {p.t}
      </p>
      <PronLine text={p.t} className="mt-2 flex flex-col items-center" />
      <p className="mt-3 text-xl">{p.en}</p>
      {p.lit ? (
        <p className="mx-auto mt-3 w-fit rounded-xl bg-accent/10 px-3 py-1.5 text-sm">
          <span className="text-muted">Word for word: </span>
          <span className="font-semibold">{p.lit}</span>
        </p>
      ) : null}
      {p.note ? <p className="mt-3 text-sm text-muted">{p.note}</p> : null}
      <div className="mt-5 flex justify-center">
        <SpeakButtons text={p.t} />
      </div>
      <BottomButton label="Continue" onClick={onNext} />
    </div>
  );
}

// ---------------- exercises ----------------

function ExerciseView({ exercise, locked, onAnswer }: { exercise: Exercise; locked: boolean; onAnswer: (o: Outcome) => void }) {
  switch (exercise.kind) {
    case "pick-en":
      return <PickEn ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "pick-t":
      return <PickT ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "tiles-t":
    case "tiles-en":
      return <Tiles ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "listen":
      return <Listen ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "match":
      return <Match ex={exercise} locked={locked} onAnswer={onAnswer} />;
    default:
      return null;
  }
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-bold">{children}</h2>;
}

function optionTone(locked: boolean, isAnswer: boolean, isPicked: boolean) {
  if (locked) return isAnswer ? "border-good/60 bg-good/10" : isPicked ? "border-bad/60 bg-bad/10" : "border-line opacity-50";
  return isPicked ? "border-accent bg-accent/12" : "border-line bg-surface hover:border-accent";
}

function PickEn({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "pick-en" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    if (hasVoice()) say(ex.p.t);
  }, [ex.p.t]);
  return (
    <div>
      <Title>What does this mean?</Title>
      <div className="mt-5 flex items-center gap-3">
        <SpeakButtons text={ex.p.t} />
        <p className="font-display text-3xl leading-tight font-bold" lang={pack().code}>
          {ex.p.t}
        </p>
      </div>
      <PronLine text={ex.p.t} className="mt-2" />
      <ul className="mt-6 grid gap-2">
        {ex.options.map((o) => (
          <li key={o}>
            <button type="button" disabled={locked} onClick={() => setPicked(o)} className={`tap min-h-13 w-full rounded-2xl border-2 px-4 text-left text-[17px] ${optionTone(locked, o === ex.p.en, o === picked)}`}>
              {o}
            </button>
          </li>
        ))}
      </ul>
      {!locked ? <BottomButton label="Check" disabled={!picked} onClick={() => onAnswer({ ok: picked === ex.p.en, solution: ex.p.en, meaning: picked === ex.p.en ? undefined : ex.p.t })} /> : null}
    </div>
  );
}

function PickT({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "pick-t" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choose = (q: Phrase) => {
    setPicked(q.t);
    if (hasVoice()) say(q.t);
  };
  return (
    <div>
      <Title>
        Which one is “{ex.p.en}”?
      </Title>
      {ex.pics ? (
        <ul className="mt-6 grid grid-cols-2 gap-3">
          {ex.options.map((q) => (
            <li key={q.t}>
              <button type="button" disabled={locked} onClick={() => choose(q)} className={`tap flex w-full flex-col items-center gap-2 rounded-2xl border-2 px-2 pt-4 pb-3 ${optionTone(locked, q.t === ex.p.t, q.t === picked)}`}>
                <span className="text-5xl" aria-hidden="true">
                  {q.pic}
                </span>
                <span className="font-display text-lg font-semibold" lang={pack().code}>
                  {q.t}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 grid gap-2">
          {ex.options.map((q) => (
            <li key={q.t}>
              <button type="button" disabled={locked} onClick={() => choose(q)} className={`tap min-h-13 w-full rounded-2xl border-2 px-4 text-left font-display text-lg font-semibold ${optionTone(locked, q.t === ex.p.t, q.t === picked)}`} lang={pack().code}>
                {q.t}
              </button>
            </li>
          ))}
        </ul>
      )}
      {locked ? <PronLine text={ex.p.t} className="mt-3" /> : null}
      {!locked ? <BottomButton label="Check" disabled={!picked} onClick={() => onAnswer({ ok: picked === ex.p.t, solution: ex.p.t, meaning: ex.p.en })} /> : null}
    </div>
  );
}

function Tiles({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "tiles-t" | "tiles-en" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const toTarget = ex.kind === "tiles-t";
  useEffect(() => {
    if (!toTarget && hasVoice()) say(ex.p.t);
  }, [ex.p.t, toTarget]);
  const tap = (i: number) => {
    setPicked((p) => [...p, i]);
    if (toTarget && hasVoice() && pack().code !== "ga") say(ex.bank[i]);
  };
  return (
    <div>
      <Title>{toTarget ? `Write this in ${pack().name}` : "Write this in English"}</Title>
      {toTarget ? (
        <p className="mt-4 text-xl font-semibold">{ex.p.en}</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <SpeakButtons text={ex.p.t} />
          <p className="font-display text-2xl leading-tight font-bold" lang={pack().code}>
            {ex.p.t}
          </p>
        </div>
      )}
      <div className="mt-5 flex min-h-16 flex-wrap content-start gap-2 border-b-2 border-line pb-3">
        {picked.map((i) => (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => setPicked((p) => p.filter((x) => x !== i))}
            className="tap pop rounded-xl border-2 border-accent/50 bg-accent/10 px-3 py-1.5 text-lg font-semibold"
            lang={toTarget ? pack().code : "en"}
          >
            {ex.bank[i]}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2" data-bank>
        {ex.bank.map((w, i) => (
          <button
            key={i}
            type="button"
            disabled={locked || picked.includes(i)}
            onClick={() => tap(i)}
            className={`tap rounded-xl border-2 px-3 py-1.5 text-lg font-semibold ${picked.includes(i) ? "border-line/50 bg-line/30 text-transparent" : "border-line bg-surface"}`}
            lang={toTarget ? pack().code : "en"}
          >
            {w}
          </button>
        ))}
      </div>
      {locked && toTarget ? <PronLine text={ex.p.t} className="mt-4" /> : null}
      {!locked ? (
        <BottomButton
          label="Check"
          disabled={picked.length === 0}
          onClick={() => onAnswer({ ok: gradeWords(picked.map((i) => ex.bank[i]), ex.target).ok, solution: toTarget ? ex.p.t : ex.p.en, meaning: toTarget ? ex.p.en : ex.p.t })}
        />
      ) : null}
    </div>
  );
}

function Listen({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "listen" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    say(ex.p.t);
  }, [ex.p.t]);
  return (
    <div>
      <Title>What do you hear?</Title>
      <div className="mt-5">
        <SpeakButtons text={ex.p.t} size="lg" />
      </div>
      <ul className="mt-6 grid gap-2">
        {ex.options.map((q) => (
          <li key={q.t}>
            <button type="button" disabled={locked} onClick={() => setPicked(q.t)} className={`tap min-h-13 w-full rounded-2xl border-2 px-4 text-left font-display text-lg font-semibold ${optionTone(locked, q.t === ex.p.t, q.t === picked)}`} lang={pack().code}>
              {q.t}
            </button>
          </li>
        ))}
      </ul>
      {!locked ? <BottomButton label="Check" disabled={!picked} onClick={() => onAnswer({ ok: picked === ex.p.t, solution: ex.p.t, meaning: ex.p.en })} /> : null}
    </div>
  );
}

function Match({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "match" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const left = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const right = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const [sel, setSel] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const mistakes = useRef(0);
  function tryMatch(t: string, en: string) {
    const ok = ex.pairs.some((p) => p.t === t && p.en === en);
    if (ok) {
      const next = [...done, t];
      setDone(next);
      setSel(null);
      buzz(8);
      if (next.length === ex.pairs.length) onAnswer({ ok: mistakes.current === 0, solution: ex.pairs.map((p) => `${p.t} = ${p.en}`).join(" · ") });
    } else {
      mistakes.current += 1;
      setWrong(en);
      setTimeout(() => setWrong(null), 500);
    }
  }
  return (
    <div>
      <Title>Match the pairs</Title>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="space-y-2">
          {left.map((p) => (
            <button
              key={p.t}
              type="button"
              disabled={locked || done.includes(p.t)}
              onClick={() => {
                setSel(p.t);
                if (hasVoice()) say(p.t);
              }}
              className={`tap min-h-13 w-full rounded-2xl border-2 px-2 font-display font-semibold ${done.includes(p.t) ? "border-line/40 text-muted/40" : sel === p.t ? "border-accent bg-accent/12" : "border-line bg-surface"}`}
              lang={pack().code}
            >
              {p.t}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((p) => (
            <button
              key={p.en}
              type="button"
              disabled={locked || done.includes(p.t) || !sel}
              onClick={() => sel && tryMatch(sel, p.en)}
              className={`tap min-h-13 w-full rounded-2xl border-2 px-2 text-sm ${done.includes(p.t) ? "border-line/40 text-muted/40" : wrong === p.en ? "border-bad bg-bad/10" : "border-line bg-surface"}`}
            >
              {p.en}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">Tap a word, then its meaning.</p>
    </div>
  );
}
