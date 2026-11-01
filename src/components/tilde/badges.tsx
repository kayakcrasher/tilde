import { useEffect } from "react";
import { BADGES, badgeById, earnedBadges } from "@/lib/tilde/badges";
import { usePlay } from "@/lib/tilde/store";

/** Watch progress and unlock badges as they're earned. */
export function useBadgeWatcher() {
  const stats = usePlay((state) => state.stats);
  const speech = usePlay((state) => state.speech);
  const stories = usePlay((state) => state.stories);
  const placement = usePlay((state) => state.placement);
  const vocab = usePlay((state) => state.vocab);
  const build = usePlay((state) => state.build);
  const unlock = usePlay((state) => state.unlock);
  useEffect(() => {
    unlock(earnedBadges({ stats, speech, stories, placement, vocab, build }));
  }, [stats, speech, stories, placement, vocab, build, unlock]);
}

export function BadgeGrid() {
  const badges = usePlay((state) => state.badges);
  const count = BADGES.filter((b) => badges[b.id]).length;
  return (
    <section className="mt-7">
      <div className="flex items-baseline px-1">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Badges</h2>
        <span className="ml-auto text-xs text-muted tabular-nums">
          {count} / {BADGES.length}
        </span>
      </div>
      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {BADGES.map((badge) => {
          const on = Boolean(badges[badge.id]);
          return (
            <li
              key={badge.id}
              className={`card flex flex-col items-center rounded-2xl border px-2 py-3 text-center ${
                on ? "border-accent/40" : "border-line"
              }`}
              title={badge.goal}
            >
              <span className={`text-3xl leading-none ${on ? "" : "opacity-25 grayscale"}`} aria-hidden="true">
                {badge.icon}
              </span>
              <span className={`mt-2 text-xs leading-tight font-semibold ${on ? "text-fg" : "text-muted"}`}>{badge.title}</span>
              <span className="mt-1 text-[10px] leading-tight text-muted">{on ? "Unlocked" : badge.goal}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Small celebration at the bottom of the screen when a badge unlocks. */
export function BadgeToast() {
  const fresh = usePlay((state) => state.fresh);
  const dismiss = usePlay((state) => state.dismissFresh);
  const badge = fresh[0] ? badgeById(fresh[0]) : undefined;

  useEffect(() => {
    if (!badge) return;
    const timer = window.setTimeout(dismiss, 3500);
    return () => window.clearTimeout(timer);
  }, [badge, dismiss]);

  if (!badge) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        key={badge.id}
        type="button"
        onClick={dismiss}
        className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-accent/50 bg-surface px-4 py-3 text-left shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)]"
        role="status"
      >
        <span className="text-3xl" aria-hidden="true">
          {badge.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold tracking-widest text-accent uppercase">Badge unlocked</span>
          <span className="block font-display text-lg font-semibold">{badge.title}</span>
          <span className="block text-xs text-muted">{badge.goal}</span>
        </span>
      </button>
    </div>
  );
}
