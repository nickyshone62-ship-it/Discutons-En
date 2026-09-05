import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import * as micah from "@dicebear/micah";
import * as lorelei from "@dicebear/lorelei";
import * as botttsNeutral from "@dicebear/bottts-neutral";
import * as initials from "@dicebear/initials";

export type SnapchatAvatarPreset = {
  id: string;
  name: string;
  seed: string;
  bg: string;
  category: "Classic" | "Modern" | "Artistic" | "Cyber";
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

const STYLES = ["avataaars", "micah", "lorelei", "bottts"] as const;

const STYLE_NAMES = [
  "Casual", "Cool", "Chill", "Chic", "Gamer", "Artist", "Cyber", "Star", "Pro", "Trend",
  "Glow", "Tech", "Urban", "Hipster", "Retro", "Futuristic", "Minimal", "Neon", "Vintage", "Cosmic"
];

export const SNAPCHAT_AVATARS: SnapchatAvatarPreset[] = Array.from({ length: 100 }, (_, i) => {
  const num = i + 1;
  const style = STYLES[i % STYLES.length];
  const bg = BG_GRADIENTS[i % BG_GRADIENTS.length];
  const styleName = STYLE_NAMES[i % STYLE_NAMES.length];

  const category: "Classic" | "Modern" | "Artistic" | "Cyber" =
    style === "avataaars"
      ? "Classic"
      : style === "micah"
      ? "Modern"
      : style === "lorelei"
      ? "Artistic"
      : "Cyber";

  return {
    id: `snap-${num}`,
    name: `Bitmoji #${num} ${styleName}`,
    seed: `${style}:snapchat-avatar-seed-${num}`,
    bg: bg,
    category: category,
  };
});

export function getAvatarUrl(seed: string, name: string) {
  const effectiveSeed = seed || name || "snapchat-default";

  if (effectiveSeed.startsWith("avataaars:")) {
    const cleanSeed = effectiveSeed.replace("avataaars:", "");
    return createAvatar(avataaars, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  if (effectiveSeed.startsWith("micah:")) {
    const cleanSeed = effectiveSeed.replace("micah:", "");
    return createAvatar(micah, {
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

  if (effectiveSeed.startsWith("bottts:")) {
    const cleanSeed = effectiveSeed.replace("bottts:", "");
    return createAvatar(botttsNeutral, {
      seed: cleanSeed,
      radius: 50,
      size: 160,
    }).toDataUri();
  }

  // Fallback to avataaars for rich cartoon rendering
  try {
    return createAvatar(avataaars, {
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


