import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        lines: 19,
        functions: 23,
        branches: 11,
        statements: 18,
        autoUpdate: (threshold, previous) =>
          Math.max(previous, Math.floor(threshold) - 1),
      },
    },
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
