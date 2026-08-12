/**
 * generate-icons.ts
 *
 * Generates PWA icons and favicon from icons/icon.svg.
 *
 *   npm run icons
 *
 * Outputs:
 *   public/icons/icon-192.png             — Android home screen icon
 *   public/icons/icon-512.png             — Splash screen / high-res icon
 *   public/icons/apple-touch-icon.png     — iOS home screen icon (180×180)
 *   public/favicon.ico                    — Browser tab icon
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const dirName = dirname(fileURLToPath(import.meta.url));
const root = resolve(dirName, "..");

const svgPath = resolve(root, "public/icons/icon.svg");
const svgBuffer = readFileSync(svgPath);

mkdirSync(resolve(root, "public/icons"), { recursive: true });

const pngSizes: Array<{ name: string; size: number }> = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of pngSizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(root, "public/icons", name));
  console.log(`✓ public/icons/${name}`);
}

const faviconPng = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
const icoBuffer = await pngToIco([faviconPng]);
writeFileSync(resolve(root, "public/favicon.ico"), icoBuffer);
console.log("✓ public/favicon.ico");

console.log("\nAll icons generated successfully.");

/** Branded placeholder screenshots for the Web App Manifest `screenshots` member. */
async function writeScreenshot(width: number, height: number, file: string): Promise<void> {
  const iconSize = Math.round(Math.min(width, height) * 0.4);
  const icon = await sharp(svg, { density }).resize(iconSize, iconSize).png().toBuffer();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: THEME_BG,
    },
  })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toFile(resolve(publicDir, file));
}

mkdirSync(resolve(publicDir, "screenshots"), { recursive: true });
await writeScreenshot(1280, 720, "screenshots/wide.png");
await writeScreenshot(720, 1280, "screenshots/narrow.png");
