import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const appDir = path.join(__dirname, '..', 'src', 'app')

// Icon-only SVG (shield + cross mark) — works at all small sizes
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" fill="none">
  <rect x="2" y="4" width="24" height="32" rx="4" fill="#0f2040"/>
  <rect x="8" y="2" width="24" height="32" rx="4" fill="#1a3460" opacity="0.7"/>
  <rect x="11" y="13" width="6" height="14" rx="1" fill="white"/>
  <rect x="7" y="17" width="14" height="6" rx="1" fill="white"/>
</svg>`

const iconBuffer = Buffer.from(iconSvg)

async function generatePng(size, outputPath) {
  await sharp(iconBuffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outputPath)
  console.log(`Generated: ${outputPath}`)
}

// Generate all sizes
await generatePng(16,  path.join(publicDir, 'favicon-16x16.png'))
await generatePng(32,  path.join(publicDir, 'favicon-32x32.png'))
await generatePng(48,  path.join(publicDir, 'favicon-48x48.png'))
await generatePng(180, path.join(publicDir, 'apple-touch-icon.png'))
await generatePng(192, path.join(publicDir, 'icon-192.png'))
await generatePng(512, path.join(publicDir, 'icon-512.png'))

// Next.js App Router: place icon.png and apple-icon.png in src/app/
await generatePng(32,  path.join(appDir, 'icon.png'))
await generatePng(180, path.join(appDir, 'apple-icon.png'))

// Build a proper multi-size .ico from 16, 32, 48 px PNGs
// ICO format: header + directory + image data
async function buildIco(sizes) {
  const images = await Promise.all(
    sizes.map(async (size) => {
      const buf = await sharp(iconBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
      return { size, buf }
    })
  )

  const count = images.length
  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)     // reserved
  header.writeUInt16LE(1, 2)     // type: 1 = ICO
  header.writeUInt16LE(count, 4) // count

  // Directory entries: 16 bytes each
  const dirSize = count * 16
  const dataOffset = 6 + dirSize

  const dirEntries = []
  let offset = dataOffset
  for (const { size, buf } of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size === 256 ? 0 : size, 0)  // width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1)  // height
    entry.writeUInt8(0, 2)                         // color count
    entry.writeUInt8(0, 3)                         // reserved
    entry.writeUInt16LE(1, 4)                      // color planes
    entry.writeUInt16LE(32, 6)                     // bits per pixel
    entry.writeUInt32LE(buf.length, 8)             // size of image data
    entry.writeUInt32LE(offset, 12)                // offset
    offset += buf.length
    dirEntries.push(entry)
  }

  const parts = [header, ...dirEntries, ...images.map(i => i.buf)]
  return Buffer.concat(parts)
}

const icoBuf = await buildIco([16, 32, 48])

// Write favicon.ico to both public/ and src/app/
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf)
fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuf)
console.log(`Generated: ${path.join(publicDir, 'favicon.ico')}`)
console.log(`Generated: ${path.join(appDir, 'favicon.ico')}`)

// Write icon SVG to public for modern browsers that accept SVG favicons
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg)
console.log(`Generated: ${path.join(publicDir, 'icon.svg')}`)

console.log('\nDone! All favicon assets generated.')
