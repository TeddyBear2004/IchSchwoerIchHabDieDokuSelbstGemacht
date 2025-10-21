import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
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
      const jsFiles = files.filter(file => file.endsWith('.js'));
      const war = {
        resources: jsFiles.map(f => `assets/${f}`),
        matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
      };
      manifest.replace("\"__WEB_ACCESSIBLE_RESOURCES__\"", JSON.stringify([war]));
      const manifestObj = JSON.parse(manifest);
      manifestObj.web_accessible_resources = [war];
      fs.writeFileSync(resolve(options.dir, 'manifest.json'), JSON.stringify(manifestObj, null, 2));
    }
  };
}

export default defineConfig({
    plugins: [react(), replaceManifest()],
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
