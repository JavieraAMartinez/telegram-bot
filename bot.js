import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Mini servidor para Render (plan free)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot activo 🤖"));
app.listen(PORT, () => console.log("Servidor listo"));

const ADMIN_ID = 6330182024;
// DEBUG: mostrar IDs de chats (solo admin)
bot.on("channel_post", (msg) => {
  console.log("CHANNEL ID:", msg.chat.id);
});


// IDs de canales VIP (solo Samrazzu real por ahora)
const CHANNELS = {
  kim: { name: "KimshantalVip", channelId: -1001111111111, price: 50 },
  dia: { name: "DianaEstradaVip", channelId: -1002222222222, price: 50 },
  cae: { name: "CaeliVip", channelId: -1003333333333, price: 50 },
  liv: { name: "LiviaBritoVip", channelId: -1004444444444, price: 50 },
  sam: { name: "SamrazzuVIP", channelId: -1003198803571, price: 100 }
};

const CUENTA = `
💳 Transferencia

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Envía tu comprobante aquí.
`;

const keyboard = {
  reply_markup: {
    keyboard: [
      ["📋 Canales", "💰 Precios"],
      ["💳 Pagar"]
    ],
    resize_keyboard: true
  }
};

// Guarda qué canal eligió cada usuario
const userSelections = {};

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Bienvenido\n\nSelecciona un canal con el menú 👇",
    keyboard
  );
});

// Mensajes del menú
bot.on("message", (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;

  if (msg.text === "📋 Canales") {
    bot.sendMessage(chatId, "Selecciona canal:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "KimshantalVip", callback_data: "select|kim" }],
          [{ text: "DianaEstradaVip", callback_data: "select|dia" }],
          [{ text: "CaeliVip", callback_data: "select|cae" }],
          [{ text: "LiviaBritoVip", callback_data: "select|liv" }],
          [{ text: "SamrazzuVIP $100", callback_data: "select|sam" }]
        ]
      }
    });
  }

  if (msg.text === "💰 Precios") {
    const prices = Object.values(CHANNELS)
      .map((c) => `🔥 ${c.name} – $${c.price} MXN`)
      .join("\n");

    bot.sendMessage(chatId, prices);
  }

  if (msg.text === "💳 Pagar") {
    if (!userSelections[chatId]) {
      bot.sendMessage(chatId, "⚠️ Primero selecciona un canal.");
      return;
    }
    bot.sendMessage(chatId, CUENTA);
  }
});

// Selección de canal y aprobación
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // Usuario selecciona canal
  if (data.startsWith("select|")) {
    const key = data.split("|")[1];
    userSelections[chatId] = key;

    bot.answerCallbackQuery(query.id, { text: "Canal seleccionado" });
    bot.sendMessage(
      chatId,
      `✅ Elegiste: ${CHANNELS[key].name}\n\nAhora presiona 💳 Pagar`
    );
    return;
  }

  // Admin aprueba pago
  if (query.from.id !== ADMIN_ID) return;

  const [userId, key] = data.split("|");
  const canal = CHANNELS[key];

  try {
    // Crear link de un solo uso
    const invite = await bot.createChatInviteLink(canal.channelId, {
      member_limit: 1
    });

    // Enviar acceso al usuario
    await bot.sendMessage(
      userId,
      `✅ Pago aprobado\n\nAccede aquí 👇\n${invite.invite_link}`
    );

    bot.answerCallbackQuery(query.id, { text: "Acceso enviado" });
  } catch (err) {
    console.error(err);
    bot.answerCallbackQuery(query.id, { text: "Error enviando acceso" });
  }
});

// Cuando el usuario manda foto (comprobante)
bot.on("photo", (msg) => {
  const userId = msg.chat.id;
  const key = userSelections[userId];

  if (!key) {
    bot.sendMessage(userId, "⚠️ Primero selecciona un canal.");
    return;
  }

  bot.sendMessage(userId, "📩 Comprobante recibido. En revisión.");

  // Avisar al admin
  bot.sendMessage(
    ADMIN_ID,
    `📸 Nuevo comprobante\n\nID: ${userId}\nCanal: ${CHANNELS[key].name}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Aprobar ${CHANNELS[key].name}`,
              callback_data: `${userId}|${key}`
            }
          ]
        ]
      }
    }
  );

  // Reenviar la imagen al admin
  bot.forwardMessage(ADMIN_ID, userId, msg.message_id);
});

console.log("Bot VIP funcionando 🚀");







