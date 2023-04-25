//@ts-check
/// <reference types="node" />

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const CopyPlugin = require("copy-webpack-plugin");

const removeExt = (it) => it.replace(/\.(\w+)$/, "");
const config = {
  scripts: [
    ...glob.sync("**/index.ts", { cwd: "src" }).map(removeExt),
    // ...glob.sync("**/inject/*.ts", { cwd: "src" }).map(removeExt),
  ],
  assets: ["**/*.{json,png,css,html}"],
};

// generate a default prompts json
const promptsJSON = path.resolve(__dirname, "src/prompts.json");
if (!fs.existsSync(promptsJSON)) fs.writeFileSync(promptsJSON, "[]");

/** @type {import('webpack').Entry} */
const entry = {};
const allAssets = [];
config.scripts.forEach((script) => (entry[script] = `./src/${script}.ts`));
config.assets.forEach((asset) => allAssets.push(asset));

const isProduction = /^prod/.test(process.env.NODE_ENV || "");

/** @type {import('webpack').Configuration} */
const webpackConfig = {
  mode: isProduction ? "production" : "development",
  entry,
  output: {
    path: path.resolve(__dirname, "ext"),
    filename: "[name].js",
  },
  plugins: [
    new CopyPlugin({
      patterns: [...allAssets.map((from) => ({ from, context: "src" }))],
    }),
  ],
  resolve: { extensions: [".ts", ".tsx", ".js"] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          compilerOptions: {
            // Enables ModuleConcatenation. It must be in here to avoid conflict with ts-node when it runs this file
            module: "es2015",
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
        options: {
          idPrefix: true,
        },
      },
    ],
  },
  devtool: false, // "cheap-module-source-map",
  performance: {
    maxEntrypointSize: 256 * 1024, // 256kb
    maxAssetSize: 512 * 1024, // 512kb
  },
};
module.exports = webpackConfig;
