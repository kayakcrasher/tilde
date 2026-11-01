import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Crown, Heart, Lock, Star, Trophy, Volume2, X, Zap } from "lucide-react";
import { answerOf, atSentenceStart, capitalize, gradeTyped, parts, sentence } from "@/lib/tilde/engine";
import { pack } from "@/lib/tilde/lang";
import { hasVoice, speak } from "@/lib/tilde/speech";
import { usePlay } from "@/lib/tilde/store";
import { LEVELS_PER_SKILL, curriculum, gradeWords, makeLesson, makeTestOut, type Exercise, type Skill } from "@/lib/tilde/tree";
import { wordsIn } from "@/lib/tilde/vocab";
import { PronLine } from "./pronline";
import { AccentKeys, Chip, buzz } from "./shared";

// Lets browser tests read answers; only compiled in when VITE_TEST_HOOKS is set.
if (import.meta.env.VITE_TEST_HOOKS && typeof window !== "undefined") {
  (window as unknown as { __tildeAnswer: typeof answerOf }).__tildeAnswer = answerOf;
}

const UNIT_COLORS = ["#ff5a36", "#4cc38a", "#5aa9ff", "#c084fc", "#f5b942", "#ff6b9a"];

type Session = { kind: "lesson"; skill: Skill } | { kind: "test"; unitIndex: number };

export function Lessons() {
  const [session, setSession] = useState<Session | null>(null);
  if (session) return <Runner key={JSON.stringify(session)} session={session} onExit={() => setSession(null)} />;
  return <Path onStart={setSession} />;
}

// ---------------- the path ----------------

