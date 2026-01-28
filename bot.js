import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ADMIN
const ADMIN_ID = 6330182024;

// Anti duplicados
const lastAction = {};

// Canal links
const CHANNELS = {
  KimshantalVip: "https://t.me/TU_LINK_1",
  DianaEstradaVip: "https://t.me/TU_LINK_2",
  CaeliVip: "https://t.me/TU_LINK_3",
  SamrazzuVIP: "https://t.me/TU_LINK_4",
  LiviaBritoVip: "https://t.me/TU_LINK_5"
};

// Pagos
const CUENTA = `
💳 Datos de pago (Transferencia):

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Después de pagar, manda tu comprobante por aquí.
`;

// Menu
const keyboard = {
  reply_markup: {
    keyboard: [
      ["📋 Canales", "💰 Precios"],
      ["💳 Pagar"]
    ],
    resize_keyboard: true
  }
};

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Hola 👋 Bienvenido

Accesos VIP disponibles.

Usa el menú 👇`,
keyboard);
});

// Mensajes
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  if (text === "📋 Canales") {
    bot.sendMessage(chatId,
`📋 Canales:

✅ KimshantalVip
✅ DianaEstradaVip
✅ CaeliVip
✅ SamrazzuVIP
✅ LiviaBritoVip`);
  }

  if (text === "💰 Precios") {
    bot.sendMessage(chatId,
`💰 Precios:

🔥 KimshantalVip – $50 MXN
🔥 DianaEstradaVip – $50 MXN
🔥 CaeliVip – $50 MXN
🔥 LiviaBritoVip – $50 MXN

⭐ SamrazzuVIP – $100 MXN`);
  }

  if (text === "💳 Pagar") {
    const now = Date.now();
    if (lastAction[chatId] && now - lastAction[chatId] < 2000) return;
    lastAction[chatId] = now;
    bot.sendMessage(chatId, CUENTA);
  }
});

// Fotos
bot.on("photo", (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "📩 Comprobante recibido. Será revisado.");

  bot.sendMessage(ADMIN_ID,
`📸 Nuevo comprobante

Usuario: @${msg.from.username || "sin username"}
ID: ${chatId}`);

  bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);
});

// APROBAR MIXTO
bot.onText(/\/aprobar (.+) (.+)/, async (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;

  let target = match[1];
  const key = match[2].toLowerCase();

  const MAP = {
    kim: CHANNELS.KimshantalVip,
    dia: CHANNELS.DianaEstradaVip,
    cae: CHANNELS.CaeliVip,
    sam: CHANNELS.SamrazzuVIP,
    liv: CHANNELS.LiviaBritoVip
  };

  if (!MAP[key]) {
    bot.sendMessage(ADMIN_ID, "❌ Canal inválido");
    return;
  }

  // Si es @usuario
  if (target.startsWith("@")) {
    bot.sendMessage(target,
`✅ Pago confirmado

Aquí tu acceso:

${MAP[key]}

Gracias 🙌`);

    bot.sendMessage(ADMIN_ID, "✅ Acceso enviado");
    return;
  }

  // Si es ID
  bot.sendMessage(target,
`✅ Pago confirmado

Aquí tu acceso:

${MAP[key]}

Gracias 🙌`);

  bot.sendMessage(ADMIN_ID, "✅ Acceso enviado");
});

console.log("Bot activo 🤖");




