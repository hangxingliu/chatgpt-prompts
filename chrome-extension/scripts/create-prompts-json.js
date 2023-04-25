#!/usr/bin/env node
//@ts-check
/// <reference types="node" />

const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(__dirname, "../../prompts");
const target = path.resolve(__dirname, "../src/prompts.json");
if (!fs.existsSync(srcDir)) {
  console.log(`skipped, because that '${srcDir}' doesn't exist`);
  process.exit(0);
}

const files = fs.readdirSync(srcDir); // Read all files in the directory

const result = [];
files.forEach((file) => {
  if (file.startsWith(".")) return;
  if (!file.match(/\.txt$/i)) return;

  const filePath = `${srcDir}/${file}`; // Get the full path of the file
  const fileData = fs.readFileSync(filePath, "utf-8"); // Read the file synchronously

  // Split the file data into an array of lines
  const extracted = extractTitle(fileData);
  if (!extracted) return;

  // Add the data to the object
  result.push(extracted);

});
fs.writeFileSync(target, JSON.stringify(result, null, 2));
console.log(target);

function extractTitle(text = "") {
  const lines = text.split("\n"); // Split the text into an array of lines
  for (let i = 0; i < lines.length; i++) {
    // Loop through the lines
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      // Check if the line starts with a '#'
      return {
        title: trimmed.slice(1).trim(),
        text: lines.slice(1).join("\n").trim(),
      };
    }
  }
}
