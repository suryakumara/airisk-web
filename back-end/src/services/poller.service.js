const axios = require("axios");
const prisma = require("../lib/prisma");

// Track last update_id per bot to avoid reprocessing
const offsets = new Map();

async function pollBot(bot) {
  const offset = offsets.get(bot.id) ?? 0;
  try {
    const { data } = await axios.get(
      `https://api.telegram.org/bot${bot.token}/getUpdates`,
      { params: { offset: offset + 1, timeout: 0 }, timeout: 5000 }
    );

    const updates = data?.result ?? [];
    if (!updates.length) return;

    offsets.set(bot.id, updates[updates.length - 1].update_id);

    for (const update of updates) {
      const msg = update.message;
      if (!msg) continue;

      const chatIdFrom = String(msg.chat?.id ?? "");

      // Auto-set chatId on the bot if not already set
      if (!bot.chatId && chatIdFrom) {
        await prisma.bot.update({
          where: { id: bot.id },
          data: { chatId: chatIdFrom },
        });
        bot.chatId = chatIdFrom; // update local reference
      }

      const mediaType = msg.photo
        ? "photo"
        : msg.video
        ? "video"
        : msg.voice || msg.audio
        ? "voice"
        : msg.document
        ? "document"
        : null;

      // Upsert to prevent duplicates on restart
      await prisma.message.upsert({
        where: { botId_updateId: { botId: bot.id, updateId: update.update_id } },
        update: {},
        create: {
          botId: bot.id,
          updateId: update.update_id,
          direction: "in",
          text: msg.text ?? msg.caption ?? null,
          mediaType,
          fileName: msg.document?.file_name ?? null,
          senderName: msg.from?.first_name ?? "User",
          chatIdFrom,
          timestamp: new Date(msg.date * 1000),
        },
      });
    }
  } catch {
    // Silently ignore network / invalid token errors
  }
}

async function startPolling() {
  const run = async () => {
    try {
      const bots = await prisma.bot.findMany();
      await Promise.allSettled(bots.map(pollBot));
    } catch {
      // DB might not be ready yet
    }
  };

  await run();
  setInterval(run, 3000);
  console.log("✅ Telegram polling service started");
}

module.exports = { startPolling };
