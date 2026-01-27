import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// TU CHAT ID PERSONAL
const ADMIN_ID = 6330182024;

const CUENTA = `
💳 Datos de pago (Transferencia):

💳 Datos de pago (Transferencia):

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Después de pagar, manda tu comprobante por aquí.
`;

const menu = {
  reply_markup: {
    keyboard: [
      ["📋 Canales", "💰 Precios"],
      ["💳 Pagar"]
    ],
    resize_keyboard: true
  }
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";
  const user = msg.from.username || "sin_username";
  const name = msg.from.first_name || "";

  // =====================
  // REENVIAR FOTOS SIEMPRE
  // =====================
  if (chatId !== ADMIN_ID && msg.photo) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;

    await bot.sendMessage(
      ADMIN_ID,
`📸 Nuevo comprobante:

👤 ${name}
🔗 @${user}
🆔 ${chatId}`
    );

    await bot.sendPhoto(ADMIN_ID, photoId);
    return;
  }

  // =====================
  // MENÚ
  // =====================
  if (text === "/start" || text === "Menu") {
    bot.sendMessage(chatId, `👋 Bienvenido\n\nSelecciona una opción:`, menu);
    return;
  }

  if (text === "📋 Canales") {
    bot.sendMessage(chatId,
`📋 Canales disponibles:

✅ KimshantalVip
✅ DianaEstradaVip
✅ CaeliVip
✅ SamrazzuVIP
✅ LiviaBritoVip`);
    return;
  }

  if (text === "💰 Precios") {
    bot.sendMessage(chatId,
`💰 Precios:

🔥 KimshantalVip – $50 MXN
🔥 DianaEstradaVip – $50 MXN
🔥 CaeliVip – $50 MXN
🔥 LiviaBritoVip – $50 MXN

⭐ SamrazzuVIP – $100 MXN`);
    return;
  }

  if (text === "💳 Pagar") {
    bot.sendMessage(chatId, CUENTA);
    return;
  }

  // =====================
  // REENVIAR SOLO MENSAJES LIBRES (no botones)
  // =====================
  if (
    chatId !== ADMIN_ID &&
    text &&
    !["📋 Canales", "💰 Precios", "💳 Pagar", "/start", "Menu"].includes(text)
  ) {
    bot.sendMessage(
      ADMIN_ID,
`📩 Mensaje del cliente:

👤 ${name}
🔗 @${user}
🆔 ${chatId}

💬 ${text}`
    );
  }
});

console.log("Bot activo 🤖");

