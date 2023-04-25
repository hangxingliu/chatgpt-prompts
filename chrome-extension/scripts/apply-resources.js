#!/usr/bin/env node
//@ts-check
/// <reference types="node" />

const fs = require("fs-extra");
const { resolve, basename } = require("path");

const defaultResourcesBase = resolve(__dirname, "../default-resources");
const customResourcesBase = resolve(__dirname, "../custom-resources");
const targetBase = resolve(__dirname, '..');
const files = {
  '16.png': 'src/icons',
  '32.png': 'src/icons',
  '48.png': 'src/icons',
  '128.png': 'src/icons',
};

const mkdir = new Set();
for (const [file, target] of Object.entries(files)) {
  const targetDir = resolve(targetBase, target);
  if (!mkdir.has(targetDir)) {
    fs.mkdirpSync(targetDir);
    mkdir.add(targetDir);
  }
  const customResource = resolve(customResourcesBase, file);
  if (fs.existsSync(customResource)) {
    fs.copySync(customResource, resolve(targetDir, file));
    console.log(`copied ${file} from ${basename(customResourcesBase)}`);
    continue;
  }
  const defaultResource = resolve(defaultResourcesBase, file);
  fs.copySync(defaultResource, resolve(targetDir, file));
  console.log(`copied ${file} from ${basename(defaultResourcesBase)}`);
}

