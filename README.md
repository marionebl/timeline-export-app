# timeline-export-app

Source repository to create and extract a custom timeline app from chrome-devtools-frontend.

```
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git 
export PATH=$PATH:$(realpath depot_tools)

git clone https://gn.googlesource.com/gn
cd gn
python build/gen.py
ninja -C out
export PATH=$PATH:$(realpath out)

mkdir devtools
cd devtools
fetch devtools-frontend
cd devtools-frontend
git apply ../../patches/add-timeline_export_app.patch
git apply ../../patches/add-timeline-panel-ux.patch
glient sync
gn gen out/Default
autoninja -C out/Default

node scripts/create-manifest.js out/Default/resources/inspector/timeline_export_app.json > package.json
cd out/Default/resources/inspector
npm publish
```