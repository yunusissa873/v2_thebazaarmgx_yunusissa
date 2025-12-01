/**
 * Generate PWA Icons with Text Logo
 * 
 * Creates PWA icons (192x192 and 512x512) with "The Bazaar" text logo
 * Layout: "The" (top row, center) - "Bazaar" (bottom row)
 * 
 * Requirements: Install sharp package: npm install -D sharp
 * 
 * Usage: node scripts/generate-pwa-icons.js
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// Create SVG with text logo
function createLogoSVG(size = 512) {
  const padding = size * 0.15; // 15% padding
  const textAreaHeight = size - (padding * 2);
  const topRowHeight = textAreaHeight * 0.4; // 40% for "The"
  const bottomRowHeight = textAreaHeight * 0.6; // 60% for "Bazaar"
  
  // Font sizes - proportional to icon size
  const theFontSize = size * 0.18; // "The" font size
  const bazaarFontSize = size * 0.28; // "Bazaar" font size (larger)
  
  const centerX = size / 2;
  const topRowY = padding + (topRowHeight / 2) + (theFontSize * 0.35); // Vertically center "The"
  const bottomRowY = padding + topRowHeight + (bottomRowHeight / 2) + (bazaarFontSize * 0.35); // Vertically center "Bazaar"

  // Netflix red to orange gradient
  const gradientId = 'logoGradient';
  
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#141414"/>
  
  <!-- Gradient Definition -->
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#E50914;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- "The" Text (Top Row, Center) -->
  <text
    x="${centerX}"
    y="${topRowY}"
    font-family="Arial, sans-serif"
    font-size="${theFontSize}"
    font-weight="bold"
    fill="url(#${gradientId})"
    text-anchor="middle"
    dominant-baseline="middle"
  >The</text>
  
  <!-- "Bazaar" Text (Bottom Row) -->
  <text
    x="${centerX}"
    y="${bottomRowY}"
    font-family="Arial, sans-serif"
    font-size="${bazaarFontSize}"
    font-weight="bold"
    fill="url(#${gradientId})"
    text-anchor="middle"
    dominant-baseline="middle"
  >Bazaar</text>
</svg>`;
}

async function generatePWAIcons() {
  try {
    console.log('🎨 Generating PWA icons with text logo...\n');

    // Generate 192x192 icon
    console.log('📐 Creating 192x192 icon...');
    const svg192 = createLogoSVG(192);
    const icon192 = await sharp(Buffer.from(svg192))
      .resize(192, 192)
      .png()
      .toBuffer();

    writeFileSync(join(publicDir, 'icon-192x192.png'), icon192);
    console.log('✅ Generated icon-192x192.png');

    // Generate 512x512 icon
    console.log('📐 Creating 512x512 icon...');
    const svg512 = createLogoSVG(512);
    const icon512 = await sharp(Buffer.from(svg512))
      .resize(512, 512)
      .png()
      .toBuffer();

    writeFileSync(join(publicDir, 'icon-512x512.png'), icon512);
    console.log('✅ Generated icon-512x512.png');

    console.log('\n✨ PWA icons generated successfully!');
    console.log('📁 Icons saved to:');
    console.log('   - public/icon-192x192.png');
    console.log('   - public/icon-512x512.png');
    console.log('\n💡 Icon design:');
    console.log('   - "The" (top row, center positioned)');
    console.log('   - "Bazaar" (bottom row)');
    console.log('   - Netflix red to orange gradient');
    console.log('   - Dark background (#141414)');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('\n❌ Error: sharp package not found');
      console.log('\n📦 Please install sharp first:');
      console.log('   npm install -D sharp\n');
      console.log('Then run this script again.');
    } else {
      console.error('❌ Error generating icons:', error.message);
      console.error(error.stack);
    }
    process.exit(1);
  }
}

generatePWAIcons();

