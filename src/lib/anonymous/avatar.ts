import { createAvatar } from "@dicebear/core";
import * as adventurer from "@dicebear/adventurer";
import * as avataaars from "@dicebear/avataaars";
import * as personas from "@dicebear/personas";
import * as openPeeps from "@dicebear/open-peeps";
import * as lorelei from "@dicebear/lorelei";
import * as initials from "@dicebear/initials";

export type SnapchatAvatarPreset = {
  id: string;
  name: string;
  seed: string;
  bg: string;
  category: "Réaliste 3D" | "Portraits" | "Classique" | "Moderne";
};

const BG_GRADIENTS = [
  "from-cyan-400 to-sky-500",
  "from-rose-500 to-pink-500",
  "from-purple-500 to-indigo-500",
  "from-amber-400 to-yellow-500",
  "from-emerald-400 to-teal-500",
  "from-pink-500 to-rose-400",
  "from-blue-500 to-cyan-500",
  "from-orange-400 to-amber-500",
  "from-violet-500 to-purple-600",
  "from-teal-400 to-emerald-600",
  "from-fuchsia-500 to-pink-600",
  "from-lime-400 to-emerald-500",
  "from-sky-400 to-indigo-600",
  "from-amber-500 to-red-500",
  "from-indigo-400 to-purple-700",
  "from-cyan-300 to-blue-600",
];

const REALISTIC_STYLES = ["adventurer", "personas", "avataaars", "openPeeps"] as const;

export const SNAPCHAT_AVATARS: SnapchatAvatarPreset[] = Array.from({ length: 100 }, (_, i) => {
  const num = i + 1;
  const style = REALISTIC_STYLES[i % REALISTIC_STYLES.length];
  const bg = BG_GRADIENTS[i % BG_GRADIENTS.length];

  const category: "Réaliste 3D" | "Portraits" | "Classique" | "Moderne" =
    style === "adventurer"
      ? "Réaliste 3D"
      : style === "personas"
      ? "Portraits"
      : style === "avataaars"
      ? "Classique"
      : "Moderne";

  return {
    id: `avatar-${num}`,
    name: `Avatar Réaliste #${num}`,
    seed: `${style}:realistic-human-seed-${num}`,
    bg: bg,
    category: category,
  };
});

export function getAvatarUrl(seed: string, name: string) {
  const effectiveSeed = seed || name || "realistic-default";

  if (effectiveSeed.startsWith("adventurer:")) {
    const cleanSeed = effectiveSeed.replace("adventurer:", "");
    return createAvatar(adventurer, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  if (effectiveSeed.startsWith("personas:")) {
    const cleanSeed = effectiveSeed.replace("personas:", "");
    return createAvatar(personas, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  if (effectiveSeed.startsWith("avataaars:")) {
    const cleanSeed = effectiveSeed.replace("avataaars:", "");
    return createAvatar(avataaars, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  if (effectiveSeed.startsWith("openPeeps:")) {
    const cleanSeed = effectiveSeed.replace("openPeeps:", "");
    return createAvatar(openPeeps, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  if (effectiveSeed.startsWith("lorelei:")) {
    const cleanSeed = effectiveSeed.replace("lorelei:", "");
    return createAvatar(lorelei, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  // Fallback to adventurer for realistic human rendering
  try {
    return createAvatar(adventurer, {
      seed: effectiveSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  } catch {
    return createAvatar(initials, {
      seed: effectiveSeed,
      radius: 50,
      size: 160,
      fontWeight: 700,
    }).toDataUri();
  }
}
