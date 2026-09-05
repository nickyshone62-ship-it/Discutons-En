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
};

export const SNAPCHAT_AVATARS: SnapchatAvatarPreset[] = [
  { id: "snap-1", name: "Bitmoji Casual", seed: "avataaars:snap-alex", bg: "from-cyan-400 to-sky-500" },
  { id: "snap-2", name: "Bitmoji Cool", seed: "avataaars:snap-sam", bg: "from-rose-500 to-pink-500" },
  { id: "snap-3", name: "Bitmoji Chill", seed: "micah:snap-jordan", bg: "from-purple-500 to-indigo-500" },
  { id: "snap-4", name: "Bitmoji Chic", seed: "lorelei:snap-taylor", bg: "from-amber-400 to-yellow-500" },
  { id: "snap-5", name: "Bitmoji Gamer", seed: "avataaars:snap-morgan", bg: "from-emerald-400 to-teal-500" },
  { id: "snap-6", name: "Bitmoji Artist", seed: "micah:snap-riley", bg: "from-pink-500 to-rose-400" },
  { id: "snap-7", name: "Bitmoji Cyber", seed: "bottts:snap-casey", bg: "from-blue-500 to-cyan-500" },
  { id: "snap-8", name: "Bitmoji Star", seed: "lorelei:snap-avery", bg: "from-orange-400 to-amber-500" },
  { id: "snap-9", name: "Bitmoji Pro", seed: "avataaars:snap-quinn", bg: "from-violet-500 to-purple-600" },
  { id: "snap-10", name: "Bitmoji Trend", seed: "micah:snap-dakota", bg: "from-cyan-300 to-blue-600" },
  { id: "snap-11", name: "Bitmoji Glow", seed: "lorelei:snap-skyler", bg: "from-teal-400 to-emerald-600" },
  { id: "snap-12", name: "Bitmoji Tech", seed: "bottts:snap-reese", bg: "from-indigo-500 to-blue-700" },
];

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

