import { useState } from "react";
import { ArrowLeft, BookOpen, Check, ChevronRight, Eye, EyeOff, Snail, Volume2, X } from "lucide-react";
import { pack } from "@/lib/tilde/lang";
import { hasVoice, speak } from "@/lib/tilde/speech";
import { usePlay } from "@/lib/tilde/store";
import { DIFFICULTIES, type Story } from "@/lib/tilde/types";
import { Chip, buzz } from "./shared";
import { PronLine } from "./pronline";

const LEVEL_EN = { facil: "Easy", medio: "Medium", dificil: "Hard" } as const;

export function Stories() {
  const [openId, setOpenId] = useState<string | null>(null);
  const scores = usePlay((state) => state.stories);
  const stories = pack().stories;
  const story = stories.find((s) => s.id === openId);

  if (story) return <StoryView key={story.id} story={story} onBack={() => setOpenId(null)} />;

  return (
    <div className="rise space-y-6">
      <p className="px-1 text-sm text-muted">
        Read a short story, then answer a few questions to check you understood it. Tap a story to start.
      </p>
      {DIFFICULTIES.map((level) => {
        const list = stories.filter((s) => s.level === level);
        if (list.length === 0) return null;
        return (
          <section key={level}>
            <h2 className="px-1 text-xs font-semibold tracking-widest text-muted uppercase">
              {LEVEL_EN[level]} · {pack().levels[level].native}
            </h2>
            <ul className="mt-2 space-y-2">
              {list.map((s) => {
                const score = scores[s.id];
                const perfect = score && score.best === score.total;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(s.id)}
                      className="tap card flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line px-4 py-3 text-left hover:border-accent"
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                          perfect ? "bg-good/15 text-good" : score ? "bg-accent/15 text-accent" : "bg-line/60 text-muted"
                        }`}
                        aria-hidden="true"
                      >
                        {perfect ? <Check className="size-5" strokeWidth={3} /> : <BookOpen className="size-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg leading-tight font-semibold" lang={pack().code}>
                          {s.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {score ? `Best: ${score.best} / ${score.total}` : `${s.questions.length} questions`}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function StoryView({ story, onBack }: { story: Story; onBack: () => void }) {
  const finishStory = usePlay((state) => state.finishStory);
  const [showEn, setShowEn] = useState(false);
  const [picks, setPicks] = useState<(number | null)[]>(() => story.questions.map(() => null));
  const [checked, setChecked] = useState<null | { right: number; xp: number }>(null);
  const voice = hasVoice();
  const allPicked = picks.every((p) => p !== null);

  function check() {
    const right = story.questions.filter((q, i) => picks[i] === q.answer).length;
    const xp = finishStory(story.id, right, story.questions.length);
    setChecked({ right, xp });
    buzz(right === story.questions.length ? 12 : [20, 40, 20]);
  }

  function retry() {
    setPicks(story.questions.map(() => null));
    setChecked(null);
  }

  return (
    <div className="rise">
      <button
        type="button"
        onClick={onBack}
        className="tap mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> All stories
      </button>

      <article className="card rounded-3xl border border-line p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="accent">{LEVEL_EN[story.level]}</Chip>
          <Chip>{pack().levels[story.level].native}</Chip>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl" lang={pack().code}>
          {story.title}
        </h1>
        {pack().code === "ga" ? (
          <div className="mt-4 space-y-3">
            {story.text.split(/(?<=[.!?])\s+/).map((line, i) => (
              <div key={i}>
                <p className="text-[17px] leading-relaxed text-fg" lang="ga">
                  {line}
                </p>
                <PronLine text={line} className="mt-1" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[17px] leading-relaxed text-fg" lang={pack().code}>
            {story.text}
          </p>
        )}
        {showEn ? <p className="rise mt-4 border-t border-line pt-4 text-[15px] leading-relaxed text-muted">{story.en}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowEn((v) => !v)}
            className="tap flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold"
          >
            {showEn ? <EyeOff className="size-4 text-accent" aria-hidden="true" /> : <Eye className="size-4 text-accent" aria-hidden="true" />}
            {showEn ? "Hide English" : "Show English"}
          </button>
          {voice ? (
            <>
              <button
                type="button"
                onClick={() => void speak(story.text)}
                className="tap flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold"
              >
                <Volume2 className="size-4 text-accent" aria-hidden="true" /> Listen
              </button>
              <button
                type="button"
                onClick={() => void speak(story.text, true)}
                className="tap flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold"
              >
                <Snail className="size-4 text-accent" aria-hidden="true" /> Slowly
              </button>
            </>
          ) : null}
        </div>
      </article>

      <h2 className="mt-7 px-1 text-xs font-semibold tracking-widest text-muted uppercase">Check your understanding</h2>
      <ol className="mt-2 space-y-3">
        {story.questions.map((q, qi) => (
          <li key={q.q} className="card rounded-3xl border border-line p-4">
            <p className="font-semibold">
              <span className="text-muted">{qi + 1}. </span>
              {q.q}
            </p>
            <div className="mt-3 grid gap-2" role="radiogroup" aria-label={q.q}>
              {q.options.map((option, oi) => {
                const picked = picks[qi] === oi;
                const correct = q.answer === oi;
                const state = checked
                  ? correct
                    ? "border-good/60 bg-good/10"
                    : picked
                      ? "border-bad/60 bg-bad/10"
                      : "border-line opacity-60"
                  : picked
                    ? "border-accent bg-accent/12"
                    : "border-line bg-surface/60 hover:border-muted";
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    disabled={checked !== null}
                    onClick={() => setPicks((prev) => prev.map((p, i) => (i === qi ? oi : p)))}
                    className={`tap flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[15px] ${state}`}
                  >
                    <span className="min-w-0 flex-1">{option}</span>
                    {checked && correct ? <Check className="size-4 shrink-0 text-good" aria-hidden="true" /> : null}
                    {checked && picked && !correct ? <X className="size-4 shrink-0 text-bad" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      {checked ? (
        <div
          className={`rise mt-4 flex items-center gap-3 rounded-3xl border p-4 ${
            checked.right === story.questions.length ? "border-good/30 bg-good/10" : "border-accent/30 bg-accent/10"
          }`}
          aria-live="polite"
        >
          <p className="font-display text-3xl font-bold tabular-nums">
            {checked.right}/{story.questions.length}
          </p>
          <p className="min-w-0 flex-1 text-sm text-muted">
            {checked.right === story.questions.length
              ? "You understood every detail."
              : "Have another read — the green answers show what you missed."}
          </p>
          {checked.xp > 0 ? (
            <span className="pop shrink-0 rounded-full bg-good px-2.5 py-1 text-sm font-bold text-ink">+{checked.xp}</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {checked ? (
          <>
            <button type="button" onClick={retry} className="tap min-h-12 rounded-2xl border border-line bg-surface text-sm font-semibold">
              Try again
            </button>
            <button type="button" onClick={onBack} className="tap min-h-12 rounded-2xl bg-accent text-sm font-semibold text-ink">
              More stories
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={!allPicked}
            className="tap col-span-2 min-h-13 rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
          >
            {allPicked ? "Check answers" : "Answer every question"}
          </button>
        )}
      </div>
    </div>
  );
}
