cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/node_modules
cp freestyle/entry.js .next/standalone/entry.js

node freestyle/monkey-patch.js
