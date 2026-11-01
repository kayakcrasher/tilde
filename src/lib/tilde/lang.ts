import { create } from "zustand";
import { persist } from "zustand/middleware";
import { spanish } from "./packs/es";
import type { Pack } from "./types";

export const PACKS: Pack[] = [spanish];

export type LangCode = Pack["code"];

let active: Pack = spanish;

/** The language pack everything currently reads from. */
export function pack(): Pack {
  return active;
}

export function packFor(code: string): Pack {
  return PACKS.find((p) => p.code === code) ?? spanish;
}

export function activate(code: string): Pack {
  active = packFor(code);
  return active;
}

/** Which language is selected; remembered on this device. */
export const useLang = create<{ code: LangCode; setCode: (code: LangCode) => void }>()(
  persist((set) => ({ code: "es", setCode: (code) => set({ code }) }), { name: "tilde-lang" }),
);
