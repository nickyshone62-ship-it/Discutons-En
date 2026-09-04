import { createAvatar } from "@dicebear/core";
import * as initials from "@dicebear/initials";

export function getAvatarUrl(
  seed: string,
  name: string
) {
  const avatar = createAvatar(initials, {
    seed: seed || name,
    backgroundType: ["solid"],
    fontSize: 42,
    chars: 2,
    radius: 50,
    size: 160,
    fontWeight: 700,
    backgroundColor: [
      "b6e3f4",
      "c0aede",
      "d1d4f9",
      "ffd5dc",
      "ffdfbf"
    ],
  });

  return avatar.toDataUri();
}
