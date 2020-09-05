# timeline-export-app

Source repository to create and extract a custom timeline app from chrome-devtools-frontend.

## Getting started

```sh
docker run -it --mount type=bind,source="$PWD,target=/repo" marionebl/depot_tools:latest /bin/sh
cd /repo
mkdir devtools
cd devtools
fetch devtools-frontend
git checkout $(cat ../../devtools-frontend.commit)
gclient sync
gclient sync --with_branch_heads
gclient runhooks
git apply ../../patches/add-timeline_export_app.patch
git apply ../../patches/adapt-timeline-panel-ux.patch
git apply ../../patches/fix-firefox-crash.patch
gn gen out/Default
autoninja -C out/Default
npx serve out/Default/resources/inspector
```

## Manual setup

```sh
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
