#!/usr/bin/env node
const Path = require("path");
const Fs = require("fs");
const pkg = require("../package.json");

async function main(args) {
  if (args.length !== 1) {
    throw new Error("create-manifest requires exactly one positional argument");
  }

  const appManifestPath = Path.join(process.cwd(), args[0]);
  const appManifest = JSON.parse(
    await Fs.promises.readFile(appManifestPath, "utf-8")
  );
  const appName = Path.basename(args[0], Path.extname(args[0]));

  const appDirname = Path.dirname(appManifestPath);
  const appTemplatePath = `${appName}.html`;
  const appScriptPath = `${appName}.js`;

  const commit = (
    await Fs.promises.readFile(
      Path.join(__dirname, "../devtools-frontend.commit"),
      "utf-8"
    )
  ).slice(0, 8);

  const files = [
    appTemplatePath,
    appScriptPath,
    'root.js',
    'Images/**/*',
    'generated/**/*',
    'console_counters/**/*',
    'root/**/*',
    'protocol_client/**/*',
    ...new Set(
      flatten([
        ...(await getImportedFiles(appScriptPath, appDirname)),
        ...(await Promise.all(
          appManifest.modules.map(({ name }) =>
            getModuleFiles(name, appDirname)
          )
        ))
      ])
    )
  ];

  const suffix = process.env.GITHUB_RUN_ID ? `+${process.env.GITHUB_RUN_ID}` : '';

  return JSON.stringify(
    {
      ...pkg,
      version: pkg.version.includes("+")
        ? pkg.version
        : `${pkg.version}-${commit}${suffix}`,
      files
    },
    null,
    2
  );
}

async function getImportedFiles(file, appDirname) {
  const contents = await Fs.promises.readFile(
    Path.join(appDirname, file),
    "utf-8"
  );
  const imports = contents
    .split("\n")
    .filter(line => line.startsWith("import"));

  const filePath = Path.join(appDirname, file);
  const filePaths = imports
    .map(i => i.split("from"))
    .filter(f => f.length === 2)
    .map(([, f]) => f.replace(/[\;|\']/g, "").trim())
    .map(f => Path.resolve(filePath, "..", f))
    .map(f => Path.relative(appDirname, f));

  return [
    ...filePaths,
    ...flatten(
      await Promise.all(filePaths.map(f => getImportedFiles(f, appDirname)))
    )
  ];
}

async function getModuleFiles(moduleName, appDirname) {
  const moduleManifestPath = Path.join(appDirname, moduleName, "module.json");
  const moduleManifest = JSON.parse(
    await Fs.promises.readFile(moduleManifestPath, "utf-8")
  );

  return [
    `${moduleName}/**/*`,
    ...flatten(
      await Promise.all(
        (moduleManifest.dependencies || []).map(i =>
          getModuleFiles(i, appDirname)
        )
      )
    )
  ];
}

const flatten = a =>
  a.reduce(
    (acc, item) => (Array.isArray(item) ? [...acc, ...item] : [...acc, item]),
    []
  );

main(process.argv.slice(2))
  .then(console.log)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
