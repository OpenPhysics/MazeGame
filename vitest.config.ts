import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    execArgv: ["--expose-gc"],
    testTimeout: 30_000,
    include: ["tests/**/*.test.ts"],
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
  },
});
