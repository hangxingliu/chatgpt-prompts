#!/usr/bin/env node
//@ts-check
/// <reference types="node" />

const fs = require("fs-extra");
const path = require("path");

const projectDir = path.resolve(__dirname, '..');

clean(path.resolve(projectDir, '.tsc'));
clean(path.resolve(projectDir, 'ext'), true);

/**
 * @param {string} dir
 * @param {boolean} [keep]
 */
function clean(dir, keep = false) {
  try {
    if (!fs.existsSync(dir)) return;
    const isFile = fs.statSync(dir).isFile();
    if (!keep || isFile) fs.removeSync(dir);
    else {
      const files = fs.readdirSync(dir);
      files.forEach((item) => fs.removeSync(path.join(dir, item)));
    }
    console.log(`cleaned '${path.basename(dir)}'`);
  } catch (error) {
    console.error(`error: ${error.message}`);
  }
}
