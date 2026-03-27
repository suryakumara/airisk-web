// === [ Import Dependencies ] ===
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const FormData = require("form-data");
const authRoutes = require("./src/routes/auth.routes");
const botRoutes = require("./src/routes/bot.routes");
const { startPolling } = require("./src/services/poller.service");

// === [ App Initialization ] ===
const app = express();
const upload = multer({ dest: "uploads/" });

// === [ Middleware ] ===
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === [ Auth Routes ] ===
app.use("/api/auth", authRoutes);

// === [ Bot Routes ] ===
app.use("/api/bots", botRoutes);

// === [ Ensure Required Folders Exist ] ===
["uploads", "outputs", "template"].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d);
});

// === [ Static Directories ] ===
app.use("/outputs", express.static("outputs"));
app.use("/template", express.static("template"));

// === [ Template Paths ] ===
const TEMPLATE_TKOM_PATH = "./template/template_tkom.png";
const TEMPLATE_AIRISK_PATH = "./template/template_airisk.png";

// === [ Utility: Wrapped Text Drawing ] ===
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

// === [ Reusable Overlay Generator ] ===
async function generateOverlay(templatePath, imagePath, { title, subtitle1, subtitle2 }) {
  const outputPath = `./outputs/result_${Date.now()}.png`;

  const width = 1080;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw main uploaded image
  const berita = await loadImage(imagePath);
  ctx.drawImage(berita, 0, 0, width, height);

  // Draw overlay template
  const template = await loadImage(templatePath);
  ctx.drawImage(template, 0, 0, width, height);

  // Text styling
  const marginLeft = 15;
  const maxWidth = 900;
  const marginBottom = 80;

  // Calculate heights for spacing
  ctx.font = "32px Arial";
  const h2 = drawWrappedText(ctx, subtitle2, marginLeft, 0, maxWidth, 40, false);

  ctx.font = "bold 48px Arial";
  const h1 = drawWrappedText(ctx, subtitle1, marginLeft, 0, maxWidth, 50, false);

  ctx.font = "bold 64px Arial Black";
  const ht = drawWrappedText(ctx, title, marginLeft, 0, maxWidth, 70, false);

  const startY = height - marginBottom - h2 - h1 - ht;
  let y = startY;

  // === Draw Text ===
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

// === [ Helper: Respond with JSON ] ===
function respondWithJson(res, outputPath, imagePath) {
  const fileUrl = `${res.req.protocol}://${res.req.get("host")}/outputs/${path.basename(
    outputPath
  )}`;
  const filename = path.basename(outputPath);

  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

  res.json({
    success: true,
    message: "✅ Image generated successfully",
    file: {
      url: fileUrl,
      path: outputPath,
      filename,
    },
  });
}

// === [ ROUTE: TKOM Template Overlay ] ===
app.post("/api/overlay/tkom", upload.single("image"), async (req, res) => {
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

// === [ ROUTE: AIRISK Template Overlay ] ===
app.post("/api/overlay/airisk", upload.single("image"), async (req, res) => {
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

// === [ Telegram Proxy Routes ] ===
app.all("/tg/bot:token/:method", async (req, res) => {
  const { token, method } = req.params;
  const url = `https://api.telegram.org/bot${token}/${method}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      params: req.query,
      data: req.body,
    });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { ok: false, description: err.message });
  }
});

// === [ Telegram Media Proxy ] ===
// Forwards multipart files (photo / video / document / voice) to Telegram
const MEDIA_METHOD = {
  photo: "sendPhoto",
  video: "sendVideo",
  document: "sendDocument",
  voice: "sendVoice",
};

app.post("/tg/send-media", upload.single("file"), async (req, res) => {
  const { token, chat_id, type, caption } = req.body;
  const method = MEDIA_METHOD[type];

  if (!method)
    return res.status(400).json({ ok: false, description: "Invalid media type." });
  if (!req.file)
    return res.status(400).json({ ok: false, description: "No file uploaded." });

  const form = new FormData();
  form.append("chat_id", chat_id);
  if (caption) form.append("caption", caption);
  form.append(type, fs.createReadStream(req.file.path), {
    filename: req.file.originalname || `file`,
    contentType: req.file.mimetype,
  });

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/${method}`,
      form,
      { headers: form.getHeaders() }
    );
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { ok: false, description: err.message });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

// === [ Default Health Check ] ===
app.get("/api", (_req, res) => {
  res.json({ success: true, message: "✅ Airisk API is running!" });
});

// === [ Start Server ] ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Airisk Overlay API ready → http://localhost:${PORT}`);
  startPolling();
});
