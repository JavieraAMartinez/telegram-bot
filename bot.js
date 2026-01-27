import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const CUENTA = `
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

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (text === "/start" || text === "Menu") {
    bot.sendMessage(
      chatId,
`👋 Bienvenido

Selecciona una opción:`,
      menu
    );
  }

  else if (text === "📋 Canales") {
    bot.sendMessage(chatId,
`📋 Canales disponibles:

✅ KimshantalVip
✅ DianaEstradaVip
✅ CaeliVip
✅ SamrazzuVIP
✅ LiviaBritoVip`
    );
  }

  else if (text === "💰 Precios") {
    bot.sendMessage(chatId,
`💰 Precios:

🔥 KimshantalVip – $50 MXN
🔥 DianaEstradaVip – $50 MXN
🔥 CaeliVip – $50 MXN
🔥 LiviaBritoVip – $50 MXN

⭐ SamrazzuVIP – $100 MXN`
    );
  }

  else if (text === "💳 Pagar") {
    bot.sendMessage(chatId, CUENTA);
  }
});

console.log("Bot activo 🤖");
