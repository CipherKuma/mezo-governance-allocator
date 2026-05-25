import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer"],
      globals: { Buffer: true },
    }),
  ],
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
});
