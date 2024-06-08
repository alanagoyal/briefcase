import { defineConfig } from "freestyle-sh";

export default defineConfig({
  dev: {
    command: "npx next dev",
    proxy: "http://localhost:3000",
  },
});
