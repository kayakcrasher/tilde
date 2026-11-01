import { useMemo, useRef, useState } from "react";
import { Brain, Check, Search, Sparkles, Volume2, X } from "lucide-react";
import { answerOf, gradeTyped, sentence } from "@/lib/tilde/engine";
import { pack } from "@/lib/tilde/lang";
import { hasVoice, speak } from "@/lib/tilde/speech";
import { usePlay } from "@/lib/tilde/store";
import type { VocabEntry } from "@/lib/tilde/types";
import { INTERVAL_DAYS, KNOWN_BOX, exampleFor, isDue, statusOf, type Card, type WordStatus } from "@/lib/tilde/vocab";
import { AccentKeys, Chip, buzz } from "./shared";
import { PronLine } from "./pronline";

const SESSION = 10;

type Mode = "to-en" | "from-en" | "type";
type Question = { entry: VocabEntry; mode: Mode; options: string[] };

const STATUS_LABEL: Record<WordStatus, string> = { new: "New", learning: "Learning", known: "Known" };
const STATUS_TONE: Record<WordStatus, string> = {
  new: "bg-line/70 text-muted",
  learning: "bg-accent/15 text-accent",
  known: "bg-good/15 text-good",
};

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Due reviews first, then new words (ones you've already met in sentences first). */
function pickSession(vocab: Record<string, Card>): VocabEntry[] {
  const entries = pack().vocab;
  const now = Date.now();
  const due = entries.filter((e) => isDue(vocab[e.id], now)).sort((a, b) => vocab[a.id].due - vocab[b.id].due);
  const fresh = entries
    .filter((e) => statusOf(vocab[e.id]) === "new")
    .sort((a, b) => (vocab[b.id]?.seen ?? 0) - (vocab[a.id]?.seen ?? 0));
  return [...due, ...fresh].slice(0, SESSION);
}

function makeQuestion(entry: VocabEntry, card: Card | undefined): Question {
  const box = card?.box ?? 0;
  // New words: recognise the meaning. Then recall the word. Later: type it.
  const mode: Mode = box >= 2 ? (Math.random() < 0.5 ? "type" : "from-en") : box === 1 ? "from-en" : "to-en";
  // Wrong options must differ from the answer in both languages, and from each other.
  const same = shuffle(pack().vocab.filter((e) => e.kind === entry.kind && e.en !== entry.en && e.word !== entry.word));
  const wrong: VocabEntry[] = [];
  for (const e of same) {
    if (wrong.length >= 3) break;
    if (!wrong.some((w) => w.en === e.en || w.word === e.word)) wrong.push(e);
  }
  const options = shuffle([entry, ...wrong]).map((e) => (mode === "to-en" ? e.en : e.word));
  return { entry, mode, options };
}

export function Words() {
  const vocab = usePlay((state) => state.vocab);
  const [session, setSession] = useState<VocabEntry[] | null>(null);
  const counts = useMemo(() => {
    const c = { known: 0, learning: 0, seen: 0, due: 0 };
    const now = Date.now();
    for (const e of pack().vocab) {
      const card = vocab[e.id];
      const s = statusOf(card);
      if (s === "known") c.known += 1;
      else if (s === "learning") c.learning += 1;
      else if ((card?.seen ?? 0) > 0) c.seen += 1;
      if (isDue(card, now)) c.due += 1;
    }
    return c;
  }, [vocab]);

  if (session) return <Session key={session.map((e) => e.id).join()} entries={session} onDone={() => setSession(null)} />;

  const total = pack().vocab.length;
  return (
    <div className="rise">
      <dl className="grid grid-cols-3 gap-2">
        <Stat label="Known" value={counts.known} tone="text-good" />
        <Stat label="Learning" value={counts.learning} tone="text-accent" />
        <Stat label="Seen" value={counts.seen} tone="text-fg" />
      </dl>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="flex h-full">
          <div className="bg-good transition-[width] duration-500" style={{ width: `${(counts.known / total) * 100}%` }} />
          <div className="bg-accent transition-[width] duration-500" style={{ width: `${(counts.learning / total) * 100}%` }} />
        </div>
      </div>
      <p className="mt-2 px-1 text-xs text-muted">
        {counts.known} of {total} words known. A word counts as known after you recall it on {KNOWN_BOX} spaced reviews in a row
        ({INTERVAL_DAYS.slice(1, KNOWN_BOX + 1).join(", ")} days apart). Get one wrong and it starts again.
      </p>

      <button
        type="button"
        onClick={() => setSession(pickSession(vocab))}
        className="tap mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-ink shadow-[0_8px_24px_-8px] shadow-accent/60"
      >
        {counts.due > 0 ? (
          <>
            <Brain className="size-5" aria-hidden="true" /> Review {Math.min(counts.due, SESSION)} due word{counts.due === 1 ? "" : "s"}
          </>
        ) : (
          <>
            <Sparkles className="size-5" aria-hidden="true" /> Learn new words
          </>
        )}
      </button>

      <WordList vocab={vocab} />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card rounded-2xl border border-line px-3 py-3">
      <dt className="text-[11px] font-semibold tracking-widest text-muted uppercase">{label}</dt>
      <dd className={`mt-1 font-display text-2xl font-bold tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}

function WordList({ vocab }: { vocab: Record<string, Card> }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | WordStatus>("all");
  const [limit, setLimit] = useState(30);
  const q = query.trim().toLowerCase();
  const list = pack().vocab.filter((e) => {
    if (filter !== "all" && statusOf(vocab[e.id]) !== filter) return false;
    return !q || e.word.toLowerCase().includes(q) || e.en.toLowerCase().includes(q);
  });
  return (
    <section className="mt-7">
      <h2 className="px-1 text-xs font-semibold tracking-widest text-muted uppercase">Your words</h2>
      <label className="relative mt-2 block">
        <span className="sr-only">Search words</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(30);
          }}
          placeholder="Search in either language…"
          className="w-full rounded-2xl border border-line bg-surface py-3 pr-4 pl-10 text-sm focus:border-accent focus:outline-none"
        />
      </label>
      <div className="mt-2 flex gap-1.5" role="group" aria-label="Filter">
        {(["all", "known", "learning", "new"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setLimit(30);
            }}
            className={`tap rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === f ? "border-accent bg-accent text-ink" : "border-line bg-surface text-fg"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>
      <ul className="card mt-3 divide-y divide-line rounded-3xl border border-line">
        {list.slice(0, limit).map((e) => {
          const card = vocab[e.id];
          const status = statusOf(card);
          return (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold" lang={pack().code}>
                  {e.word}
                </p>
                <p className="truncate text-xs text-muted">{e.en}</p>
              </div>
              <span className="flex gap-0.5" aria-label={`Box ${card?.box ?? 0} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`size-1.5 rounded-full ${n <= (card?.box ?? 0) ? (n >= KNOWN_BOX ? "bg-good" : "bg-accent") : "bg-line"}`}
                  />
                ))}
              </span>
              <span className={`w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${STATUS_TONE[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            </li>
          );
        })}
        {list.length === 0 ? <li className="px-4 py-6 text-center text-sm text-muted">No words match.</li> : null}
      </ul>
      {list.length > limit ? (
        <button
          type="button"
          onClick={() => setLimit((n) => n + 30)}
          className="tap mt-3 min-h-11 w-full rounded-2xl border border-line bg-surface text-sm font-semibold"
        >
          Show more ({list.length - limit} left)
        </button>
      ) : null}
    </section>
  );
}

function Session({ entries, onDone }: { entries: VocabEntry[]; onDone: () => void }) {
  const vocab = usePlay((state) => state.vocab);
  const reviewWord = usePlay((state) => state.reviewWord);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(() => makeQuestion(entries[0], vocab[entries[0].id]));
  const [answer, setAnswer] = useState<null | { ok: boolean; given: string; xp: number }>(null);
  const [score, setScore] = useState({ right: 0, xp: 0, promoted: 0 });
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const examples = useMemo(
    () => pack().items.map((item) => ({ text: sentence(item, answerOf(item)), en: item.en })),
    [],
  );

  if (entries.length === 0) {
    return (
      <div className="rise card rounded-3xl border border-line p-6 text-center">
        <p className="font-display text-2xl font-bold">All caught up!</p>
        <p className="mt-2 text-sm text-muted">No words are due and you've started every word. Come back tomorrow.</p>
        <button type="button" onClick={onDone} className="tap mt-5 min-h-12 w-full rounded-2xl bg-accent font-semibold text-ink">
          Back to words
        </button>
      </div>
    );
  }

  if (index >= entries.length) {
    return (
      <div className="rise card rounded-3xl border border-line p-6 text-center">
        <Brain className="mx-auto size-10 text-accent" aria-hidden="true" />
        <p className="mt-3 font-display text-3xl font-bold tabular-nums">
          {score.right}/{entries.length}
        </p>
        <p className="mt-1 text-sm text-muted">
          {score.promoted > 0 ? `${score.promoted} word${score.promoted === 1 ? "" : "s"} now known · ` : ""}+{score.xp} XP
        </p>
        <button type="button" onClick={onDone} className="tap mt-5 min-h-12 w-full rounded-2xl bg-accent font-semibold text-ink">
          Done
        </button>
      </div>
    );
  }

  const { entry, mode, options } = question;
  const card = vocab[entry.id];
  const example = answer ? exampleFor(entry, examples) : undefined;
  const voice = hasVoice();

  function respond(given: string) {
    if (answer) return;
    const ok =
      mode === "to-en" ? given === entry.en : mode === "from-en" ? given === entry.word : gradeTyped(given, entry.word).ok;
    const before = statusOf(card);
    const xp = reviewWord(entry.id, ok);
    const after = statusOf(usePlay.getState().vocab[entry.id]);
    setScore((s) => ({
      right: s.right + (ok ? 1 : 0),
      xp: s.xp + xp,
      promoted: s.promoted + (before !== "known" && after === "known" ? 1 : 0),
    }));
    setAnswer({ ok, given, xp });
    buzz(ok ? 12 : [30, 60, 30]);
  }

  function next() {
    const n = index + 1;
    setIndex(n);
    setAnswer(null);
    setDraft("");
    if (n < entries.length) setQuestion(makeQuestion(entries[n], usePlay.getState().vocab[entries[n].id]));
  }

  return (
    <div className="rise">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onDone} className="tap text-sm font-semibold text-muted hover:text-fg">
          End session
        </button>
        <span className="ml-auto text-sm text-muted tabular-nums">
          {index + 1} / {entries.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="xp-fill h-full rounded-full" style={{ width: `${(index / entries.length) * 100}%` }} />
      </div>

      <article key={entry.id + mode} className="rise card mt-4 rounded-3xl border border-line p-6 text-center">
        <div className="flex justify-center gap-1.5">
          <Chip tone="accent">{entry.kind === "verb" ? "verb" : "word"}</Chip>
          <Chip>{statusOf(card) === "new" ? "new word" : `box ${card?.box ?? 0}`}</Chip>
        </div>
        <p className="mt-3 text-xs text-muted">
          {mode === "to-en" ? "What does this mean?" : mode === "from-en" ? `Which ${pack().name} word means…` : `Type the ${pack().name} for…`}
        </p>
        <p className="mt-2 font-display text-3xl font-bold" lang={mode === "to-en" ? pack().code : "en"}>
          {mode === "to-en" ? entry.word : entry.en}
        </p>
        {mode === "to-en" && voice ? (
          <button
            type="button"
            onClick={() => void speak(entry.word)}
            className="tap mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold"
          >
            <Volume2 className="size-3.5 text-accent" aria-hidden="true" /> Listen
          </button>
        ) : null}
      </article>

      {mode === "type" && !answer ? (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim()) respond(draft.trim());
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            lang={pack().code}
            enterKeyHint="done"
            aria-label="Your answer"
            placeholder="Type the word…"
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-center font-display text-2xl font-semibold focus:border-accent focus:outline-none"
          />
          <AccentKeys inputRef={inputRef} value={draft} onChange={setDraft} />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="tap mt-4 min-h-13 w-full rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
          >
            Check
          </button>
        </form>
      ) : mode !== "type" ? (
        <ul className="mt-4 grid gap-2">
          {options.map((option) => {
            const correct = mode === "to-en" ? option === entry.en : option === entry.word;
            const chosen = answer?.given === option;
            const tone = answer
              ? correct
                ? "border-good/60 bg-good/10"
                : chosen
                  ? "border-bad/60 bg-bad/10"
                  : "border-line opacity-50"
              : "border-line bg-surface hover:border-accent";
            return (
              <li key={option}>
                <button
                  type="button"
                  disabled={answer !== null}
                  onClick={() => respond(option)}
                  className={`tap flex min-h-13 w-full items-center gap-2 rounded-2xl border px-4 text-left ${tone} ${
                    mode === "from-en" ? "font-display text-lg font-semibold" : "text-[15px]"
                  }`}
                  lang={mode === "from-en" ? pack().code : "en"}
                >
                  <span className="min-w-0 flex-1">{option}</span>
                  {answer && correct ? <Check className="size-4 text-good" aria-hidden="true" /> : null}
                  {answer && chosen && !correct ? <X className="size-4 text-bad" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {answer ? (
        <div className="rise mt-4">
          <div className={`rounded-3xl border p-4 ${answer.ok ? "border-good/30 bg-good/10" : "border-bad/30 bg-bad/10"}`} aria-live="polite">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              {answer.ok ? "Got it!" : "Not quite."}
              <span className="font-sans text-sm font-normal text-muted">
                <span className="font-semibold text-fg" lang={pack().code}>
                  {entry.word}
                </span>{" "}
                = {entry.en}
              </span>
              {answer.xp > 0 ? (
                <span className="ml-auto rounded-full bg-good px-2 py-0.5 text-xs font-bold text-ink">+{answer.xp}</span>
              ) : null}
            </p>
            <PronLine text={entry.word} className="mt-2" />
            {example ? (
              <p className="mt-2 text-sm">
                <span lang={pack().code}>{example.text}</span>
                <span className="block text-xs text-muted">{example.en}</span>
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted">
              {answer.ok
                ? `Next review in ${INTERVAL_DAYS[usePlay.getState().vocab[entry.id]?.box ?? 1]} day(s).`
                : "Back to box 1 — you'll see it again soon."}
            </p>
          </div>
          <button type="button" autoFocus onClick={next} className="tap mt-4 min-h-13 w-full rounded-2xl bg-accent font-semibold text-ink">
            {index + 1 >= entries.length ? "Finish" : "Next word"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
