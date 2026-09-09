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
  "from-pink-500 to-rose-600",
  "from-rose-500 to-pink-500",
  "from-pink-400 to-rose-500",
  "from-rose-600 to-pink-400",
  "from-pink-600 to-rose-700",
  "from-pink-500 to-rose-400",
  "from-[#ff2a6d] to-rose-600",
  "from-rose-400 to-pink-600",
  "from-fuchsia-500 to-pink-600",
  "from-pink-500 to-rose-500",
  "from-rose-500 to-pink-600",
  "from-pink-400 to-rose-400",
  "from-rose-600 to-pink-500",
  "from-pink-500 to-rose-600",
  "from-rose-500 to-[#ff2a6d]",
  "from-pink-600 to-rose-500",
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
