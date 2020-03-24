#!/usr/bin/env node
const Path = require('path');
const Fs = require('fs');
const pkg = require('../package.json');

async function main(args) {
  if (args.length !== 1) {
    throw new Error('create-manifest requires exactly one positional argument');
  }

  const appManifestPath = Path.join(process.cwd(), args[0]);
  const appManifest = JSON.parse(await Fs.promises.readFile(appManifestPath, 'utf-8'));
  const appName = Path.basename(args[0], Path.extname(args[0]));

  const appTemplatePath = `${appName}.html`;
  const appScriptPath = `${appName}.js`;

  const commit = (await Fs.promises.readFile(Path.join(__dirname, '../devtools-frontend.commit'), 'utf-8')).slice(0, 8);

  const files = [
    'root.js',
    'RuntimeInstantiator.js',
    appTemplatePath,
    appScriptPath,
    ...new Set(flatten(await Promise.all(appManifest.modules.map(({name}) => getModuleFiles(name)))))
  ];

  return JSON.stringify({
    ...pkg,
    version: pkg.version.includes('-') ? pkg.version : `${pkg.version}-${commit}`,
    files
  }, null, 2);
}

async function getModuleFiles(moduleName) {
  const moduleManifestPath = Path.join(process.cwd(), 'front_end', moduleName, 'module.json');
  const moduleManifest = JSON.parse(await Fs.promises.readFile(moduleManifestPath, 'utf-8'));
  const prefix = items => items.map(name => Path.join(moduleName, name));

  return [
    ...prefix(moduleManifest.modules),
    ...prefix(moduleManifest.resources || []),
    ...prefix(moduleManifest.scripts),
    ...flatten(await Promise.all((moduleManifest.dependencies || []).map(getModuleFiles)))
  ];
}

const flatten = a => a.reduce((acc, item) => Array.isArray(item) ? [...acc, ...item] : [...acc, item], []);

main(process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exit(1);
});
