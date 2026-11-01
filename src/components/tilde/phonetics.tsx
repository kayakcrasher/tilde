import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Lightbulb, Volume2, X } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DIALECTS, getDialect, setDialect, type Dialect } from "@/lib/tilde/abair";
import { CHAPTERS, VOWELS, type Block, type Chapter, type Example, type QuizQ } from "@/lib/tilde/phonetics-course";
import { pronounce } from "@/lib/tilde/pron";
import { hasVoice, speakIn } from "@/lib/tilde/speech";
import { buzz } from "./shared";

/** Phonetics progress is shared across languages. */
export const usePhonetics = create<{ best: Record<string, number>; setBest: (id: string, score: number) => void }>()(
  persist(
    (set, get) => ({
      best: {},
      setBest: (id, score) => set({ best: { ...get().best, [id]: Math.max(get().best[id] ?? 0, score) } }),
    }),
    { name: "tilde-phonetics" },
  ),
);

const LANG_NAME = { en: "English", es: "Spanish", de: "German", ga: "Irish" } as const;

/** Deterministic shuffle so options don't move between renders. */
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

export function Phonetics() {
  const [openId, setOpenId] = useState<string | null>(null);
  const best = usePhonetics((s) => s.best);
  const chapter = CHAPTERS.find((c) => c.id === openId);
  if (chapter) return <ChapterView key={chapter.id} chapter={chapter} onBack={() => setOpenId(null)} />;
  const done = CHAPTERS.filter((c) => (best[c.id] ?? 0) >= Math.ceil(c.quiz.length * 0.66)).length;
  return (
    <div className="rise">
      <div className="card rounded-3xl border border-line p-5">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">Phonetics</p>
        <h1 className="mt-1 font-display text-2xl font-bold">The sounds of speech</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A crash course in the International Phonetic Alphabet — the one system that writes every sound in every language. Learn it
          once and every dictionary, and every pronunciation line in Tilde, will make sense.
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="xp-fill h-full rounded-full" style={{ width: `${(done / CHAPTERS.length) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted tabular-nums">
          {done} of {CHAPTERS.length} chapters passed
        </p>
      </div>
      <ol className="mt-4 space-y-2">
        {CHAPTERS.map((c, i) => {
          const score = best[c.id];
          const passed = (score ?? 0) >= Math.ceil(c.quiz.length * 0.66);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpenId(c.id)}
                className="tap card flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line px-4 py-3 text-left hover:border-accent"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl font-display text-lg font-bold ${
                    passed ? "bg-good/15 text-good" : "bg-line/60 text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {passed ? <Check className="size-5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{c.title}</span>
                  <span className="block text-xs text-muted">{c.blurb}</span>
                </span>
                {score !== undefined ? (
                  <span className="text-xs text-muted tabular-nums">
                    {score}/{c.quiz.length}
                  </span>
                ) : null}
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ChapterView({ chapter, onBack }: { chapter: Chapter; onBack: () => void }) {
  return (
    <div className="rise space-y-4">
      <button type="button" onClick={onBack} className="tap flex items-center gap-1.5 px-1 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" /> All chapters
      </button>
      <h1 className="px-1 font-display text-3xl font-bold">{chapter.title}</h1>
      {chapter.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
      <Quiz chapter={chapter} />
    </div>
  );
}

function Say({ ex }: { ex: Example }) {
  const voice = hasVoice(ex.lang);
  const pron = ex.ipa ? undefined : ex.lang === "ga" ? pronounce(ex.word) : undefined;
  const ipa = ex.ipa ?? pron?.ipa;
  return (
    <button
      type="button"
      disabled={!voice}
      onClick={() => void speakIn(ex.lang, ex.word)}
      className="tap flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/60 px-3 py-2.5 text-left hover:border-accent disabled:cursor-default"
    >
      <span className="w-14 shrink-0 text-[10px] font-semibold tracking-wider text-muted uppercase">{LANG_NAME[ex.lang]}</span>
      <span className="min-w-0 flex-1">
        <span className="font-display text-lg font-semibold" lang={ex.lang}>
          {ex.word}
        </span>
        {ipa ? <span className="ml-2 font-sans text-sm text-accent">/{ipa}/</span> : null}
        {pron ? <span className="ml-2 text-xs text-muted">“{pron.say}”</span> : null}
        {ex.en || ex.note ? (
          <span className="block text-xs text-muted">
            {ex.en}
            {ex.note ? ` (${ex.note})` : ""}
          </span>
        ) : null}
      </span>
      {voice ? <Volume2 className="size-4 shrink-0 text-muted" aria-hidden="true" /> : null}
    </button>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return <p className="px-1 text-[15px] leading-relaxed text-fg/90">{block.body}</p>;
    case "tip":
      return (
        <p className="flex gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-relaxed">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          {block.body}
        </p>
      );
    case "examples":
      return (
        <section className="card rounded-3xl border border-line p-4">
          {block.title ? <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">{block.title}</h2> : null}
          <div className="space-y-2">
            {block.rows.map((ex) => (
              <Say key={ex.lang + ex.word} ex={ex} />
            ))}
          </div>
        </section>
      );
    case "symbols":
      return (
        <section className="card rounded-3xl border border-line p-4">
          {block.title ? <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">{block.title}</h2> : null}
          <div className="space-y-3">
            {block.rows.map((row) => (
              <div key={row.sym} className="flex gap-3">
                <span className="grid h-12 min-w-12 shrink-0 place-items-center rounded-xl bg-accent/12 px-2 font-sans text-2xl font-semibold text-accent">
                  {row.sym}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{row.name}</p>
                  <div className="mt-1.5 space-y-1.5">
                    {row.examples.map((ex) => (
                      <Say key={ex.lang + ex.word} ex={ex} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    case "mouth":
      return <MouthMap />;
    case "vowels":
      return <VowelChart />;
    case "respell":
      return <RespellKey />;
    case "dialect":
      return <DialectPicker />;
  }
}

function MouthMap() {
  const points = [
    { x: 40, y: 118, label: "Lips", sym: "p b m f v w" },
    { x: 66, y: 104, label: "Teeth", sym: "θ ð t̪" },
    { x: 92, y: 86, label: "Ridge", sym: "t d s n l ɾ" },
    { x: 140, y: 70, label: "Palate", sym: "ʃ ç j ɲ" },
    { x: 196, y: 82, label: "Velum", sym: "k g x ɣ ŋ" },
    { x: 222, y: 120, label: "Uvula", sym: "ʁ" },
    { x: 238, y: 188, label: "Glottis", sym: "h ʔ" },
  ];
  return (
    <figure className="card rounded-3xl border border-line p-4">
      <svg viewBox="0 0 300 230" className="w-full" role="img" aria-label="Side view of the mouth showing where sounds are made">
        <path
          d="M30 120 C 30 60, 90 40, 150 50 C 210 58, 240 80, 250 120 L 250 210"
          fill="none"
          className="stroke-line"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M34 128 C 60 150, 120 140, 170 118 C 200 106, 225 120, 236 150 L 236 210" fill="none" className="stroke-accent/60" strokeWidth="10" strokeLinecap="round" />
        <text x="150" y="150" textAnchor="middle" className="fill-muted text-[9px]">
          tongue
        </text>
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="5" className="fill-accent" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-fg text-[10px] font-semibold">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3">
        {points.map((p) => (
          <span key={p.label} className="rounded-lg bg-line/50 px-2 py-1">
            <span className="font-semibold">{p.label}:</span> <span className="text-accent">{p.sym}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function VowelChart() {
  const [picked, setPicked] = useState(VOWELS[0]);
  const W = 300;
  const H = 210;
  // Trapezoid: front edge slants, back edge vertical.
  const pos = (x: number, y: number) => {
    const left = 20 + y * 70;
    return { cx: left + x * (W - 30 - left), cy: 15 + y * (H - 30) };
  };
  return (
    <figure className="card rounded-3xl border border-line p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="group" aria-label="Vowel chart">
        <polygon points={`20,15 ${W - 10},15 ${W - 10},${H - 15} 90,${H - 15}`} fill="none" className="stroke-line" strokeWidth="2" />
        <text x="20" y="10" className="fill-muted text-[9px]">
          front · close
        </text>
        <text x={W - 10} y="10" textAnchor="end" className="fill-muted text-[9px]">
          back
        </text>
        <text x="90" y={H - 2} className="fill-muted text-[9px]">
          open
        </text>
        {VOWELS.map((v) => {
          const { cx, cy } = pos(v.x, v.y);
          const on = picked.sym === v.sym;
          return (
            <g
              key={v.sym}
              role="button"
              tabIndex={0}
              aria-label={`${v.sym} as in ${v.word}`}
              onClick={() => {
                setPicked(v);
                if (hasVoice(v.lang)) void speakIn(v.lang, v.word);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setPicked(v);
                  if (hasVoice(v.lang)) void speakIn(v.lang, v.word);
                }
              }}
              className="cursor-pointer"
            >
              <circle cx={cx} cy={cy} r="14" className={on ? "fill-accent" : v.rounded ? "fill-surface stroke-accent" : "fill-surface stroke-line"} strokeWidth="1.5" />
              <text x={cx} y={cy + 5} textAnchor="middle" className={`text-[15px] font-semibold ${on ? "fill-ink" : "fill-fg"}`}>
                {v.sym}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 rounded-2xl bg-line/50 px-3 py-2 text-sm">
        <span className="font-sans text-xl font-semibold text-accent">{picked.sym}</span> as in{" "}
        <span className="font-semibold" lang={picked.lang}>
          {picked.word}
        </span>{" "}
        <span className="text-muted">
          /{picked.ipa}/ · {LANG_NAME[picked.lang]} · {picked.rounded ? "rounded lips" : "spread lips"}
        </span>
      </figcaption>
    </figure>
  );
}

function RespellKey() {
  const rows = [
    ["aw", "ɑː", "long á — “awe”"],
    ["ay", "eː", "long é — “say”"],
    ["ee", "iː", "long í — “see”"],
    ["oh", "oː", "long ó — “go”"],
    ["oo", "uː", "long ú — “too”"],
    ["uh", "ə", "the schwa — “about”"],
    ["kh", "x", "Scottish “loch”"],
    ["gh", "ɣ", "a gargled g, no closure"],
    ["ch", "tʲ", "slender t (Connacht) — near “church”"],
    ["j", "dʲ", "slender d (Connacht) — near “jeep”"],
    ["sh", "ʃ", "slender s"],
    ["hy", "ç", "slender ch — “huge”"],
    ["w", "w", "broad bh/mh"],
  ];
  return (
    <section className="card rounded-3xl border border-line p-4">
      <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">How to read Tilde's pronunciation lines</h2>
      <p className="mt-2 text-sm text-muted">
        Under Irish words you'll see an easy respelling like <span className="font-semibold text-fg">PAWSH-chuh</span> (stressed
        syllable in capitals) and, if you like, the IPA. They come from ABAIR's Connemara pronunciation dictionary.
      </p>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {rows.map(([say, ipa, hint]) => (
            <tr key={say} className="border-t border-line">
              <td className="py-1.5 pr-3 font-semibold">{say}</td>
              <td className="py-1.5 pr-3 font-sans text-accent">/{ipa}/</td>
              <td className="py-1.5 text-muted">{hint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DialectPicker() {
  const [dialect, set] = useState<Dialect>(getDialect);
  return (
    <section className="card rounded-3xl border border-line p-4">
      <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Choose your Irish voice</h2>
      <p className="mt-2 text-sm text-muted">Irish has three main dialects. All are correct — pick one and stick with it.</p>
      <div className="mt-3 grid gap-2">
        {DIALECTS.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={dialect === d.id}
            onClick={() => {
              setDialect(d.id);
              set(d.id);
              void speakIn("ga", "Dia duit, conas atá tú?");
            }}
            className={`tap flex items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
              dialect === d.id ? "border-accent bg-accent/10" : "border-line bg-surface/60"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{d.name}</span>
              <span className="block text-xs text-muted">{d.place}</span>
            </span>
            <Volume2 className="size-4 text-muted" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Irish speech by ABAIR, Phonetics and Speech Laboratory, Trinity College Dublin. Pronunciation lines follow the Connacht
        voice.
      </p>
    </section>
  );
}

function Quiz({ chapter }: { chapter: Chapter }) {
  const setBest = usePhonetics((s) => s.setBest);
  const questions = useMemo(
    () => chapter.quiz.map((q: QuizQ) => ({ q: q.q, correct: q.options[q.answer], options: shuffled(q.options, q.q) })),
    [chapter],
  );
  const [picks, setPicks] = useState<(string | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState<number | null>(null);
  const all = picks.every((p) => p !== null);
  return (
    <section className="pt-2">
      <h2 className="px-1 text-xs font-semibold tracking-widest text-muted uppercase">Check yourself</h2>
      <ol className="mt-2 space-y-3">
        {questions.map((q, qi) => (
          <li key={q.q} className="card rounded-3xl border border-line p-4">
            <p className="font-semibold">
              <span className="text-muted">{qi + 1}. </span>
              {q.q}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((o) => {
                const picked = picks[qi] === o;
                const right = o === q.correct;
                const tone =
                  checked !== null
                    ? right
                      ? "border-good/60 bg-good/10"
                      : picked
                        ? "border-bad/60 bg-bad/10"
                        : "border-line opacity-60"
                    : picked
                      ? "border-accent bg-accent/12"
                      : "border-line bg-surface/60";
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={checked !== null}
                    onClick={() => setPicks((p) => p.map((x, i) => (i === qi ? o : x)))}
                    className={`tap flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[15px] ${tone}`}
                  >
                    <span className="min-w-0 flex-1">{o}</span>
                    {checked !== null && right ? <Check className="size-4 text-good" aria-hidden="true" /> : null}
                    {checked !== null && picked && !right ? <X className="size-4 text-bad" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {checked !== null ? (
        <div className="rise mt-4 rounded-3xl border border-line bg-surface p-4 text-center" aria-live="polite">
          <p className="font-display text-3xl font-bold tabular-nums">
            {checked}/{questions.length}
          </p>
          <p className="text-sm text-muted">
            {checked >= Math.ceil(questions.length * 0.66) ? "Passed — on to the next chapter." : "Have another look and try again."}
          </p>
          <button
            type="button"
            onClick={() => {
              setPicks(questions.map(() => null));
              setChecked(null);
            }}
            className="tap mt-3 min-h-11 w-full rounded-2xl border border-line text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!all}
          onClick={() => {
            const score = questions.filter((q, i) => picks[i] === q.correct).length;
            setChecked(score);
            setBest(chapter.id, score);
            buzz(score === questions.length ? 12 : [20, 40, 20]);
          }}
          className="tap mt-4 min-h-13 w-full rounded-2xl bg-accent font-semibold text-ink disabled:opacity-40"
        >
          {all ? "Check answers" : "Answer every question"}
        </button>
      )}
    </section>
  );
}
