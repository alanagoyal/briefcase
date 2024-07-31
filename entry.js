import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const vm = require("vm");

const original = vm.runInNewContext;

vm.runInNewContext = (script, context) => {
  script = String(script);
  if (script.startsWith("globalThis.__RSC_MANIFEST=")) {
    delete globalThis.__RSC_MANIFEST;
    eval(script);
    context.__RSC_MANIFEST = globalThis.__RSC_MANIFEST;
    delete globalThis.__RSC_MANIFEST;
  } else {
    original(script, context);
  }
};

await import("./server.js")