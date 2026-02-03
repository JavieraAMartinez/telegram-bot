import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Mini servidor Render
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot activo 🤖"));
app.listen(PORT, () => console.log("Servidor listo"));

const ADMIN_ID = 6330182024;

// CANALES VIP
const CHANNELS = {
  kim: { name: "KimshantalVip", channelId: -1002139985836, price: 50 },
  dia: { name: "DianaEstradaVip", channelId: -1001714742186, price: 50 },
  cae: { name: "CaeliVip", channelId: -1001884577464, price: 50 },
  liv: { name: "YerimuaVip", channelId: -1001900215344, price: 50 },
  sam: { name: "SamrazzuVIP", channelId: -1003198803571, price: 100 }
};

const CUENTA = `
💳 Transferencia

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Envía tu comprobante aquí.
`;

const CONTENT = `
📦 Contenido VIP incluye:

✅ Fotos exclusivas
✅ Videos sin censura
✅ Contenido diario
`;

const keyboard = {
  reply_markup: {
    keyboard: [
      ["📋 Canales", "💰 Precios"],
      ["📦 Contenido VIP", "💳 Pagar"]
    ],
    resize_keyboard: true
  }
};

const userSelections = {};
const waitingApproval = {};
const alreadySent = {};

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`👋 Bienvenido a JM Canales VIP

Selecciona un canal 👇`,
    keyboard
  );
});

// MENÚ
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
          [{ text: "YerimuaVip", callback_data: "select|liv" }],
          [{ text: "SamrazzuVIP", callback_data: "select|sam" }]
        ]
      }
    });
  }

  if (msg.text === "💰 Precios") {
    bot.sendMessage(chatId,
      Object.values(CHANNELS)
        .map(c => `🔥 ${c.name} – $${c.price}`)
        .join("\n")
    );
  }

  if (msg.text === "📦 Contenido VIP") {
    bot.sendMessage(chatId, CONTENT);
  }

  if (msg.text === "💳 Pagar") {
    if (!userSelections[chatId]) return bot.sendMessage(chatId, "⚠️ Primero selecciona un canal.");
    bot.sendMessage(chatId, CUENTA);
  }
});

// CALLBACKS
bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id;
  const data = q.data;

  // Selección canal
  if (data.startsWith("select|")) {
    const key = data.split("|")[1];
    userSelections[chatId] = key;

    bot.answerCallbackQuery(q.id);
    bot.sendMessage(chatId,
`✅ ${CHANNELS[key].name}
💰 Precio: $${CHANNELS[key].price}

Ahora presiona 💳 Pagar`
    );
    return;
  }

  // Usuario decide continuar
  if (data === "more") {
    delete userSelections[chatId];
    bot.answerCallbackQuery(q.id);
    bot.sendMessage(chatId, "Selecciona otro canal 👇", keyboard);
    return;
  }

  if (data === "finish") {
    delete userSelections[chatId];
    bot.answerCallbackQuery(q.id);
    bot.sendMessage(chatId, "Gracias por tu compra 🙌\nEscribe /start cuando quieras.");
    return;
  }

  // Admin
  if (q.from.id !== ADMIN_ID) return;

  const [userId, key, action] = data.split("|");

  if (action === "reject") {
    delete waitingApproval[userId];
    bot.sendMessage(userId, "❌ Tu comprobante fue rechazado.");
    bot.answerCallbackQuery(q.id);
    return;
  }

  if (alreadySent[userId]) {
    bot.answerCallbackQuery(q.id, { text: "Ya enviado" });
    return;
  }

  try {
    const canal = CHANNELS[key];

    const invite = await bot.createChatInviteLink(canal.channelId, {
      member_limit: 1
    });

    await bot.sendMessage(userId,
`✅ Pago aprobado

Acceso único:
${invite.invite_link}`
    );

    await bot.sendMessage(userId, "¿Te interesa otro canal?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Sí", callback_data: "more" }],
          [{ text: "No", callback_data: "finish" }]
        ]
      }
    });

    alreadySent[userId] = true;
    delete waitingApproval[userId];

    bot.answerCallbackQuery(q.id, { text: "Acceso enviado" });

  } catch (e) {
    console.log(e);
    bot.answerCallbackQuery(q.id, { text: "Error" });
  }
});

// FOTO
bot.on("photo", (msg) => {
  const userId = msg.chat.id;
  const key = userSelections[userId];

  if (!key) return bot.sendMessage(userId, "⚠️ Selecciona canal primero.");

  if (waitingApproval[userId]) return bot.sendMessage(userId, "⏳ Ya está en revisión.");

  waitingApproval[userId] = true;

  bot.sendMessage(userId, "📩 Comprobante recibido.");

  bot.sendMessage(ADMIN_ID,
`📸 Nuevo comprobante

ID: ${userId}
Canal: ${CHANNELS[key].name}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Aprobar", callback_data: `${userId}|${key}|ok` },
            { text: "❌ Rechazar", callback_data: `${userId}|${key}|reject` }
          ]
        ]
      }
    }
  );

  bot.forwardMessage(ADMIN_ID, userId, msg.message_id);
});

console.log("JM VIP activo 🚀");









