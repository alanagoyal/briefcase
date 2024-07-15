import { defineConfig } from "freestyle-sh";

export default defineConfig({
  dev: {
    command: "deno run -A ./start-deno.ts",
    proxy: "http://localhost:3000",
  },
  deploy: {
    web: {
      entryPoint: "./start-deno.ts",
    },
  },
});
