const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// 编译 TypeScript 文件
esbuild.buildSync({
  entryPoints: ["src/content.ts", "src/background.ts"],
  outdir: "dist",
  bundle: true, // 打包依赖
  minify: true, // 压缩输出
  target: "esnext", // 目标 JS 版本
  platform: "browser", // 目标环境为浏览器
});

// 复制 manifest.json 到 dist 目录
const manifestSrc = path.join(__dirname, "manifest.json");
const manifestDest = path.join(__dirname, "dist", "manifest.json");
fs.copyFileSync(manifestSrc, manifestDest, fs.constants.COPYFILE_FREPLACE);

// 复制 popup.html 到 dist 目录
const popupHtmlSrc = path.join(__dirname, "src", "popup.html");
const popupHtmlDest = path.join(__dirname, "dist", "popup.html");
fs.copyFileSync(popupHtmlSrc, popupHtmlDest, fs.constants.COPYFILE_FREPLACE);

// 复制 popup.js 到 dist 目录
const popupJsSrc = path.join(__dirname, "src", "popup.js");
const popupJsDest = path.join(__dirname, "dist", "popup.js");
fs.copyFileSync(popupJsSrc, popupJsDest, fs.constants.COPYFILE_FREPLACE);

// 复制 icon.png 到 dist 目录
const iconSrc = path.join(__dirname, "src", "icon.png");
const iconDest = path.join(__dirname, "dist", "icon.png");
fs.copyFileSync(iconSrc, iconDest, fs.constants.COPYFILE_FREPLACE);

console.log("Build completed successfully!");
