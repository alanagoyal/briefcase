import fs from "fs";
// prepend to file
//globalThis.process = { env: {}, chdir: Deno.chdir, exit: Deno.exit };
const prepend =
  "/*Injected via Freestyle monkey-patch.ts*/\nimport process from 'node:process';\nimport \"npm:react/jsx-runtime\";\nconst window = globalThis;\nconst stat = Deno.stat;\nDeno.stat = async (...args) => {\nconst info = await stat(...args);\ninfo.mtime = new Date(0);\nreturn info;\n};\n/* End of Freestyle Injection*/\n";
const filePath = ".next/standalone/server.js";
const file = fs.readFileSync(filePath, "utf8");
let newFile = prepend + file;

const oldImport = `require('next')
const { startServer } = require('next/dist/server/lib/start-server')`;

const newImport = `import next from "npm:next/dist/server/lib/start-server.js";
const { startServer } = next;`;

const oldImportModule = `import module from 'module'`;
const newImportModule = `import module from "node:module"`;

const oldImportPath = `import path from 'path'`;
const newImportPath = `import path from "node:path"`;

const oldImportURL = `import { fileURLToPath } from 'url'`;
const newImportURL = `import { fileURLToPath } from 'node:url'`;


newFile = newFile.replace(oldImport, newImport);
fs.writeFileSync(filePath, newFile);

newFile = newFile.replace(oldImportModule, newImportModule);
fs.writeFileSync(filePath, newFile);

newFile = newFile.replace(oldImportPath, newImportPath);
fs.writeFileSync(filePath, newFile);

newFile = newFile.replace(oldImportURL, newImportURL);
fs.writeFileSync(filePath, newFile);