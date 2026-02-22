import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath } from "node:url"

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/components/**", "app/composables/**", "app/stores/**"],
    },
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
})
