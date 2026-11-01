import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BookOpen, Check, ChevronDown, Shuffle, Sparkles, Volume2, X } from "lucide-react";
import { gradeTyped } from "@/lib/tilde/engine";
import { EXAMPLES, GUIDES, regularForm, rowOf, splitForm, verbsFor, type Conjugation } from "@/lib/tilde/grammar";
import { canSpeak, speak } from "@/lib/tilde/speech";
import { PERSONS, TENSES, type Tense } from "@/lib/tilde/types";
import { AccentKeys, Chip, buzz } from "./shared";

export function Learn() {
  const [tense, setTense] = useState<Tense>("presente");
  const guide = GUIDES[tense];

  return (
    <div className="rise space-y-4">
      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <div className="flex w-max gap-1.5" role="tablist" aria-label="Tense">
          {TENSES.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tense}
              onClick={() => setTense(t)}
              className={`tap rounded-full border px-3.5 py-2 text-sm font-semibold capitalize ${
                t === tense ? "border-accent bg-accent text-ink" : "border-line bg-surface text-fg"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <article className="card rounded-3xl border border-line p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">{guide.title}</h1>
            <p className="text-sm text-accent">{guide.english}</p>
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-fg/90">{guide.use}</p>
        <p className="mt-3 rounded-2xl bg-line/50 px-4 py-3 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-fg">How to build it: </span>
          {guide.build}
        </p>
      </article>

      <EndingsTable tense={tense} />

      <article className="card rounded-3xl border border-line p-5">
        <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase">
          <AlertTriangle className="size-3.5 text-accent" aria-hidden="true" /> Watch out for
        </h2>
        <ul className="mt-3 space-y-3">
          {guide.watch.map((item) => (
            <li key={item.label}>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </article>

      <VerbExplorer key={`v-${tense}`} tense={tense} />
      <Drill key={`d-${tense}`} tense={tense} />
    </div>
  );
}

function EndingsTable({ tense }: { tense: Tense }) {
  const guide = GUIDES[tense];
  const kinds: Conjugation[] = ["ar", "er", "ir"];
  return (
    <article className="card overflow-hidden rounded-3xl border border-line">
      <h2 className="px-5 pt-5 text-xs font-semibold tracking-widest text-muted uppercase">Regular endings</h2>
      <div className="overflow-x-auto">
        <table className="mt-3 w-full min-w-[22rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-5 pb-2 font-medium" scope="col">
                <span className="sr-only">Person</span>
              </th>
              {kinds.map((kind) => (
                <th key={kind} className="pr-4 pb-2 font-medium" scope="col">
                  <span className="font-semibold text-fg">-{kind}</span> · {EXAMPLES[kind]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERSONS.map((person, index) => (
              <tr key={person} className="border-t border-line">
                <th scope="row" className="px-5 py-2.5 text-left text-xs font-medium text-muted">
                  {person}
                </th>
                {kinds.map((kind) => {
                  const verb = EXAMPLES[kind];
                  const form = rowOf(verb, tense)?.[index] ?? regularForm(verb, tense, index);
                  const [stem, ending] = splitForm(verb, tense, form);
                  return (
                    <td key={kind} className="py-2.5 pr-4 font-display text-[15px]">
                      <span className="text-fg/70">{stem}</span>
                      <span className="font-bold text-accent">{ending}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-5 pt-1 pb-4 text-xs text-muted">
        {guide.onInfinitive ? "Grey = the whole infinitive. " : "Grey = the stem. "}
        <span className="text-accent">Orange</span> = the ending you add.
      </p>
    </article>
  );
}

function VerbExplorer({ tense }: { tense: Tense }) {
  const verbs = useMemo(() => verbsFor(tense), [tense]);
  const [verb, setVerb] = useState(() => (verbs.includes("tener") ? "tener" : verbs[0]));
  const row = rowOf(verb, tense);
  const voice = canSpeak();

  return (
    <article className="card rounded-3xl border border-line p-5">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Look up a verb</h2>
        <span className="ml-auto text-xs text-muted">{verbs.length} verbs</span>
      </div>
      <label className="relative mt-3 block">
        <span className="sr-only">Verb</span>
        <select
          value={verb}
          onChange={(event) => setVerb(event.target.value)}
          className="tap w-full appearance-none rounded-2xl border border-line bg-surface py-3 pr-10 pl-4 font-display text-lg font-semibold text-fg focus:border-accent focus:outline-none"
        >
          {verbs.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </label>
      {row ? (
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {row.map((form, index) => {
            const irregular = form !== regularForm(verb, tense, index);
            return (
              <li key={PERSONS[index]}>
                <button
                  type="button"
                  disabled={!voice}
                  onClick={() => void speak(form)}
                  className={`tap flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-left ${
                    irregular ? "border-accent/50 bg-accent/10" : "border-line bg-surface/60"
                  }`}
                  aria-label={`${PERSONS[index]} ${form}${irregular ? ", irregular" : ""}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] text-muted">{PERSONS[index]}</span>
                    <span className="block font-display text-lg font-semibold">{form}</span>
                  </span>
                  {voice ? <Volume2 className="size-3.5 shrink-0 text-muted" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <span className="inline-block size-2.5 rounded-sm border border-accent/50 bg-accent/20" aria-hidden="true" />
        Highlighted = irregular (doesn't follow the regular pattern).
        {voice ? " Tap a form to hear it." : ""}
      </p>
    </article>
  );
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function Drill({ tense }: { tense: Tense }) {
  const verbs = useMemo(() => verbsFor(tense), [tense]);
  const next = () => ({ verb: pick(verbs), person: Math.floor(Math.random() * 6) });
  const [card, setCard] = useState(next);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; accent: boolean }>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const answer = rowOf(card.verb, tense)?.[card.person] ?? "";

  useEffect(() => {
    if (!result && window.matchMedia?.("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, [card, result]);

  function check() {
    if (!draft.trim() || result) return;
    const graded = gradeTyped(draft, answer);
    setResult(graded);
    setScore((s) => ({ right: s.right + (graded.ok ? 1 : 0), total: s.total + 1 }));
    buzz(graded.ok ? 12 : [30, 60, 30]);
  }

  function another() {
    setCard(next());
    setDraft("");
    setResult(null);
  }

  return (
    <article className="card rounded-3xl border border-line p-5">
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" /> Quiz me
        </h2>
        <span className="ml-auto text-xs text-muted tabular-nums">
          {score.right} / {score.total}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Chip tone="accent">{card.verb}</Chip>
        <Chip>{tense}</Chip>
        <Chip>{PERSONS[card.person]}</Chip>
      </div>
      <form
        className="mt-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (result) another();
          else check();
        }}
      >
        <label className="sr-only" htmlFor="drill">
          Conjugated form
        </label>
        <div
          className={`flex items-center gap-2 rounded-2xl border bg-surface px-4 ${
            result ? (result.ok ? "border-good/60" : "border-bad/60") : "border-line focus-within:border-accent"
          }`}
        >
          <input
            ref={inputRef}
            id="drill"
            value={draft}
            readOnly={result !== null}
            onChange={(event) => setDraft(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            lang="es"
            enterKeyHint="done"
            placeholder={`${PERSONS[card.person]} …`}
            className="min-w-0 flex-1 bg-transparent py-3 font-display text-xl font-semibold text-fg placeholder:text-muted/50 focus:outline-none"
          />
          {result ? (
            result.ok ? (
              <Check className="size-5 text-good" aria-hidden="true" />
            ) : (
              <X className="size-5 text-bad" aria-hidden="true" />
            )
          ) : null}
        </div>
        {result ? (
          <p className="rise mt-2 text-sm" aria-live="polite">
            {result.ok ? (
              <span className="text-good">{result.accent ? "Perfect." : `Right — with the accent it's ${answer}.`}</span>
            ) : (
              <span className="text-muted">
                It's <span className="font-semibold text-fg">{answer}</span>.
              </span>
            )}
          </p>
        ) : (
          <AccentKeys inputRef={inputRef} value={draft} onChange={setDraft} />
        )}
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="submit"
            disabled={!result && !draft.trim()}
            className="tap min-h-12 rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
          >
            {result ? "Next verb" : "Check"}
          </button>
          <button
            type="button"
            onClick={another}
            className="tap grid min-h-12 place-items-center rounded-2xl border border-line bg-surface px-4 text-muted"
            aria-label="Skip to another verb"
          >
            <Shuffle className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </article>
  );
}
