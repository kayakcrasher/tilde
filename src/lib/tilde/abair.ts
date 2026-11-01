// Irish speech from ABAIR (Phonetics and Speech Laboratory, Trinity College
// Dublin) — https://abair.ie. Free for personal, educational and
// non-commercial use.
//
// Offline first: every sentence, word, story and lesson example was recorded
// once in the Connacht voice and ships inside the app (public/audio/ga). The
// other dialects stream from ABAIR when online, and fall back to the bundled
// Connacht recording when there's no connection.
import { AUDIO_KEYS } from "./packs/ga/audio-keys";

export type Dialect = "CO" | "MU" | "UL";

export const DIALECTS: { id: Dialect; name: string; place: string; voice: string }[] = [
  { id: "CO", name: "Connacht", place: "Conamara, Co. Galway", voice: "ga_CO_snc_piper" },
  { id: "MU", name: "Munster", place: "Corca Dhuibhne, Co. Kerry", voice: "ga_MU_nnc_piper" },
  { id: "UL", name: "Ulster", place: "Gaoth Dobhair, Co. Donegal", voice: "ga_UL_anb_piper" },
];

const KEY = "tilde-ga-dialect";

export function getDialect(): Dialect {
  try {
    const v = localStorage.getItem(KEY);
    return v === "MU" || v === "UL" ? v : "CO";
  } catch {
    return "CO";
  }
}

export function setDialect(d: Dialect) {
  try {
    localStorage.setItem(KEY, d);
  } catch {
    /* storage unavailable */
  }
}

const memory = new Map<string, string>();
const CACHE = "tilde-abair-v1";

async function fetchAudio(text: string, voice: string, rate: number): Promise<string> {
  const key = `${voice}|${rate}|${text}`;
  const hit = memory.get(key);
  if (hit) return hit;
  const cacheUrl = `https://tilde.local/abair/${encodeURIComponent(key)}`;
  let cache: Cache | undefined;
  try {
    cache = await caches.open(CACHE);
    const stored = await cache.match(cacheUrl);
    if (stored) {
      const url = URL.createObjectURL(await stored.blob());
      memory.set(key, url);
      return url;
    }
  } catch {
    /* Cache Storage unavailable — fall through to the network */
  }
  const res = await fetch("https://api.abair.ie/v3/synthesis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      synthinput: { text },
      voiceparams: { languageCode: "ga-IE", name: voice },
      audioconfig: { audioEncoding: "MP3", speakingRate: rate },
      outputType: "JSON",
    }),
  });
  if (!res.ok) throw new Error(`ABAIR ${res.status}`);
  const data = (await res.json()) as { audioContent?: string };
  if (!data.audioContent) throw new Error("ABAIR returned no audio");
  const bytes = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "audio/mpeg" });
  try {
    await cache?.put(cacheUrl, new Response(blob, { headers: { "Content-Type": "audio/mpeg" } }));
  } catch {
    /* quota or private mode — fine, just not cached */
  }
  const url = URL.createObjectURL(blob);
  memory.set(key, url);
  return url;
}

let current: HTMLAudioElement | null = null;

async function sha1Key(text: string): Promise<string | null> {
  try {
    const bytes = new TextEncoder().encode(text.trim());
    const digest = await crypto.subtle.digest("SHA-1", bytes);
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 12);
  } catch {
    return null;
  }
}

/** URL of the recording bundled with the app, if this exact text has one. */
async function bundledUrl(text: string): Promise<string | null> {
  const key = await sha1Key(text);
  return key && AUDIO_KEYS.has(key) ? `./audio/ga/${key}.mp3` : null;
}

function play(url: string, slow: boolean): Promise<void> {
  current?.pause();
  const audio = new Audio(url);
  current = audio;
  if (slow) {
    audio.playbackRate = 0.8;
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
  }
  return new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("audio failed"));
    void audio.play().catch(reject);
  });
}

/** Speak Irish text. Works offline for everything in the course. */
export async function speakIrish(text: string, slow = false): Promise<void> {
  const dialect = DIALECTS.find((d) => d.id === getDialect()) ?? DIALECTS[0];
  const bundled = await bundledUrl(text);
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  // Connacht, or no connection: use the recording that ships with the app.
  if (bundled && (dialect.id === "CO" || !online)) {
    try {
      return await play(bundled, slow);
    } catch {
      /* fall through to ABAIR */
    }
  }
  try {
    const url = await fetchAudio(text, dialect.voice, 1);
    return await play(url, slow);
  } catch {
    // Last resort: the bundled Connacht recording. If there isn't one (and
    // we're offline), stay quiet rather than throwing at the button.
    if (bundled) await play(bundled, slow).catch(() => {});
  }
}

export const ABAIR_CREDIT = "Irish speech by ABAIR, Phonetics and Speech Laboratory, Trinity College Dublin (abair.ie)";
