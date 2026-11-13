import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/__tests__/**"],
      thresholds: {
        lines: 90,
        functions: 78,
        branches: 86,
        statements: 86,
        autoUpdate: (threshold, previous) =>
          Math.max(previous, Math.floor(threshold) - 1),
      },
    },
    environment: "node",
    globals: true,
  },
});
