const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth.middleware");
const gramjs = require("../lib/gramjs.manager");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "airisk_secret_change_me";

// ── GET /api/tg/media/:username/:messageId  (no authMiddleware — uses query token for <img>/<video> src) ──
router.get("/media/:username/:messageId", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).end();

  let userId;
  try {
    userId = jwt.verify(token, JWT_SECRET).id;
  } catch {
    return res.status(401).end();
  }

  const account = await prisma.telegramAccount.findUnique({ where: { userId } });
  if (!account) return res.status(401).end();

  const client = await gramjs.getClient(userId, account.sessionStr);
  if (!client) return res.status(401).end();

  try {
    const { username, messageId } = req.params;
    const messages = await client.getMessages(username, { ids: [Number(messageId)] });
    const message = messages[0];
    if (!message?.media) return res.status(404).end();

    const data = await client.downloadMedia(message, {});
    if (!data) return res.status(404).end();

    const buffer = Buffer.from(data);

    let contentType = "application/octet-stream";
    if (message.photo) contentType = "image/jpeg";
    else if (message.video) contentType = "video/mp4";
    else if (message.voice) contentType = "audio/ogg";
    else if (message.audio) contentType = "audio/mpeg";
    else if (message.document) contentType = message.document.mimeType || "application/octet-stream";

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  } catch (err) {
    console.error("Media download error:", err.message);
    res.status(500).end();
  }
});

router.use(authMiddleware);

// Helper: resolve client or respond 401
async function resolveClient(req, res) {
  const account = await prisma.telegramAccount.findUnique({
    where: { userId: req.user.id },
  });
  if (!account) {
    res.status(401).json({ success: false, message: "Telegram account not connected." });
    return null;
  }
  const client = await gramjs.getClient(req.user.id, account.sessionStr);
  if (!client) {
    res.status(401).json({ success: false, message: "Telegram session expired. Please reconnect." });
    return null;
  }
  return { client, account };
}

