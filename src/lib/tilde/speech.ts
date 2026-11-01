// Text-to-speech and speech recognition for the Speak section.
// In the Android app these go through native Capacitor plugins (the WebView
// has no speech recognition); in the browser they use the Web Speech API.
import { Capacitor } from "@capacitor/core";

const LANG = "es-ES";

const native = () => Capacitor.isNativePlatform();

type WebRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function webRecognitionCtor(): (new () => WebRecognition) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => WebRecognition) | undefined;
}

export async function canListen(): Promise<boolean> {
  if (native()) {
    try {
      const { SpeechRecognition } = await import("@capacitor-community/speech-recognition");
      return (await SpeechRecognition.available()).available;
    } catch {
      return false;
    }
  }
  return Boolean(webRecognitionCtor());
}

export function canSpeak(): boolean {
  return native() || (typeof window !== "undefined" && "speechSynthesis" in window);
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === LANG) ??
    voices.find((v) => v.lang.startsWith("es")) ??
    undefined
  );
}

export async function speak(text: string, slow = false): Promise<void> {
  const rate = slow ? 0.65 : 0.9;
  if (native()) {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    await TextToSpeech.stop().catch(() => {});
    await TextToSpeech.speak({ text, lang: LANG, rate, category: "playback" });
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG;
    utterance.rate = rate;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
}

export type Listening = {
  /** Resolves with the recogniser's best guesses (most likely first). */
  result: Promise<string[]>;
  stop: () => void;
};

/**
 * Start listening for one utterance in Spanish. `onPartial` receives live text
 * where the platform supports it (browsers); the final alternatives come back
 * through `result`.
 */
export function listen(onPartial?: (text: string) => void): Listening {
  if (native()) return listenNative();

  const Ctor = webRecognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error("unsupported")), stop: () => {} };
  const rec = new Ctor();
  rec.lang = LANG;
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;

  let finals: string[] = [];
  let latest = "";
  const result = new Promise<string[]>((resolve, reject) => {
    rec.onresult = (event) => {
      const results = Array.from(event.results);
      latest = results.map((r) => r[0]?.transcript ?? "").join(" ").trim();
      onPartial?.(latest);
      const last = results[results.length - 1];
      if (last?.isFinal) {
        finals = Array.from(last).map((alt) => alt.transcript.trim());
      }
    };
    rec.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") resolve([]);
      else reject(new Error(event.error));
    };
    rec.onend = () => resolve(finals.length > 0 ? finals : latest ? [latest] : []);
  });
  rec.start();
  return { result, stop: () => rec.stop() };
}

function listenNative(): Listening {
  let stopFn = () => {};
  const result = (async () => {
    const { SpeechRecognition } = await import("@capacitor-community/speech-recognition");
    stopFn = () => void SpeechRecognition.stop().catch(() => {});
    const perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== "granted") throw new Error("not-allowed");
    const res = await SpeechRecognition.start({
      language: LANG,
      maxResults: 5,
      partialResults: false,
      popup: false,
    });
    return res?.matches ?? [];
  })();
  return { result, stop: () => stopFn() };
}

// ---- scoring ----

export function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Which target words were heard, in order (longest common subsequence). */
function matchWords(target: string[], heard: string[]): boolean[] {
  const n = target.length;
  const m = heard.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = target[i] === heard[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ok = new Array<boolean>(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (target[i] === heard[j]) {
      ok[i] = true;
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i += 1;
    else j += 1;
  }
  return ok;
}

export type SpeechScore = {
  /** One entry per word of the displayed sentence. */
  words: { text: string; ok: boolean }[];
  ratio: number;
  heard: string;
};

/** Score the best of the recogniser's alternatives against the target sentence. */
export function scoreSpeech(target: string, alternatives: string[]): SpeechScore {
  const display = target.split(/\s+/).filter(Boolean);
  const keys = display.map((word) => normalizeWords(word).join(""));
  let best: SpeechScore = { words: display.map((text) => ({ text, ok: false })), ratio: 0, heard: alternatives[0] ?? "" };
  for (const alt of alternatives) {
    const heard = normalizeWords(alt);
    const ok = matchWords(keys, heard);
    const counted = keys.filter(Boolean).length || 1;
    const ratio = ok.filter((v, i) => v && keys[i]).length / counted;
    if (ratio > best.ratio) {
      best = { words: display.map((text, i) => ({ text, ok: ok[i] || !keys[i] })), ratio, heard: alt };
    }
  }
  return best;
}
