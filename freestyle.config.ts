import { defineConfig } from "freestyle-sh";


export default defineConfig({
  dev: {
    command: "npm run dev",
    proxy: "http://localhost:3000",
  },
  deploy: {
    
    web: {
      entryPoint: "freestylebuild/server.js",
      
    },
  },
});
