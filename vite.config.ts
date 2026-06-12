import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig(async () => {
  const { nitro } = await import("nitro/vite");

  return {
    cloudflare: false,
    plugins: [nitro({ preset: "netlify" })],
    tanstackStart: {
      server: { entry: "server" },
    },
  };
});