// Irish speech from ABAIR (Phonetics and Speech Laboratory, Trinity College
// Dublin) — https://abair.ie. Free for personal, educational and
// non-commercial use. Audio is cached on the device after the first play.

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

/** Speak Irish text in the chosen dialect. Resolves when playback ends. */
export async function speakIrish(text: string, slow = false): Promise<void> {
  const dialect = DIALECTS.find((d) => d.id === getDialect()) ?? DIALECTS[0];
  const url = await fetchAudio(text, dialect.voice, slow ? 0.75 : 1);
  current?.pause();
  const audio = new Audio(url);
  current = audio;
  await new Promise<void>((resolve) => {
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    void audio.play().catch(() => resolve());
  });
}

export const ABAIR_CREDIT = "Irish speech by ABAIR, Phonetics and Speech Laboratory, Trinity College Dublin (abair.ie)";
