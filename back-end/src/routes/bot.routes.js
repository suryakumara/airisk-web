const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(authMiddleware);

const MEDIA_METHOD = {
  photo: "sendPhoto",
  video: "sendVideo",
  document: "sendDocument",
  voice: "sendVoice",
};

// ── GET /api/bots ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const bots = await prisma.bot.findMany({
      where: { userId: req.user.id },
      orderBy: { botOrder: "asc" },
      select: {
        id: true, name: true, token: true, username: true,
        description: true, chatId: true, botOrder: true, createdAt: true,
      },
    });
    res.json({ success: true, bots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bots ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { token, name, description } = req.body;
  if (!token || !name)
    return res.status(400).json({ success: false, message: "Token and name are required." });

  try {
    // Verify token with Telegram
    const tgRes = await axios.get(`https://api.telegram.org/bot${token}/getMe`, { timeout: 5000 });
    if (!tgRes.data.ok)
      return res.status(400).json({ success: false, message: "Invalid bot token." });

    const username = tgRes.data.result.username;
    const count = await prisma.bot.count({ where: { userId: req.user.id } });

    const bot = await prisma.bot.create({
      data: { userId: req.user.id, token, name, username, description: description ?? null, botOrder: count },
      select: { id: true, name: true, token: true, username: true, description: true, chatId: true, botOrder: true, createdAt: true },
    });
    res.status(201).json({ success: true, bot });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ success: false, message: "This bot token is already added." });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/bots/:id ─────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { name, description, chatId } = req.body;
  try {
    const bot = await prisma.bot.update({
      where: { id: Number(req.params.id), userId: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(chatId !== undefined && { chatId: chatId || null }),
      },
      select: { id: true, name: true, token: true, username: true, description: true, chatId: true, botOrder: true, createdAt: true },
    });
    res.json({ success: true, bot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/bots/:id ──────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await prisma.bot.delete({ where: { id: Number(req.params.id), userId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/bots/reorder ─────────────────────────────────────────────────────
router.put("/reorder/batch", async (req, res) => {
  const { order } = req.body; // [{ id, botOrder }]
  try {
    await prisma.$transaction(
      order.map(({ id, botOrder }) =>
        prisma.bot.update({ where: { id, userId: req.user.id }, data: { botOrder } })
      )
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/bots/:id/messages ────────────────────────────────────────────────
router.get("/:id/messages", async (req, res) => {
  const since = req.query.since ? new Date(req.query.since) : undefined;
  try {
    const messages = await prisma.message.findMany({
      where: {
        botId: Number(req.params.id),
        bot: { userId: req.user.id },
        ...(since ? { timestamp: { gt: since } } : {}),
      },
      orderBy: { timestamp: "asc" },
      take: since ? 200 : 100,
    });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bots/:id/send ───────────────────────────────────────────────────
router.post("/:id/send", async (req, res) => {
  const { text, chatId: overrideChatId } = req.body;
  if (!text?.trim())
    return res.status(400).json({ success: false, message: "Text is required." });

  try {
    const bot = await prisma.bot.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!bot) return res.status(404).json({ success: false, message: "Bot not found." });

    const targetChatId = overrideChatId || bot.chatId;
    if (!targetChatId)
      return res.status(400).json({ success: false, message: "Chat ID not set. Edit the bot to add one." });

    const tgRes = await axios.post(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
      chat_id: targetChatId,
      text: text.trim(),
    });
    if (!tgRes.data.ok)
      return res.status(400).json({ success: false, message: tgRes.data.description });

    const message = await prisma.message.create({
      data: { botId: bot.id, direction: "out", text: text.trim(), chatIdFrom: targetChatId, timestamp: new Date() },
    });
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bots/:id/send-media ─────────────────────────────────────────────
router.post("/:id/send-media", upload.single("file"), async (req, res) => {
  const { type, caption, chatId: overrideChatId } = req.body;
  const method = MEDIA_METHOD[type];
  if (!method) return res.status(400).json({ success: false, message: "Invalid media type." });
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

  try {
    const bot = await prisma.bot.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!bot) return res.status(404).json({ success: false, message: "Bot not found." });

    const targetChatId = overrideChatId || bot.chatId;
    if (!targetChatId)
      return res.status(400).json({ success: false, message: "Chat ID not set." });

    const form = new FormData();
    form.append("chat_id", targetChatId);
    if (caption) form.append("caption", caption);
    form.append(type, fs.createReadStream(req.file.path), {
      filename: req.file.originalname || "file",
      contentType: req.file.mimetype,
    });

    const tgRes = await axios.post(
      `https://api.telegram.org/bot${bot.token}/${method}`,
      form,
      { headers: form.getHeaders() }
    );
    if (!tgRes.data.ok)
      return res.status(400).json({ success: false, message: tgRes.data.description });

    const message = await prisma.message.create({
      data: {
        botId: bot.id,
        direction: "out",
        mediaType: type,
        fileName: req.file.originalname || null,
        text: caption || null,
        chatIdFrom: targetChatId,
        timestamp: new Date(),
      },
    });
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
