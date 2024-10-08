import { defineConfig } from "freestyle-sh";

export default defineConfig({
  dev: {
    command: "npm run dev",
    proxy: "http://localhost:3000",
  },
  deploy: {
    cloudstate: {
      envVars: {
        ACTIONBASE_API_KEY: process.env.ACTIONBASE_API_KEY ?? "",
        BRAINTRUST_API_KEY: process.env.BRAINTRUST_API_KEY ?? "",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      },
    },
    web: {
      entryPoint: ".next/standalone/entry.js",
    },
  },
});
