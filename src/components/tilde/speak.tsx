import { useEffect, useMemo, useRef, useState } from "react";
import { Ear, Mic, RefreshCw, Snail, Square, Volume2 } from "lucide-react";
import { answerOf, atSentenceStart, capitalize, difficultyFor, parts, sentence } from "@/lib/tilde/engine";
import { pack } from "@/lib/tilde/lang";
import { canListen, canSpeak, listen, scoreSpeech, speak, type Listening, type SpeechScore } from "@/lib/tilde/speech";
import { usePlay } from "@/lib/tilde/store";
import type { Difficulty, Item } from "@/lib/tilde/types";
import { Chip, buzz } from "./shared";

/** Sentences that make sense to read aloud (digits are read inconsistently by recognisers). */
function poolFor(difficulty: Difficulty): Item[] {
  return pack().items.filter((item) => difficultyFor(item) === difficulty && !/\d/.test(sentence(item, answerOf(item))));
}

function pickFrom(pool: Item[], avoid?: string): Item {
  const choices = pool.length > 1 ? pool.filter((item) => item.id !== avoid) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

type Phase = "idle" | "listening" | "thinking" | "done" | "error";

export function Speak() {
  const difficulty = usePlay((state) => state.difficulty);
  const speech = usePlay((state) => state.speech);
  const spoke = usePlay((state) => state.spoke);
  const pool = useMemo(() => poolFor(difficulty), [difficulty]);
  const [item, setItem] = useState(() => pickFrom(pool));
  const [phase, setPhase] = useState<Phase>("idle");
  const [partial, setPartial] = useState("");
  const [score, setScore] = useState<SpeechScore | null>(null);
  const [earned, setEarned] = useState(0);
  const [error, setError] = useState("");
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const session = useRef<Listening | null>(null);
  const voice = canSpeak();

  const answer = answerOf(item);
  const text = sentence(item, answer);
  const verbShown = atSentenceStart(item) ? capitalize(answer) : answer;

  useEffect(() => {
    void canListen().then(setMicOk);
  }, []);

  useEffect(() => {
    setItem(pickFrom(pool));
    reset();
  }, [pool]);

  useEffect(() => () => session.current?.stop(), []);

  function reset() {
    session.current?.stop();
    session.current = null;
    setPhase("idle");
    setPartial("");
    setScore(null);
    setEarned(0);
    setError("");
  }

  function nextSentence() {
    reset();
    setItem(pickFrom(pool, item.id));
  }

  async function record() {
    if (phase === "listening") {
      session.current?.stop();
      setPhase("thinking");
      return;
    }
    reset();
    setPhase("listening");
    buzz(10);
    const run = listen(setPartial);
    session.current = run;
    try {
      const alternatives = await run.result;
      if (session.current !== run) return;
      if (alternatives.length === 0) {
        setPhase("error");
        setError("I didn't catch anything. Tap the mic and read the sentence out loud.");
        return;
      }
      const result = scoreSpeech(text, alternatives);
      setScore(result);
      setEarned(spoke(result.ratio));
      setPhase("done");
      buzz(result.ratio >= 1 ? 12 : [30, 60, 30]);
    } catch (err) {
      if (session.current !== run) return;
      const code = err instanceof Error ? err.message : "";
      setPhase("error");
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? "Tilde needs microphone access. Allow it in your browser or phone settings, then try again."
          : code === "network"
            ? "Speech recognition needs an internet connection."
            : "Something went wrong with the microphone. Try again.",
      );
    } finally {
      if (session.current === run) session.current = null;
    }
  }

  const pct = score ? Math.round(score.ratio * 100) : 0;

  return (
    <div className="rise">
      <article className="card rounded-3xl border border-line p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="accent">{item.verb}</Chip>
          <Chip>{pack().tenseTitle(item.tense)}</Chip>
          <span className="ml-auto text-xs text-muted">Say it in {pack().name}</span>
        </div>

        <h1 className="mt-5 font-display text-[1.75rem] leading-[1.3] font-semibold sm:text-4xl" lang={pack().code}>
          {score ? (
            score.words.map((word, index) => (
              <span key={index} className={word.ok ? "text-good" : "text-bad underline decoration-2 underline-offset-4"}>
                {word.text}{" "}
              </span>
            ))
          ) : (
            <Highlighted item={item} verb={verbShown} />
          )}
        </h1>
        <p className="mt-4 border-t border-line pt-4 text-[15px] text-muted">{item.en}</p>

        {voice ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void speak(text)}
              className="tap flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold"
            >
              <Volume2 className="size-4 text-accent" aria-hidden="true" /> Listen
            </button>
            <button
              type="button"
              onClick={() => void speak(text, true)}
              className="tap flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold"
            >
              <Snail className="size-4 text-accent" aria-hidden="true" /> Slowly
            </button>
          </div>
        ) : null}
      </article>

      <div className="mt-6 flex flex-col items-center">
        {micOk === false ? (
          <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-center text-sm text-muted">
            This browser can't listen to speech. Use Chrome, Edge or Safari — or the Android app.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void record()}
              disabled={phase === "thinking" || micOk === null}
              aria-label={phase === "listening" ? "Stop recording" : "Start recording"}
              className={`tap relative grid size-24 place-items-center rounded-full text-ink shadow-[0_12px_40px_-10px] disabled:opacity-60 ${
                phase === "listening" ? "bg-bad shadow-bad/70" : "bg-accent shadow-accent/70"
              }`}
            >
              {phase === "listening" ? <span className="mic-ring" aria-hidden="true" /> : null}
              {phase === "listening" ? (
                <Square className="size-8 fill-current" aria-hidden="true" />
              ) : (
                <Mic className="size-10" aria-hidden="true" />
              )}
            </button>
            <p className="mt-3 min-h-5 text-center text-sm text-muted" aria-live="polite">
              {phase === "listening"
                ? partial || "Listening… read the sentence out loud"
                : phase === "thinking"
                  ? "Checking…"
                  : phase === "done"
                    ? null
                    : "Tap the mic and read the sentence"}
            </p>
          </>
        )}
      </div>

      {phase === "error" ? (
        <p className="rise mt-3 rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {phase === "done" && score ? (
        <div
          className={`rise mt-2 rounded-3xl border p-4 ${
            score.ratio >= 1 ? "border-good/30 bg-good/10" : score.ratio >= 0.8 ? "border-accent/30 bg-accent/10" : "border-bad/30 bg-bad/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <p className="font-display text-3xl font-bold tabular-nums">{pct}%</p>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold">
                {score.ratio >= 1 ? "¡Perfecto!" : score.ratio >= 0.8 ? "Very close." : "Keep practising."}
              </p>
              <p className="text-xs text-muted">
                {score.ratio >= 1
                  ? "Every word came through clearly."
                  : "Red words weren't heard clearly. Listen again and retry."}
              </p>
            </div>
            {earned > 0 ? (
              <span className="pop shrink-0 rounded-full bg-good px-2.5 py-1 text-sm font-bold text-ink">+{earned}</span>
            ) : null}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-sm text-muted">
            <Ear className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Heard: <span className="text-fg">“{score.heard}”</span>
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void record()}
          disabled={phase === "listening" || phase === "thinking" || micOk === false || phase === "idle"}
          className="tap flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface text-sm font-semibold disabled:opacity-40"
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Try again
        </button>
        <button
          type="button"
          onClick={nextSentence}
          className="tap min-h-12 rounded-2xl bg-accent text-sm font-semibold text-ink"
        >
          Next sentence
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted tabular-nums">
        {speech.perfect} perfect of {speech.tries} · speaking streak {speech.streak} · best {speech.best}
      </p>
    </div>
  );
}

function Highlighted({ item, verb }: { item: Item; verb: string }) {
  const { left, tail } = parts(item);
  return (
    <>
      {left}
      <span className="rounded-lg bg-accent/15 px-1 text-accent">{verb}</span>
      {tail}
    </>
  );
}
