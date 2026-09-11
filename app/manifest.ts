import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IDE Scriptum",
    short_name: "Scriptum",
    description: "Caderno de estudos e leitura bíblica.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0c14",
    theme_color: "#0d0f18",
    icons: [
      { src: "/scriptum-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/scriptum-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/scriptum-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
