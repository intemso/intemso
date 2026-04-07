/**
 * Generate placeholder app icons for Expo build.
 * Run: node scripts/generate-icons.js
 *
 * Requires: npm install sharp (dev dependency)
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 blue PNG (smallest valid PNG)
// In production, replace assets/icon.png, adaptive-icon.png, splash.png with real artwork

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// Minimal valid PNG (1x1 pixel, blue #0C4DA2)
const createMinimalPng = (r, g, b) => {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (1x1, 8-bit RGB)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0); // width
  ihdrData.writeUInt32BE(1, 4); // height
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (zlib compressed: filter byte 0 + RGB)
  const { deflateSync } = require('zlib');
  const rawData = Buffer.from([0, r, g, b]); // filter=0, then RGB
  const compressed = deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
};

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);

  // CRC32
  let crc = 0xffffffff;
  for (let i = 0; i < crcData.length; i++) {
    crc ^= crcData[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  crc ^= 0xffffffff;
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Generate placeholder icons (blue #0C4DA2 = 12, 77, 162)
const bluePng = createMinimalPng(12, 77, 162);

fs.writeFileSync(path.join(assetsDir, 'icon.png'), bluePng);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), bluePng);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), bluePng);

console.log('Generated placeholder icons in assets/');
console.log('Replace with real artwork before production build.');
