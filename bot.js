import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// 👉 CAMBIA ESTOS DATOS POR LOS TUYOS REALES
const CUENTA = `
💳 Datos de pago (Transferencia):

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Después de pagar, manda tu comprobante por aquí.
`;

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase();

  // Mensaje inicial
  if (text === "/start" || text.includes("hola") || text.includes("info")) {
    bot.sendMessage(
      chatId,
`Hola 👋

Bienvenido/a.

Vendo accesos a canales VIP de Telegram.

Escribe una opción:

📋 canales
💰 precio
💳 pago
`
    );
  }

  // Lista de canales
  else if (text.includes("canales")) {
    bot.sendMessage(
      chatId,
`📋 Canales disponibles:

✅ KimshantalVip
✅ DianaEstradaVip
✅ CaeliVip
✅ SamrazzuVIP
✅ LiviaBritoVip

Escribe "precio" para ver costos.`
    );
  }

  // Precios
  else if (text.includes("precio")) {
    bot.sendMessage(
      chatId,
`💰 Precios:

🔥 KimshantalVip – $50 MXN
🔥 DianaEstradaVip – $50 MXN
🔥 CaeliVip – $50 MXN
🔥 LiviaBritoVip – $50 MXN

⭐ SamrazzuVIP – $100 MXN

Escribe "pago" para recibir los datos de transferencia.`
    );
  }

  // Datos de pago
  else if (text.includes("pago")) {
    bot.sendMessage(chatId, CUENTA);
  }

  // Mensaje por defecto
  else {
    bot.sendMessage(
      chatId,
`No entendí tu mensaje 🙂

Escribe:
canales
precio
pago`
    );
  }
});

console.log("Bot activo 🤖");
