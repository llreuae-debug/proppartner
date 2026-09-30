import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function generateBrandAssets() {
  const brandDir = path.join(rootDir, 'public', 'brand');
  if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });

  const srcPath = '/Users/dilnawaz/.gemini/antigravity-ide/brain/a4237929-dc00-4869-aee3-858f2360d76a/.user_uploaded/media_1790792064911.jpg';
  
  if (!fs.existsSync(srcPath)) {
    console.error('Source image not found at', srcPath);
    return;
  }

  // Copy raw image
  fs.copyFileSync(srcPath, path.join(brandDir, 'doccare-logo-original.jpg'));

  // Load raw pixels of original 1024x1024
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  
  // Create flood-filled alpha map from outer borders only
  const visited = new Uint8Array(width * height);
  const queue = [];
  
  // Seed queue with all border pixels
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x);
    queue.push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width + 0);
    queue.push(y * width + (width - 1));
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    if (visited[idx]) continue;
    visited[idx] = 1;
    
    const x = idx % width;
    const y = Math.floor(idx / width);
    const pIdx = idx * 4;
    const r = data[pIdx], g = data[pIdx+1], b = data[pIdx+2];

    // Background white detection
    if (r > 235 && g > 235 && b > 235) {
      if (x > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (x < width - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (y > 0 && !visited[idx - width]) queue.push(idx - width);
      if (y < height - 1 && !visited[idx + width]) queue.push(idx + width);
    }
  }

  // Build transparent buffer preserving the inner white medical document
  const transparentData = Buffer.from(data);
  for (let i = 0; i < width * height; i++) {
    if (visited[i]) {
      const pIdx = i * 4;
      const r = transparentData[pIdx], g = transparentData[pIdx+1], b = transparentData[pIdx+2];
      if (r > 230 && g > 230 && b > 230) {
        const minVal = Math.min(r, g, b);
        if (minVal > 248) {
          transparentData[pIdx + 3] = 0;
        } else {
          const alpha = Math.round(((255 - minVal) / 25) * 255);
          transparentData[pIdx + 3] = Math.max(0, Math.min(255, alpha));
        }
      }
    }
  }

  // 1. Save 1024x1024 transparent full logo
  await sharp(transparentData, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(brandDir, 'doccare-logo-transparent.png'));

  // 2. Save 1024x1024 white background full logo
  await sharp(srcPath)
    .png()
    .toFile(path.join(brandDir, 'doccare-logo.png'));
  await sharp(srcPath)
    .png()
    .toFile(path.join(rootDir, 'public', 'doccare-logo.png'));

  // 3. Extract Icon Only (bounds X: 260-780, Y: 115-645)
  const iconCrop = await sharp(transparentData, { raw: { width, height, channels: 4 } })
    .extract({ left: 260, top: 115, width: 520, height: 535 })
    .trim()
    .png()
    .toBuffer();

  await sharp(iconCrop).toFile(path.join(brandDir, 'doccare-icon-raw.png'));

  // 4. Create App Icon on Clean White Background with Safe Area
  const iconSquareSize = 512;
  const iconPadding = 64;
  const resizedIconForApp = await sharp(iconCrop)
    .resize(iconSquareSize - iconPadding * 2, iconSquareSize - iconPadding * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const whiteAppIcon = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: resizedIconForApp, gravity: 'center' }])
  .png()
  .toBuffer();

  await sharp(whiteAppIcon).toFile(path.join(brandDir, 'doccare-app-icon-512.png'));
  await sharp(whiteAppIcon).toFile(path.join(rootDir, 'public', 'icon-512.png'));
  await sharp(whiteAppIcon).resize(192, 192).toFile(path.join(rootDir, 'public', 'icon-192.png'));
  await sharp(whiteAppIcon).resize(180, 180).toFile(path.join(rootDir, 'public', 'apple-touch-icon.png'));
  await sharp(whiteAppIcon).resize(64, 64).toFile(path.join(rootDir, 'public', 'favicon.png'));
  await sharp(whiteAppIcon).resize(32, 32).toFile(path.join(rootDir, 'public', 'favicon-32x32.png'));
  await sharp(whiteAppIcon).resize(16, 16).toFile(path.join(rootDir, 'public', 'favicon-16x16.png'));
  await sharp(whiteAppIcon).resize(32, 32).toFile(path.join(rootDir, 'public', 'favicon.ico'));

  // 5. Transparent standalone icons at multiple resolutions
  const transparentIcon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: resizedIconForApp, gravity: 'center' }])
  .png()
  .toBuffer();

  await sharp(transparentIcon512).toFile(path.join(brandDir, 'doccare-icon.png'));
  await sharp(transparentIcon512).toFile(path.join(rootDir, 'public', 'doccare-icon.png'));
  await sharp(transparentIcon512).resize(256, 256).toFile(path.join(brandDir, 'doccare-icon-256.png'));
  await sharp(transparentIcon512).resize(128, 128).toFile(path.join(brandDir, 'doccare-icon-128.png'));
  await sharp(transparentIcon512).resize(64, 64).toFile(path.join(brandDir, 'doccare-icon-64.png'));
  await sharp(transparentIcon512).resize(32, 32).toFile(path.join(brandDir, 'doccare-icon-32.png'));

  // 6. Extract Wordmark "DocCare™"
  const wordmarkCrop = await sharp(transparentData, { raw: { width, height, channels: 4 } })
    .extract({ left: 60, top: 660, width: 910, height: 190 })
    .png()
    .toBuffer();
  await sharp(wordmarkCrop).toFile(path.join(brandDir, 'doccare-wordmark.png'));
  await sharp(wordmarkCrop).toFile(path.join(rootDir, 'public', 'doccare-wordmark.png'));

  // 7. Extract Tagline
  const taglineCrop = await sharp(transparentData, { raw: { width, height, channels: 4 } })
    .extract({ left: 60, top: 865, width: 910, height: 55 })
    .png()
    .toBuffer();
  await sharp(taglineCrop).toFile(path.join(brandDir, 'doccare-tagline.png'));
  await sharp(taglineCrop).toFile(path.join(rootDir, 'public', 'doccare-tagline.png'));

  // 8. Create Horizontal Logo with tagline
  const hIcon = await sharp(iconCrop).resize({ height: 110 }).toBuffer();
  const hWordmark = await sharp(wordmarkCrop).resize({ height: 60 }).toBuffer();
  const hTagline = await sharp(taglineCrop).resize({ height: 16 }).toBuffer();

  const hIconMeta = await sharp(hIcon).metadata();
  const hWordMeta = await sharp(hWordmark).metadata();
  const hTagMeta = await sharp(hTagline).metadata();

  const textBlockWidth = Math.max(hWordMeta.width, hTagMeta.width);
  const totalHWidth = hIconMeta.width + 18 + textBlockWidth + 16;
  const totalHHeight = 120;

  const horizontalFull = await sharp({
    create: {
      width: totalHWidth,
      height: totalHHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: hIcon, left: 8, top: Math.round((totalHHeight - hIconMeta.height) / 2) },
    { input: hWordmark, left: hIconMeta.width + 18, top: 16 },
    { input: hTagline, left: hIconMeta.width + 20, top: 16 + hWordMeta.height + 8 }
  ])
  .png()
  .toBuffer();

  await sharp(horizontalFull).toFile(path.join(brandDir, 'doccare-logo-horizontal.png'));
  await sharp(horizontalFull).toFile(path.join(rootDir, 'public', 'doccare-logo-horizontal.png'));

  // 9. Create Compact Horizontal Logo (Icon + Wordmark)
  const compactHHeight = 80;
  const compactHIcon = await sharp(iconCrop).resize({ height: 64 }).toBuffer();
  const compactHWord = await sharp(wordmarkCrop).resize({ height: 42 }).toBuffer();
  const cIconMeta = await sharp(compactHIcon).metadata();
  const cWordMeta = await sharp(compactHWord).metadata();
  const compactTotalWidth = cIconMeta.width + 14 + cWordMeta.width + 16;

  const horizontalCompact = await sharp({
    create: {
      width: compactTotalWidth,
      height: compactHHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: compactHIcon, left: 6, top: Math.round((compactHHeight - cIconMeta.height) / 2) },
    { input: compactHWord, left: cIconMeta.width + 14, top: Math.round((compactHHeight - cWordMeta.height) / 2) }
  ])
  .png()
  .toBuffer();

  await sharp(horizontalCompact).toFile(path.join(brandDir, 'doccare-logo-horizontal-compact.png'));
  await sharp(horizontalCompact).toFile(path.join(rootDir, 'public', 'doccare-logo-horizontal-compact.png'));

  // 10. Generate Watermark (DocCare medical icon with 4% opacity)
  const watermarkBase = await sharp(iconCrop)
    .resize(600, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  
  const { data: wmRaw, info: wmInfo } = await sharp(watermarkBase).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < wmInfo.width * wmInfo.height; i++) {
    const aIdx = i * 4 + 3;
    wmRaw[aIdx] = Math.round(wmRaw[aIdx] * 0.045);
  }
  await sharp(wmRaw, { raw: { width: wmInfo.width, height: wmInfo.height, channels: 4 } })
    .png()
    .toFile(path.join(brandDir, 'doccare-watermark.png'));
  await sharp(wmRaw, { raw: { width: wmInfo.width, height: wmInfo.height, channels: 4 } })
    .png()
    .toFile(path.join(rootDir, 'public', 'doccare-watermark.png'));

  console.log('Successfully generated all DocCare brand assets!');
}

generateBrandAssets().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
