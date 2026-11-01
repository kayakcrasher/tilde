// Pronunciation lookup for Irish words, from ABAIR's Connemara lexicon
// (fetched once and stored in packs/ga/pron.ts).
import { PRON } from "./packs/ga/pron";
import { fromAbair, type Phonetic } from "./phonetic";

function key(word: string): string {
  return word.toLowerCase().replace(/’/g, "'").replace(/^[^\p{L}']+|[^\p{L}']+$/gu, "");
}

export function pronounce(word: string): Phonetic | undefined {
  const phones = PRON[key(word)];
  return phones ? fromAbair(phones) : undefined;
}

/** Word-by-word pronunciation for a sentence; unknown words come back as null. */
export function pronounceText(text: string): { word: string; p: Phonetic | null }[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, p: pronounce(word) ?? null }));
}
