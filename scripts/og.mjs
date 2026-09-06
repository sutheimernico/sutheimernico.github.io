// Render public/og.svg → public/og.png (1200×630). LinkedIn/X/Slack unfurlers
// do not rasterise SVG, so the PNG is what og:image points at.
// Run: node scripts/og.mjs   (sharp is a devDependency)
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/og.svg', import.meta.url));
await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(new URL('../public/og.png', import.meta.url).pathname);
console.log('wrote public/og.png');
