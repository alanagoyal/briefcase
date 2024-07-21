import fs from "fs";
// prepend to file
//globalThis.process = { env: {}, chdir: Deno.chdir, exit: Deno.exit };
const prepend =
  "/*Injected via Freestyle monkey-patch.ts*/\nimport process from 'node:process';\nconst window = globalThis;\n /* End of Freestyle Injection*/\n";
const filePath = "freestylenext/standalone/server.js";
const file = fs.readFileSync(filePath, "utf8");
let newFile = prepend + file;

const oldImport = `require('next')
const { startServer } = require('next/dist/server/lib/start-server')`;

const newImport = `import next from "npm:next/dist/server/lib/start-server.js";
const { startServer } = next;`;

newFile = newFile.replace(oldImport, newImport);

fs.writeFileSync(filePath, newFile);
