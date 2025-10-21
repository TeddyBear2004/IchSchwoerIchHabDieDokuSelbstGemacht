import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, join, relative } from "path";
import fs from "fs";

function replaceManifest() {
  return {
    name: 'replace-manifest',
    enforce: 'post',
    writeBundle(options) {
      const manifestPath = resolve(__dirname, 'public/manifest.json');
      let manifest = fs.readFileSync(manifestPath, 'utf-8');
      const assetsDir = resolve(options.dir, 'assets');
      const files = fs.readdirSync(assetsDir);
      const backgroundFile = files.find(file => file.startsWith('background-'));
      const contentScriptFile = files.find(file => file.startsWith('contentScript-'));
      manifest = manifest.replace('__BACKGROUND_SCRIPT__', `assets/${backgroundFile}`);
      manifest = manifest.replace('__CONTENT_SCRIPT__', `assets/${contentScriptFile}`);
      const publicDir = resolve(__dirname, 'public');
      const publicFiles = getAllFiles(publicDir, ['manifest.json', 'background.js']);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      const war = {
        resources: [...publicFiles, ...jsFiles.map(f => `assets/${f}`)],
        matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
      };
      manifest.replace("\"__WEB_ACCESSIBLE_RESOURCES__\"", JSON.stringify([war]));
      const manifestObj = JSON.parse(manifest);
      manifestObj.web_accessible_resources = [war];
      fs.writeFileSync(resolve(options.dir, 'manifest.json'), JSON.stringify(manifestObj, null, 2));
    }
  };
}

function getAllFiles(dir, exclude = []) {
  const files = [];
  function walk(dirPath) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relPath = relative(dir, fullPath).replace(/\\/g, '/');
      if (exclude.includes(relPath)) continue;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(relPath);
      }
    }
  }
  walk(dir);
  return files;
}

export default defineConfig({
    plugins: [react(), tailwindcss(), replaceManifest()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    root: ".", // wichtig – Projektroot
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                background: resolve(__dirname, "public/background.js"),
                contentScript: resolve(__dirname, "src/content/contentScript.js")
            }
        }
    }
});