function Path({ onStart }: { onStart: (s: Session) => void }) {
  const skills = usePlay((s) => s.skills);
  const testedOut = usePlay((s) => s.testedOut);
  const units = curriculum();
  const [open, setOpen] = useState<string | null>(null);
  const flat = units.flatMap((u) => u.skills);
  const unlocked = (skill: Skill) => {
    const i = flat.indexOf(skill);
    if (i === 0 || (skills[skill.id] ?? 0) > 0) return true;
    const unit = units.find((u) => u.skills.includes(skill))!;
    if (testedOut.includes(unit.id)) return true;
    return (skills[flat[i - 1].id] ?? 0) > 0;
  };
  const current = flat.find((s) => unlocked(s) && !(skills[s.id] ?? 0));
  const total = flat.length;
  const started = flat.filter((s) => (skills[s.id] ?? 0) > 0).length;
  const crowns = flat.reduce((n, s) => n + (skills[s.id] ?? 0), 0);

  return (
    <div className="rise">
      <div className="card flex items-center gap-4 rounded-3xl border border-line p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">Lesson path</p>
          <p className="mt-0.5 font-display text-xl font-bold">
            {pack().native} · {started}/{total} skills
          </p>
          <p className="mt-0.5 text-xs text-muted">Lessons build the verbs and words that make you better at the Cloze game.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 font-bold text-accent tabular-nums">
          <Crown className="size-4" aria-hidden="true" /> {crowns}
        </div>
      </div>

      {units.map((unit, ui) => {
        const color = UNIT_COLORS[ui % UNIT_COLORS.length];
        const unitOpen = unit.skills.some(unlocked);
        const allDone = unit.skills.every((s) => (skills[s.id] ?? 0) > 0);
        return (
          <section key={unit.id} className="mt-7">
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink" style={{ background: color }}>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-widest uppercase opacity-80">Unit {ui + 1}</p>
                <p className="font-display text-lg leading-tight font-bold">{unit.title}</p>
                <p className="text-xs opacity-80">{unit.subtitle}</p>
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
            <ol className="mt-5 flex flex-col items-center gap-4">
              {unit.skills.map((skill, si) => {
                const level = skills[skill.id] ?? 0;
                const isOpen = unlocked(skill);
                const offset = [0, 56, 84, 56, 0, -56, -84, -56][si % 8];
                return (
                  <li key={skill.id} className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
                    {current?.id === skill.id ? (
                      <span className="pop mb-1 rounded-xl border border-line bg-surface px-3 py-1 text-xs font-bold text-accent shadow">
                        Start
                      </span>
                    ) : null}
                    <SkillNode
                      skill={skill}
                      level={level}
                      locked={!isOpen}
                      color={color}
                      onClick={() => setOpen(open === skill.id ? null : skill.id)}
                    />
                    {open === skill.id ? (
                      <SkillCard skill={skill} level={level} locked={!isOpen} color={color} onStart={() => onStart({ kind: "lesson", skill })} />
                    ) : null}
                  </li>
                );
              })}
              <li className="flex flex-col items-center">
                <span
                  className={`grid size-16 place-items-center rounded-2xl border-4 ${allDone ? "text-ink" : "border-line bg-surface text-muted"}`}
                  style={allDone ? { background: color, borderColor: color } : undefined}
                  aria-label={allDone ? "Unit complete" : "Unit checkpoint"}
                >
                  <Trophy className="size-7" aria-hidden="true" />
                </span>
              </li>
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function SkillNode({ skill, level, locked, color, onClick }: { skill: Skill; level: number; locked: boolean; color: string; onClick: () => void }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <button type="button" onClick={onClick} className="tap relative grid size-[84px] place-items-center" aria-label={`${skill.title}, level ${level} of ${LEVELS_PER_SKILL}${locked ? ", locked" : ""}`}>
      <svg viewBox="0 0 84 84" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="42" cy="42" r={r} fill="none" strokeWidth="5" className="stroke-line" />
        <circle cx="42" cy="42" r={r} fill="none" strokeWidth="5" stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - level / LEVELS_PER_SKILL)} />
      </svg>
      <span
        className={`grid size-[64px] place-items-center rounded-full border-b-4 ${locked ? "border-line bg-line/60 text-muted" : "text-ink"}`}
        style={locked ? undefined : { background: color, borderColor: "rgb(0 0 0 / 0.25)" }}
      >
        {locked ? <Lock className="size-6" aria-hidden="true" /> : level >= LEVELS_PER_SKILL ? <Crown className="size-7" aria-hidden="true" /> : <Star className="size-7 fill-current" aria-hidden="true" />}
      </span>
      {level > 0 ? (
        <span className="absolute -right-1 bottom-1 grid size-6 place-items-center rounded-full border-2 border-bg bg-fg text-[11px] font-bold text-bg">{level}</span>
      ) : null}
    </button>
  );
}

function SkillCard({ skill, level, locked, color, onStart }: { skill: Skill; level: number; locked: boolean; color: string; onStart: () => void }) {
  const done = level >= LEVELS_PER_SKILL;
  return (
    <div className="rise z-10 mt-2 w-64 rounded-2xl border p-4 text-center text-ink shadow-xl" style={{ background: color, borderColor: color }}>
      <p className="text-[11px] font-bold tracking-widest uppercase opacity-80">{pack().tenseTitle(skill.tense)}</p>
      <p className="mt-0.5 font-display text-lg leading-tight font-bold" lang={pack().code}>
        {skill.verbs.join(", ")}
      </p>
      <p className="mt-1 text-xs opacity-80">{locked ? "Finish the skill before this one to unlock it." : done ? "Complete — practise any time." : `Level ${level + 1} of ${LEVELS_PER_SKILL}`}</p>
      <button
        type="button"
        disabled={locked}
        onClick={onStart}
        className="tap mt-3 min-h-11 w-full rounded-xl bg-ink/85 font-bold text-white disabled:opacity-50"
      >
        {locked ? "Locked" : done ? "Practise" : level === 0 ? "Start" : "Continue"}
      </button>
    </div>
  );
}

// ---------------- session runner ----------------

type Outcome = { ok: boolean; solution: string; detail?: string };

function Runner({ session, onExit }: { session: Session; onExit: () => void }) {
  const complete = usePlay((s) => s.completeSkillLesson);
  const passTestOut = usePlay((s) => s.passTestOut);
  const markSeen = usePlay((s) => s.markSeen);
  const level = usePlay((s) => (session.kind === "lesson" ? s.skills[session.skill.id] ?? 0 : 0));
  const voice = hasVoice();
  const initial = useMemo(
    () => (session.kind === "lesson" ? makeLesson(session.skill, Math.min(level, LEVELS_PER_SKILL - 1), voice) : makeTestOut(session.unitIndex, voice)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [firstTry, setFirstTry] = useState({ right: 0, total: initial.length });
  const missed = useRef(new Set<Exercise>());
  // Test-out: three hearts on screen. Three right in a row quietly earns a
  // spare, which isn't shown — the display never goes above three.
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const bonusGiven = useRef(false);
  const [finished, setFinished] = useState<null | { xp: number; passed: boolean }>(null);
  const isTest = session.kind === "test";
  const exercise = queue[index];
  // Hearts on screen drop with every mistake; the hidden spare only shows as
  // "still going on the last heart".
  const shown = lives <= 0 ? 0 : Math.max(1, Math.min(3 - wrongs, lives));

  function onAnswer(o: Outcome) {
    setOutcome(o);
    buzz(o.ok ? 12 : [30, 60, 30]);
    if (exercise.kind === "cloze" || exercise.kind === "build" || exercise.kind === "listen") markSeen(wordsIn(sentence(exercise.item, answerOf(exercise.item))));
    if (o.ok) {
      if (!missed.current.has(exercise)) setFirstTry((f) => ({ ...f, right: f.right + 1 }));
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
        // Lessons: bring the exercise back at the end.
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
        const xp = complete(session.skill.id, firstTry.right / Math.max(1, firstTry.total));
        setFinished({ xp, passed: true });
      } else {
        const units = curriculum().slice(0, session.unitIndex + 1);
        passTestOut(units[units.length - 1].id, units.flatMap((u) => u.skills.map((s) => s.id)));
        setFinished({ xp: 30, passed: true });
      }
      return;
    }
    setIndex(index + 1);
  }

  if (finished) return <Finish passed={finished.passed} xp={finished.xp} test={isTest} accuracy={firstTry.right / Math.max(1, firstTry.total)} onDone={onExit} onCloze={session.kind === "lesson" ? () => playCloze(session.skill) : undefined} />;

  return (
    <div className="rise pb-40">
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
      <div className="mt-5" key={index}>
        <ExerciseView exercise={exercise} locked={outcome !== null} onAnswer={onAnswer} />
      </div>
      {outcome ? (
        <div className={`fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${outcome.ok ? "border-good/40 bg-[#123222]" : "border-bad/40 bg-[#3a1717]"}`}>
          <div className="mx-auto max-w-xl">
            <p className={`flex items-center gap-2 font-display text-xl font-bold ${outcome.ok ? "text-good" : "text-bad"}`}>
              {outcome.ok ? <Check className="size-6" strokeWidth={3} aria-hidden="true" /> : <X className="size-6" strokeWidth={3} aria-hidden="true" />}
              {outcome.ok ? ["Great!", "Nice!", "Correct!", "Spot on!"][index % 4] : "Correct answer:"}
            </p>
            {!outcome.ok || outcome.detail ? (
              <p className="mt-1 text-[15px] text-fg" lang={pack().code}>
                {outcome.ok ? outcome.detail : outcome.solution}
              </p>
            ) : null}
            <button
              type="button"
              autoFocus
              onClick={next}
              className={`tap mt-3 min-h-13 w-full rounded-2xl font-bold text-ink ${outcome.ok ? "bg-good" : "bg-bad"}`}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Jump into the Cloze game on a sentence from this skill's verbs. */
function playCloze(skill: Skill) {
  const items = pack().items.filter((it) => it.tense === skill.tense && skill.verbs.includes(it.verb));
  if (items.length) usePlay.getState().draw(items[Math.floor(Math.random() * items.length)].id);
}

function Finish({
  passed,
  xp,
  test,
  accuracy,
  onDone,
  onCloze,
}: {
  passed: boolean;
  xp: number;
  test: boolean;
  accuracy: number;
  onDone: () => void;
  onCloze?: () => void;
}) {
  return (
    <div className="rise card mt-6 rounded-3xl border border-line p-6 text-center">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-accent/15 text-accent">
        {passed ? <Trophy className="size-10" aria-hidden="true" /> : <Heart className="size-10" aria-hidden="true" />}
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold">
        {passed ? (test ? "You tested out!" : "Lesson complete!") : "Out of hearts"}
      </h1>
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
      {onCloze ? (
        <button type="button" onClick={onCloze} className="tap mt-2 min-h-12 w-full rounded-2xl border-2 border-line font-semibold text-fg hover:border-accent">
          Play these verbs in Cloze
        </button>
      ) : null}
    </div>
  );
}

// ---------------- exercises ----------------

function ExerciseView({ exercise, locked, onAnswer }: { exercise: Exercise; locked: boolean; onAnswer: (o: Outcome) => void }) {
  switch (exercise.kind) {
    case "cloze":
      return <Cloze ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "conjugate":
      return (
        <Choice
          title="Pick the right form"
          prompt={
            <div className="flex flex-wrap gap-1.5">
              <Chip tone="accent">{exercise.verb}</Chip>
              <Chip>{pack().tenseTitle(exercise.tense)}</Chip>
              <Chip>{pack().persons[exercise.person]}</Chip>
            </div>
          }
          options={exercise.options}
          answer={exercise.answer}
          locked={locked}
          onAnswer={onAnswer}
          display
        />
      );
    case "meaning":
      return (
        <Choice
          title={exercise.reverse ? `Which ${pack().name} word means…` : "What does this mean?"}
          prompt={
            <div>
              <p className="font-display text-3xl font-bold" lang={exercise.reverse ? "en" : pack().code}>
                {exercise.reverse ? exercise.entry.en : exercise.entry.word}
              </p>
              {!exercise.reverse ? <PronLine text={exercise.entry.word} className="mt-1" /> : null}
            </div>
          }
          options={exercise.options}
          answer={exercise.reverse ? exercise.entry.word : exercise.entry.en}
          locked={locked}
          onAnswer={onAnswer}
          display={exercise.reverse}
        />
      );
    case "match":
      return <Match ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "build":
      return <BuildEx ex={exercise} locked={locked} onAnswer={onAnswer} />;
    case "listen":
      return <Listen ex={exercise} locked={locked} onAnswer={onAnswer} />;
  }
}

function Title({ children }: { children: string }) {
  return <h2 className="font-display text-2xl font-bold">{children}</h2>;
}

function CheckButton({ disabled, onClick, hidden }: { disabled: boolean; onClick: () => void; hidden: boolean }) {
  if (hidden) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
      <button type="button" disabled={disabled} onClick={onClick} className="tap mx-auto block min-h-13 w-full max-w-xl rounded-2xl bg-accent font-bold text-ink disabled:opacity-40">
        Check
      </button>
    </div>
  );
}

function Choice({
  title,
  prompt,
  options,
  answer,
  locked,
  onAnswer,
  display = false,
}: {
  title: string;
  prompt: React.ReactNode;
  options: string[];
  answer: string;
  locked: boolean;
  onAnswer: (o: Outcome) => void;
  display?: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <Title>{title}</Title>
      <div className="mt-4">{prompt}</div>
      <ul className="mt-5 grid gap-2">
        {options.map((o, i) => {
          const tone = locked
            ? o === answer
              ? "border-good/60 bg-good/10"
              : o === picked
                ? "border-bad/60 bg-bad/10"
                : "border-line opacity-50"
            : o === picked
              ? "border-accent bg-accent/12"
              : "border-line bg-surface hover:border-accent";
          return (
            <li key={o}>
              <button
                type="button"
                disabled={locked}
                onClick={() => setPicked(o)}
                className={`tap flex min-h-13 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left ${tone} ${display ? "font-display text-lg font-semibold" : "text-[15px]"}`}
                lang={display ? pack().code : undefined}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line text-[11px] text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">{o}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <CheckButton hidden={locked} disabled={!picked} onClick={() => onAnswer({ ok: picked === answer, solution: answer })} />
    </div>
  );
}

function Cloze({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "cloze" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const { left, tail } = parts(ex.item);
  const answer = answerOf(ex.item);
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const full = sentence(ex.item, answer);
  const shown = atSentenceStart(ex.item) ? capitalize(answer) : answer;
  const fit = (w: string | null) => (w && atSentenceStart(ex.item) ? capitalize(w) : w);
  const check = () => {
    if (ex.typed) {
      const g = gradeTyped(draft, answer);
      onAnswer({ ok: g.ok, solution: full, detail: g.ok && !g.accent ? `Watch the ${pack().markWord}: ${answer}` : undefined });
    } else onAnswer({ ok: picked === answer, solution: full });
  };
  return (
    <div>
      <Title>{ex.typed ? "Type the missing verb" : "Fill the gap"}</Title>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip tone="accent">{ex.item.verb}</Chip>
        <Chip>{pack().tenseTitle(ex.item.tense)}</Chip>
      </div>
      <p className="mt-4 font-display text-2xl leading-snug font-semibold" lang={pack().code}>
        {left}
        <span className={locked ? "rounded-lg bg-good/15 px-1 text-good" : "inline-block min-w-16 border-b-[3px] border-accent"}>
          {locked ? shown : fit(picked) ?? " "}
        </span>
        {tail}
      </p>
      {locked ? <PronLine text={full} className="mt-2" /> : null}
      <p className="mt-2 text-sm text-muted">{ex.item.en}</p>
      {ex.typed ? (
        <div className="mt-5">
          <input
            ref={inputRef}
            value={draft}
            readOnly={locked}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            lang={pack().code}
            aria-label="Missing verb"
            placeholder="Type the verb…"
            className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 font-display text-xl font-semibold focus:border-accent focus:outline-none"
          />
          {!locked ? <AccentKeys inputRef={inputRef} value={draft} onChange={setDraft} /> : null}
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-2">
          {ex.options.map((o) => (
            <li key={o}>
              <button
                type="button"
                disabled={locked}
                onClick={() => setPicked(o)}
                className={`tap min-h-14 w-full rounded-2xl border-2 px-3 font-display text-lg font-semibold ${
                  locked ? (o === answer ? "border-good/60 bg-good/10" : o === picked ? "border-bad/60 bg-bad/10" : "border-line opacity-50") : o === picked ? "border-accent bg-accent/12" : "border-line bg-surface"
                }`}
                lang={pack().code}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
      <CheckButton hidden={locked} disabled={ex.typed ? !draft.trim() : !picked} onClick={check} />
    </div>
  );
}

function BuildEx({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "build" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  return (
    <div>
      <Title>Build this sentence</Title>
      <p className="mt-3 text-lg font-semibold">{ex.item.en}</p>
      <div className="mt-4 flex min-h-14 flex-wrap content-start gap-2 border-b-2 border-line pb-3">
        {picked.map((i) => (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => setPicked((p) => p.filter((x) => x !== i))}
            className="tap pop rounded-xl border-2 border-accent/50 bg-accent/10 px-3 py-1.5 font-display text-lg font-semibold"
            lang={pack().code}
          >
            {ex.bank[i]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {ex.bank.map((w, i) => (
          <button
            key={i}
            type="button"
            disabled={locked || picked.includes(i)}
            onClick={() => setPicked((p) => [...p, i])}
            className={`tap rounded-xl border-2 px-3 py-1.5 font-display text-lg font-semibold ${picked.includes(i) ? "border-line/50 bg-line/30 text-transparent" : "border-line bg-surface"}`}
            lang={pack().code}
          >
            {w}
          </button>
        ))}
      </div>
      <CheckButton
        hidden={locked}
        disabled={picked.length === 0}
        onClick={() => onAnswer({ ok: gradeWords(picked.map((i) => ex.bank[i]), ex.target).ok, solution: ex.target.join(" ") })}
      />
    </div>
  );
}

function Listen({ ex, locked, onAnswer }: { ex: Extract<Exercise, { kind: "listen" }>; locked: boolean; onAnswer: (o: Outcome) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    void speak(ex.text).catch(() => {});
  }, [ex.text]);
  return (
    <div>
      <Title>What did you hear?</Title>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => void speak(ex.text)} className="tap grid size-20 place-items-center rounded-2xl bg-accent text-ink" aria-label="Play again">
          <Volume2 className="size-9" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => void speak(ex.text, true)} className="tap grid size-20 place-items-center rounded-2xl border-2 border-line bg-surface text-sm font-bold" aria-label="Play slowly">
          slow
        </button>
      </div>
      <ul className="mt-6 grid gap-2">
        {ex.options.map((o) => (
          <li key={o}>
            <button
              type="button"
              disabled={locked}
              onClick={() => setPicked(o)}
              className={`tap min-h-13 w-full rounded-2xl border-2 px-4 py-2 text-left text-[15px] ${
                locked ? (o === ex.text ? "border-good/60 bg-good/10" : o === picked ? "border-bad/60 bg-bad/10" : "border-line opacity-50") : o === picked ? "border-accent bg-accent/12" : "border-line bg-surface"
              }`}
              lang={pack().code}
            >
              {o}
            </button>
          </li>
        ))}
      </ul>
      <CheckButton hidden={locked} disabled={!picked} onClick={() => onAnswer({ ok: picked === ex.text, solution: ex.text, detail: ex.item.en })} />
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
  function tryMatch(word: string, en: string) {
    const ok = ex.pairs.some((p) => p.word === word && p.en === en);
    if (ok) {
      const next = [...done, word];
      setDone(next);
      setSel(null);
      buzz(8);
      if (next.length === ex.pairs.length) onAnswer({ ok: mistakes.current === 0, solution: ex.pairs.map((p) => `${p.word} = ${p.en}`).join(" · ") });
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
              key={p.word}
              type="button"
              disabled={locked || done.includes(p.word)}
              onClick={() => setSel(p.word)}
              className={`tap min-h-13 w-full rounded-2xl border-2 px-2 font-display font-semibold ${
                done.includes(p.word) ? "border-line/40 text-muted/40" : sel === p.word ? "border-accent bg-accent/12" : "border-line bg-surface"
              }`}
              lang={pack().code}
            >
              {p.word}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((p) => (
            <button
              key={p.en}
              type="button"
              disabled={locked || done.includes(p.word) || !sel}
              onClick={() => sel && tryMatch(sel, p.en)}
              className={`tap min-h-13 w-full rounded-2xl border-2 px-2 text-sm ${
                done.includes(p.word) ? "border-line/40 text-muted/40" : wrong === p.en ? "border-bad bg-bad/10" : "border-line bg-surface"
              }`}
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
