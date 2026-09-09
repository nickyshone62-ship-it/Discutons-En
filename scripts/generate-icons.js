const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function generateIcons() {
  const svgPath = path.join(__dirname, "../public/icons/icon.svg");
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { size: 192, dest: "../public/icons/icon-192x192.png" },
    { size: 512, dest: "../public/icons/icon-512x512.png" },
    { size: 192, dest: "../public/icons/icon-maskable-192x192.png" },
    { size: 512, dest: "../public/icons/icon-maskable-512x512.png" },
    { size: 180, dest: "../public/icons/apple-touch-icon.png" },
    { size: 180, dest: "../public/apple-touch-icon.png" },
    { size: 32, dest: "../public/icons/favicon-32x32.png" },
    { size: 32, dest: "../public/favicon.ico" },
  ];

  for (const target of targets) {
    const outPath = path.join(__dirname, target.dest);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(outPath);
    console.log(`✓ Generated ${target.dest} (${target.size}x${target.size})`);
  }
  console.log("All mobile PWA PNG icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Icon generation error:", err);
  process.exit(1);
});
