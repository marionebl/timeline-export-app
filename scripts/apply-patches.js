const Fs = require("fs");
const ChildProcess = require("child_process");
const Path = require("path");

function main(args) {
  if (args.length !== 1) {
    throw new Error("apply-patches requires exactly one positional argument");
  }

  const target = Path.resolve(process.cwd(), args[0]);

  Fs.readdirSync(target)
    .map((fileName) => Path.join(target, fileName))
    .filter((file) => {
      const stat = Fs.statSync(file);
      return stat.isFile();
    })
    .forEach((file) => {
      if (Path.extname(file) === ".js") {
        ChildProcess.fork(file, {
          cwd: process.cwd(),
        });
      }

      if (Path.extname(file) === ".patch") {
        ChildProcess.execSync(`git apply ${file}`);
      }
    });
}

main(process.argv.slice(2));
