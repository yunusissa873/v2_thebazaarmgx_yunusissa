# PWA Icon Generation Instructions

## Option 1: Using the Script (Recommended)

1. Install sharp package:
   ```bash
   npm install -D sharp
   ```

2. Run the generation script:
   ```bash
   npm run generate-icons
   ```

## Option 2: Using Online Tools

### Option A: PWA Builder Image Generator
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your `public/favicon.svg`
3. Download generated icons
4. Place `icon-192x192.png` and `icon-512x512.png` in `public/` folder

### Option B: RealFaviconGenerator
1. Visit: https://realfavicongenerator.net/
2. Upload your `public/favicon.svg`
3. Configure PWA settings
4. Download and extract icons to `public/` folder

### Option C: Manual Creation
1. Open `public/favicon.svg` in an image editor (GIMP, Photoshop, Figma, etc.)
2. Export as PNG at 192x192 pixels → save as `public/icon-192x192.png`
3. Export as PNG at 512x512 pixels → save as `public/icon-512x512.png`
4. Ensure background is transparent or matches theme (#141414)

## Icon Requirements

- **Size**: 192x192 and 512x512 pixels
- **Format**: PNG
- **Purpose**: Must support "any maskable" for Android adaptive icons
- **Background**: Should use #141414 (Netflix black) or transparent
- **Foreground**: White logo/icon (as shown in favicon.svg)

## Current Icon Status

✅ Manifest.json configured
✅ Vite.config.ts updated
⏳ Icons need to be generated (use one of the options above)

