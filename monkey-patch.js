import fs from 'fs';
// prepend to file
const prepend = "/*Injected via Freestyle monkey-patch.ts*/\nconst process = { env: {}, chdir: Deno.chdir };\n /* End of Freestyle Injection*/\n";
const filePath = ".next/standalone/server.js";
const file = fs.readFileSync(filePath, "utf8");
const newFile = prepend + file;


fs.writeFileSync(filePath, newFile);
