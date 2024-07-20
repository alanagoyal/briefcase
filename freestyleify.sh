cp -r public freestylenext/standalone/public
cp -r freestylenext/static freestylenext/standalone/freestylenext/static
node monkey-patch.js
rm -rf freestylenext/standalone/node_modules
rm -rf freestylebuild
mkdir freestylebuild
cp -r freestylenext/standalone/* freestylebuild
cp -r freestylenext/standalone/freestylenext freestylebuild/