import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ================= CONFIG =================

const ADMIN_ID = 6330182024;

// IMAGEN DE BIENVENIDA
const BANNER_URL = "https://i.imgur.com/04yMt6w.png";

// CANALES
const CHANNELS = {
  sam: -1003198803571 // Samrazzu
};

// PRECIOS
const PRICES = {
  sam: "$100 MXN"
};

// Anti duplicados
const lastAction = {};

// MENÚ
const keyboard = {
  reply_markup: {
    keyboard: [
      ["🔥 Canales VIP"],
      ["💰 Precio"],
      ["💳 Pagar"]
    ],
    resize_keyboard: true
  }
};

// DATOS DE PAGO
const CUENTA = `
💳 DATOS DE PAGO

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Después de pagar envía tu comprobante aquí.
`;

// ================= START =================

bot.onText(/\/start/, (msg) => {
  bot.sendPhoto(
    msg.chat.id,
    BANNER_URL,
    {
      caption:
`🔥 BIENVENIDO AL SISTEMA VIP 🔥

Acceso exclusivo sin censura.

✔️ Contenido premium
✔️ Actualizaciones frecuentes
✔️ Acceso inmediato

Selecciona una opción 👇`,
      reply_markup: keyboard.reply_markup
    }
  );
});

// ================= MENSAJES =================

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  if (text === "🔥 Canales VIP") {
    bot.sendMessage(chatId,
`🔥 CANALES DISPONIBLES

⭐ SamrazzuVIP

Contenido exclusivo + actualizaciones.

Presiona PRECIO 👇`
    );
  }

  if (text === "💰 Precio") {
    bot.sendMessage(chatId,
`💰 ACCESO VIP

SamrazzuVIP — ${PRICES.sam}

✔️ Sin censura
✔️ Contenido exclusivo
✔️ Acceso inmediato

Presiona PAGAR 👇`
    );
  }

  if (text === "💳 Pagar") {
    const now = Date.now();
    if (lastAction[chatId] && now - lastAction[chatId] < 2000) return;
    lastAction[chatId] = now;

    bot.sendMessage(chatId, CUENTA);
  }
});

// ================= COMPROBANTE =================

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "📩 Comprobante recibido. Será revisado.");

  bot.sendMessage(ADMIN_ID,
`📸 NUEVO COMPROBANTE

ID: ${chatId}

Aprueba con:
/aprobar ${chatId} sam`
  );

  bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);
});

// ================= APROBACIÓN =================

bot.onText(/\/aprobar (\d+) (.+)/, async (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;

  const userId = Number(match[1]);
  const key = match[2].toLowerCase();

  if (!CHANNELS[key]) {
    bot.sendMessage(ADMIN_ID, "❌ Canal inválido");
    return;
  }

  try {
    const link = await bot.createChatInviteLink(CHANNELS[key], {
      member_limit: 1
    });

    await bot.sendMessage(userId,
`✅ PAGO CONFIRMADO

Aquí tu acceso VIP:

${link.invite_link}

Gracias por tu compra 🔥`
    );

    bot.sendMessage(ADMIN_ID, "✅ Acceso enviado");

  } catch (err) {
    bot.sendMessage(ADMIN_ID, "❌ Error al enviar acceso");
    console.log(err);
  }
});

console.log("🤖 Bot VIP activo");







