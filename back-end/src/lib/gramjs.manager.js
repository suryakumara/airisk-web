const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");
const { computeCheck } = require("telegram/Password");

const API_ID = Number(process.env.TG_API_ID);
const API_HASH = process.env.TG_API_HASH;

// Active authenticated clients: userId -> TelegramClient
const activeClients = new Map();

// Pending auth states: pendingToken -> { client, phoneCodeHash, phone }
const pendingAuths = new Map();

function makePendingToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Re-initialise client from a stored session string (e.g. after server restart)
async function initClientFromSession(userId, sessionStr) {
  if (activeClients.has(userId)) return activeClients.get(userId);
  const session = new StringSession(sessionStr);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 3,
    useWSS: false,
  });
  await client.connect();
  activeClients.set(userId, client);
  return client;
}

// Step 1: send OTP to phone number
async function sendCode(phone) {
  const session = new StringSession("");
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 3,
    useWSS: false,
  });
  await client.connect();

  const result = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, phone);
  const token = makePendingToken();
  pendingAuths.set(token, { client, phoneCodeHash: result.phoneCodeHash, phone });

  // Auto-expire after 10 minutes
  setTimeout(() => pendingAuths.delete(token), 10 * 60 * 1000);

  return { pendingToken: token };
}

// Step 2: verify the OTP code
async function verifyCode(userId, pendingToken, code) {
  const pending = pendingAuths.get(pendingToken);
  if (!pending) throw new Error("Code expired. Please request a new one.");

  const { client, phoneCodeHash, phone } = pending;

  try {
    await client.invoke(
      new Api.auth.SignIn({ phoneNumber: phone, phoneCodeHash, phoneCode: code })
    );

    const sessionStr = String(client.session.save());
    activeClients.set(userId, client);
    pendingAuths.delete(pendingToken);

    const me = await client.getMe();
    return { sessionStr, me, phone, needs2FA: false };
  } catch (err) {
    if (err.errorMessage === "SESSION_PASSWORD_NEEDED") {
      // Keep pending state alive for 2FA step
      return { needs2FA: true, pendingToken };
    }
    throw err;
  }
}

// Step 3 (optional): submit 2FA cloud password
async function verify2FA(userId, pendingToken, password) {
  const pending = pendingAuths.get(pendingToken);
  if (!pending) throw new Error("Session expired. Please restart.");

  const { client, phone } = pending;

  const srpData = await client.invoke(new Api.account.GetPassword());
  const check = await computeCheck(srpData, password);
  await client.invoke(new Api.auth.CheckPassword({ password: check }));

  const sessionStr = String(client.session.save());
  activeClients.set(userId, client);
  pendingAuths.delete(pendingToken);

  const me = await client.getMe();
  return { sessionStr, me, phone };
}

// Get (or restore) client for a given user
async function getClient(userId, sessionStr) {
  if (activeClients.has(userId)) return activeClients.get(userId);
  if (!sessionStr) return null;
  try {
    return await initClientFromSession(userId, sessionStr);
  } catch {
    return null;
  }
}

// Disconnect and remove client
async function disconnect(userId) {
  const client = activeClients.get(userId);
  if (client) {
    try { await client.disconnect(); } catch {}
    activeClients.delete(userId);
  }
}

module.exports = { sendCode, verifyCode, verify2FA, getClient, disconnect };
