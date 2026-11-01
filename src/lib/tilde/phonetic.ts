// Turn ABAIR phoneme strings (e.g. "1 p aa sj . 0 tj @") into IPA and an
// easy English-style respelling. ABAIR marks stress per syllable (1 primary,
// 2 secondary, 0 none), separates syllables with "." and marks slender
// (palatalised) consonants with a trailing "j".

type Sound = { ipa: string; say: string };

const SOUNDS: Record<string, Sound> = {
  // broad consonants (velarised)
  b: { ipa: "bˠ", say: "b" },
  p: { ipa: "pˠ", say: "p" },
  m: { ipa: "mˠ", say: "m" },
  f: { ipa: "fˠ", say: "f" },
  v: { ipa: "w", say: "w" },
  t: { ipa: "t̪ˠ", say: "t" },
  d: { ipa: "d̪ˠ", say: "d" },
  k: { ipa: "k", say: "k" },
  g: { ipa: "ɡ", say: "g" },
  x: { ipa: "x", say: "kh" },
  gf: { ipa: "ɣ", say: "gh" },
  h: { ipa: "h", say: "h" },
  s: { ipa: "sˠ", say: "s" },
  l: { ipa: "l", say: "l" },
  ll: { ipa: "l̪ˠ", say: "l" },
  n: { ipa: "n", say: "n" },
  nn: { ipa: "n̪ˠ", say: "n" },
  r: { ipa: "ɾˠ", say: "r" },
  rr: { ipa: "rˠ", say: "rr" },
  ng: { ipa: "ŋ", say: "ng" },
  // slender consonants (palatalised)
  bj: { ipa: "bʲ", say: "b" },
  pj: { ipa: "pʲ", say: "p" },
  mj: { ipa: "mʲ", say: "m" },
  fj: { ipa: "fʲ", say: "f" },
  vj: { ipa: "vʲ", say: "v" },
  tj: { ipa: "tʲ", say: "ch" },
  dj: { ipa: "dʲ", say: "j" },
  kj: { ipa: "c", say: "ky" },
  gj: { ipa: "ɟ", say: "gy" },
  xj: { ipa: "ç", say: "hy" },
  gfj: { ipa: "j", say: "y" },
  hj: { ipa: "ç", say: "hy" },
  sj: { ipa: "ʃ", say: "sh" },
  lj: { ipa: "lʲ", say: "l" },
  llj: { ipa: "l̪ʲ", say: "l" },
  nj: { ipa: "nʲ", say: "n" },
  nnj: { ipa: "n̪ʲ", say: "n" },
  rj: { ipa: "ɾʲ", say: "r" },
  ngj: { ipa: "ɲ", say: "ng" },
  j: { ipa: "j", say: "y" },
  w: { ipa: "w", say: "w" },
  // vowels
  a: { ipa: "a", say: "a" },
  aa: { ipa: "ɑː", say: "aw" },
  o: { ipa: "ɔ", say: "o" },
  oo: { ipa: "oː", say: "oh" },
  u: { ipa: "ʊ", say: "u" },
  uu: { ipa: "uː", say: "oo" },
  e: { ipa: "ɛ", say: "e" },
  ee: { ipa: "eː", say: "ay" },
  i: { ipa: "ɪ", say: "i" },
  ii: { ipa: "iː", say: "ee" },
  "@": { ipa: "ə", say: "uh" },
  "i@": { ipa: "iə", say: "ee-uh" },
  "u@": { ipa: "uə", say: "oo-uh" },
  ai: { ipa: "aɪ", say: "eye" },
  au: { ipa: "əu", say: "ow" },
  ei: { ipa: "ei", say: "ay" },
  // voiceless (whispered) variants, e.g. the r in torthaí
  r_d: { ipa: "ɾ̥ˠ", say: "r" },
  rj_d: { ipa: "ɾ̥ʲ", say: "r" },
  nj_d: { ipa: "n̥ʲ", say: "n" },
  nn_d: { ipa: "n̪̊ˠ", say: "n" },
  ll_d: { ipa: "l̪̊ˠ", say: "l" },
  llj_d: { ipa: "l̪̊ʲ", say: "l" },
};

export type Phonetic = { ipa: string; say: string };

/** Convert one word's ABAIR phonemes to IPA and respelling. */
export function fromAbair(phones: string): Phonetic {
  const ipa: string[] = [];
  const say: string[] = [];
  // Split into syllables; each begins with its stress digit.
  const syllables = phones.trim().split(/\s+\.\s+/);
  for (const syl of syllables) {
    const parts = syl.trim().split(/\s+/);
    let stress = "0";
    if (/^[0-2]$/.test(parts[0])) stress = parts.shift() as string;
    const i = parts.map((p) => SOUNDS[p]?.ipa ?? p).join("");
    const s = parts.map((p) => SOUNDS[p]?.say ?? p).join("");
    ipa.push((stress === "1" ? "ˈ" : stress === "2" ? "ˌ" : "") + i);
    say.push(stress === "1" && syllables.length > 1 ? s.toUpperCase() : s);
  }
  return { ipa: ipa.join(""), say: say.join("-") };
}

/** Every ABAIR symbol the converter knows (used to flag unknown ones). */
export const KNOWN_SYMBOLS = new Set(Object.keys(SOUNDS));
