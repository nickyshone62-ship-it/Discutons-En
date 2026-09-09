import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Discutons-En",
    short_name: "Discutons-En",
    description:
      "DIScutons-En est une communauté où chacun peut partager ses problèmes, demander des conseils et aider les autres.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdf8fa",
    theme_color: "#ff2a6d",
    lang: "fr",
    id: "/",
    scope: "/",
    categories: ["social", "community", "productivity"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
