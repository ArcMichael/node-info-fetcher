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

console.log("Build completed successfully!");
