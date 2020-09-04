const Fs = require("fs");
const Path = require("path");

const SOURCE = Path.resolve(__dirname, './files');
const TARGET = "front_end"

const FILES = [
  "timeline_export_app.html",
  "timeline_export_app.js",
  "timeline_export_app.json"
];

function main() {
  const target = Path.resolve(process.cwd(), TARGET);
  FILES.map(file => Fs.copyFileSync(Path.join(SOURCE, file), Path.join(target, file)));
}

main();
