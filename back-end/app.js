const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const upload = multer({ dest: "uploads/" });

// Template paths
const TEMPLATE_TKOM_PATH = "./template/template_tkom.png";
const TEMPLATE_AIRISK_PATH = "./template/template_airisk.png";

// === Ensure folders exist ===
["uploads", "outputs"].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d);
});

// === Serve outputs statically ===
app.use("/outputs", express.static("outputs"));

// === Utility: wrapped text drawing ===
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, draw = true) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (draw) ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (draw) ctx.fillText(line.trim(), x, y);
  lineCount++;
  return lineCount * lineHeight;
}

// === Reusable overlay generator ===
async function generateOverlay(templatePath, imagePath, { title, subtitle1, subtitle2 }) {
  const outputPath = `./outputs/result_${Date.now()}.png`;

  const width = 1080;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw main image
  const berita = await loadImage(imagePath);
  ctx.drawImage(berita, 0, 0, width, height);

  // Draw overlay template
  const template = await loadImage(templatePath);
  ctx.drawImage(template, 0, 0, width, height);

  // Text positioning
  const marginLeft = 15;
  const maxWidth = 900;
  const marginBottom = 80;

  // Measure text blocks (for dynamic spacing)
  ctx.font = "32px Arial";
  const h2 = drawWrappedText(ctx, subtitle2, marginLeft, 0, maxWidth, 40, false);

  ctx.font = "bold 48px Arial";
  const h1 = drawWrappedText(ctx, subtitle1, marginLeft, 0, maxWidth, 50, false);

  ctx.font = "bold 64px Arial Black";
  const ht = drawWrappedText(ctx, title, marginLeft, 0, maxWidth, 70, false);

  const startY = height - marginBottom - h2 - h1 - ht;
  let y = startY;

  // === Draw text blocks ===
  ctx.fillStyle = "#F6C90E";
  ctx.font = "bold 64px Arial Black";
  y += drawWrappedText(ctx, title.toUpperCase(), marginLeft, y, maxWidth, 70);

  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  y += drawWrappedText(ctx, subtitle1.toUpperCase(), marginLeft, y, maxWidth, 50);

  ctx.font = "32px Arial";
  y += drawWrappedText(ctx, subtitle2, marginLeft, y, maxWidth, 40);

  // === Save the result ===
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

// === Helper for consistent JSON response ===
function respondWithJson(res, outputPath, imagePath) {
  const fileUrl = `${res.req.protocol}://${res.req.get("host")}/outputs/${path.basename(
    outputPath
  )}`;
  const filename = path.basename(outputPath);

  // Delete uploaded original image
  fs.unlinkSync(imagePath);

  res.json({
    success: true,
    message: "✅ Image generated successfully",
    file: {
      url: fileUrl,
      path: outputPath,
      filename: filename,
    },
  });
}

// === ROUTE: TKOM ===
app.post("/overlay/tkom", upload.single("image"), async (req, res) => {
  try {
    const { title = "Breaking News", subtitle1 = "", subtitle2 = "" } = req.body;

    const outputPath = await generateOverlay(TEMPLATE_TKOM_PATH, req.file.path, {
      title,
      subtitle1,
      subtitle2,
    });

    respondWithJson(res, outputPath, req.file.path);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === ROUTE: AIRISK ===
app.post("/overlay/airisk", upload.single("image"), async (req, res) => {
  try {
    const { title = "Breaking News", subtitle1 = "", subtitle2 = "" } = req.body;

    const outputPath = await generateOverlay(TEMPLATE_AIRISK_PATH, req.file.path, {
      title,
      subtitle1,
      subtitle2,
    });

    respondWithJson(res, outputPath, req.file.path);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Start server ===
app.listen(3000, () => {
  console.log("✅ Overlay API ready for n8n integration → http://localhost:3000");
});
