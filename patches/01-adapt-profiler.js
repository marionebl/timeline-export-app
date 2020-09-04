const Fs = require("fs");
const Path = require("path");

const TARGET = "./front_end/profiler/module.json";

function main() {
  const path = Path.resolve(process.cwd(), TARGET);
  const data = JSON.parse(Fs.readFileSync(path, "utf-8"));

  data.extensions = data.extensions
    .filter((extension) => extension.id !== "heap_profiler")
    .map((extension) => {
      if (
        extension.category === "Memory" ||
        extension.category === "JavaScript Profiler"
      ) {
        const {category, title, ...rest} = extension;
        return rest;
      }

      return extension;
    });

  Fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

main();
