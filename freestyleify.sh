cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/node_modules
cp  cache-handler.js .next/standalone/cache-handler.js
# rm -rf freestylebuild
# mkdir freestylebuild
# cp -r .next/standalone/* freestylebuild
# cp -r .next/standalone/.next freestylebuild/
# # cp deno.json freestylebuild/deno.json
# rm freestylebuild/package.json

node monkey-patch.js
cp entry.js .next/standalone/entry.js