// ── POST /api/tg/connect  (send OTP) ────────────────────────────────────────
router.post("/connect", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number required." });
  try {
    const { pendingToken } = await gramjs.sendCode(phone.trim());
    res.json({ success: true, pendingToken });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── POST /api/tg/verify  (submit OTP) ────────────────────────────────────────
router.post("/verify", async (req, res) => {
  const { pendingToken, code } = req.body;
  if (!pendingToken || !code)
    return res.status(400).json({ success: false, message: "pendingToken and code required." });
  try {
    const result = await gramjs.verifyCode(req.user.id, pendingToken, code.trim());

    if (result.needs2FA) {
      return res.json({ success: true, needs2FA: true, pendingToken: result.pendingToken });
    }

    const { me, sessionStr, phone } = result;
    await prisma.telegramAccount.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        sessionStr,
        phone: phone ?? "",
        firstName: me.firstName ?? null,
        username: me.username ?? null,
        tgUserId: String(me.id),
      },
      update: {
        sessionStr,
        firstName: me.firstName ?? null,
        username: me.username ?? null,
        tgUserId: String(me.id),
      },
    });

    res.json({
      success: true,
      needs2FA: false,
      account: { firstName: me.firstName, username: me.username },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── POST /api/tg/2fa  (submit cloud password) ────────────────────────────────
router.post("/2fa", async (req, res) => {
  const { pendingToken, password } = req.body;
  if (!pendingToken || !password)
    return res.status(400).json({ success: false, message: "pendingToken and password required." });
  try {
    const { me, sessionStr, phone } = await gramjs.verify2FA(req.user.id, pendingToken, password);
    await prisma.telegramAccount.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        sessionStr,
        phone: phone ?? "",
        firstName: me.firstName ?? null,
        username: me.username ?? null,
        tgUserId: String(me.id),
      },
      update: {
        sessionStr,
        firstName: me.firstName ?? null,
        username: me.username ?? null,
        tgUserId: String(me.id),
      },
    });
    res.json({ success: true, account: { firstName: me.firstName, username: me.username } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/tg/me ────────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const account = await prisma.telegramAccount.findUnique({
    where: { userId: req.user.id },
  });
  if (!account) return res.json({ success: true, connected: false });
  res.json({
    success: true,
    connected: true,
    account: { firstName: account.firstName, username: account.username, phone: account.phone },
  });
});

// ── DELETE /api/tg/disconnect ─────────────────────────────────────────────────
router.delete("/disconnect", async (req, res) => {
  await gramjs.disconnect(req.user.id);
  await prisma.telegramAccount.deleteMany({ where: { userId: req.user.id } });
  res.json({ success: true });
});

// ── GET /api/tg/panels ────────────────────────────────────────────────────────
router.get("/panels", async (req, res) => {
  const account = await prisma.telegramAccount.findUnique({ where: { userId: req.user.id } });
  if (!account) return res.json({ success: true, panels: [] });
  const panels = await prisma.chatPanel.findMany({
    where: { accountId: account.id },
    orderBy: { panelOrder: "asc" },
  });
  res.json({ success: true, panels });
});

// ── POST /api/tg/panels  (add bot by username) ───────────────────────────────
router.post("/panels", async (req, res) => {
  const { botUsername } = req.body;
  if (!botUsername) return res.status(400).json({ success: false, message: "botUsername required." });

  const ctx = await resolveClient(req, res);
  if (!ctx) return;
  const { client, account } = ctx;

  try {
    const username = botUsername.replace(/^@/, "").trim();
    const entity = await client.getEntity(username);
    const displayName =
      entity.firstName ??
      entity.title ??
      entity.username ??
      username;

    const count = await prisma.chatPanel.count({ where: { accountId: account.id } });
    const panel = await prisma.chatPanel.create({
      data: {
        accountId: account.id,
        botUsername: username,
        botId: String(entity.id),
        displayName,
        panelOrder: count,
      },
    });
    res.status(201).json({ success: true, panel });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ success: false, message: "This bot is already in your dashboard." });
    res.status(400).json({ success: false, message: "Could not find that bot. Check the username." });
  }
});

// ── DELETE /api/tg/panels/:id ─────────────────────────────────────────────────
router.delete("/panels/:id", async (req, res) => {
  const account = await prisma.telegramAccount.findUnique({ where: { userId: req.user.id } });
  if (!account) return res.status(401).json({ success: false, message: "Not connected." });
  await prisma.chatPanel.deleteMany({
    where: { id: Number(req.params.id), accountId: account.id },
  });
  res.json({ success: true });
});

// ── PUT /api/tg/panels/reorder ────────────────────────────────────────────────
router.put("/panels/reorder", async (req, res) => {
  const { order } = req.body; // [{ id, panelOrder }]
  const account = await prisma.telegramAccount.findUnique({ where: { userId: req.user.id } });
  if (!account) return res.status(401).json({ success: false });
  try {
    await prisma.$transaction(
      order.map(({ id, panelOrder }) =>
        prisma.chatPanel.update({ where: { id, accountId: account.id }, data: { panelOrder } })
      )
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/tg/messages/:username ───────────────────────────────────────────
router.get("/messages/:username", async (req, res) => {
  const ctx = await resolveClient(req, res);
  if (!ctx) return;
  const { client } = ctx;

  try {
    const { username } = req.params;
    const minId = req.query.minId ? Number(req.query.minId) : undefined;

    const opts = { limit: 50 };
    if (minId) opts.minId = minId;

    const rawMessages = await client.getMessages(username, opts);

    const messages = rawMessages
      .slice()
      .reverse()
      .map((msg) => ({
        id: Number(msg.id),
        text: msg.message || null,
        date: msg.date,
        out: !!msg.out,
        mediaType: msg.photo
          ? "photo"
          : msg.video
          ? "video"
          : msg.voice || msg.audio
          ? "voice"
          : msg.document
          ? "document"
          : null,
        fileName:
          msg.document?.attributes?.find(
            (a) => a.className === "DocumentAttributeFilename"
          )?.fileName ?? null,
      }));

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/tg/send ─────────────────────────────────────────────────────────
router.post("/send", async (req, res) => {
  const { botUsername, text } = req.body;
  if (!botUsername || !text?.trim())
    return res.status(400).json({ success: false, message: "botUsername and text required." });

  const ctx = await resolveClient(req, res);
  if (!ctx) return;
  const { client } = ctx;

  try {
    const result = await client.sendMessage(botUsername, { message: text.trim() });
    res.json({
      success: true,
      message: {
        id: Number(result.id),
        text: result.message,
        date: result.date,
        out: true,
        mediaType: null,
        fileName: null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
