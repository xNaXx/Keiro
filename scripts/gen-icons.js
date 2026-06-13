/* Generates the app icon, favicon and Android adaptive foreground from the
 * four-pointed star that dots the "i" in the Keiro wordmark. Run with:
 *   node scripts/gen-icons.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets');

// The star subpath lifted straight from the wordmark SVG.
const STAR = 'M230.42,20.65v-2.34c8.22,0,17.26-2.93,17.26-18.31h2.34c0,15.37,7.87,18.31,16.08,18.31v2.35c-8.22,0-16.08,2.93-16.08,18.31h-2.34c0-15.38-9.03-18.32-17.26-18.32Z';
// Its bounding-box centre in the original viewBox.
const CX = 248.26;
const CY = 19.48;

const CANVAS = 1024;
const C = CANVAS / 2;

/** transform that scales the star and recentres it on the canvas */
function tf(scale) {
  return `translate(${C - scale * CX} ${C - scale * CY}) scale(${scale})`;
}

/** full-bleed icon: brand gradient + luminous star */
function iconSvg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241546"/>
      <stop offset="0.55" stop-color="#5b3fb0"/>
      <stop offset="1" stop-color="#e89ab8"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.46" r="0.5">
      <stop offset="0" stop-color="#fff6ea" stop-opacity="0.55"/>
      <stop offset="0.45" stop-color="#fff6ea" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#fff6ea" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${CANVAS}" height="${CANVAS}" fill="url(#bg)"/>
  <rect width="${CANVAS}" height="${CANVAS}" fill="url(#halo)"/>
  <g transform="${tf(scale)}"><path d="${STAR}" fill="#fff6ea"/></g>
</svg>`;
}

/** transparent foreground for the Android adaptive icon (star only) */
function foregroundSvg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <g transform="${tf(scale)}"><path d="${STAR}" fill="#fff6ea"/></g>
</svg>`;
}

/** gradient background for the Android adaptive icon (no star) */
function backgroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241546"/>
      <stop offset="0.55" stop-color="#5b3fb0"/>
      <stop offset="1" stop-color="#e89ab8"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff6ea" stop-opacity="0.5"/>
      <stop offset="0.45" stop-color="#fff6ea" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#fff6ea" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${CANVAS}" height="${CANVAS}" fill="url(#bg)"/>
  <rect width="${CANVAS}" height="${CANVAS}" fill="url(#halo)"/>
</svg>`;
}

/** single-colour silhouette for Android themed (monochrome) icons */
function monochromeSvg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <g transform="${tf(scale)}"><path d="${STAR}" fill="#ffffff"/></g>
</svg>`;
}

async function render(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, file));
  console.log('wrote', file, `${size}x${size}`);
}

(async () => {
  // star fills ~46% of the icon — meditative breathing room
  await render(iconSvg(12), 1024, 'icon.png');
  await render(iconSvg(12), 256, 'favicon.png');
  // adaptive foreground: smaller so it sits inside the safe zone (~36%)
  await render(foregroundSvg(9.5), 1024, 'android-icon-foreground.png');
  await render(backgroundSvg(), 1024, 'android-icon-background.png');
  await render(monochromeSvg(9.5), 1024, 'android-icon-monochrome.png');
})();
