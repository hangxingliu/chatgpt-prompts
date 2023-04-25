import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getMarkdownFromGPTJSON } from "../src/utils/json-to-markdown";

const input = resolve(__dirname, 'files/chatgpt.json');
const output = resolve(__dirname, 'files/chatgpt.md');

const json = JSON.parse(readFileSync(input, 'utf8'));
const markdown = getMarkdownFromGPTJSON(json);
writeFileSync(output, markdown);
console.log(output);
