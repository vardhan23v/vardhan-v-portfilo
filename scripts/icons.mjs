// Renders public/favicon.svg to the PNG icons the web manifest and iOS home screen need.
// Run once (node scripts/icons.mjs) and commit the output; it is not part of `npm run build`.
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("public/favicon.svg");
const BG = "#05060f";
mkdirSync("public/icons", { recursive: true });

const targets = [
  { size: 192, file: "public/icons/icon-192.png" },
  { size: 512, file: "public/icons/icon-512.png" },
  // iOS rounds the corners itself; keep a little breathing room around the mark.
  { size: 180, file: "public/apple-touch-icon.png", pad: 14 },
];

for (const { size, file, pad = 0 } of targets) {
  const inner = size - pad * 2;
  const mark = await sharp(svg).resize(inner, inner).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(file);
  console.log(`icons: ${file} (${size}×${size})`);
}
