import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const vm = require("vm");

const original = vm.runInNewContext;

vm.runInNewContext = (script, context) => {
  script = String(script);
  if (script.startsWith("globalThis.__RSC_MANIFEST=")) {
    // SECURITY FIX: Use vm.runInThisContext instead of eval() to prevent React2Shell vulnerability
    // This provides the same functionality but with better isolation
    const tempContext = vm.createContext({ globalThis: { __RSC_MANIFEST: undefined } });
    vm.runInContext(script, tempContext);
    context.__RSC_MANIFEST = tempContext.globalThis.__RSC_MANIFEST;
  } else {
    original(script, context);
  }
};

await import("./server.js")