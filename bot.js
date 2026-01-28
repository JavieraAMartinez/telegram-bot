import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

// 👉 TU ID DE TELEGRAM (ADMIN)
const ADMIN_ID = 6330182024;

// TOKEN
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// LINKS DE CANALES
const CHANNELS = {
  KimshantalVip: "https://t.me/TU_LINK_1",
  DianaEstradaVip: "https://t.me/TU_LINK_2",
  CaeliVip: "https://t.me/TU_LINK_3",
  SamrazzuVIP: "https://t.me/TU_LINK_4",
  LiviaBritoVip: "https://t.me/TU_LINK_5"
};

// DATOS DE TRANSFERENCIA
const CUENTA = `
💳 Datos de pago (Transferencia):

Banco: Mercado Pago
Nombre: Chris Mena
CLABE: 722969010807105889

📸 Después de pagar, manda tu comprobante por aquí.
`;
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase();

  // IGNORAR MENSAJES DEL ADMIN PARA EVITAR DUPLICADOS
  if (chatId === ADMIN_ID && !text.startsWith("/aprobar")) return;

  // START
  if (text === "/start" || text.includes("hola") || text.includes("info")) {
    return bot.sendMessage(chatId,
`Hola 👋

Bienvenido/a.

Vendo accesos a canales VIP.

Escribe:

📋 canales
💰 precio
💳 pago`
    );
  }

  // CANALES
  if (text.includes("canales")) {
    return bot.sendMessage(chatId,
`📋 Canales disponibles:

✅ KimshantalVip
✅ DianaEstradaVip
✅ CaeliVip
✅ SamrazzuVIP
✅ LiviaBritoVip

Escribe "precio".`
    );
  }

  // PRECIOS
  if (text.includes("precio")) {
    return bot.sendMessage(chatId,
`💰 Precios:

🔥 KimshantalVip – $50 MXN
🔥 DianaEstradaVip – $50 MXN
🔥 CaeliVip – $50 MXN
🔥 LiviaBritoVip – $50 MXN

⭐ SamrazzuVIP – $100 MXN

Escribe "pago".`
    );
  }

  // PAGO
  if (text.includes("pago")) {
    return bot.sendMessage(chatId, CUENTA);
  }

  // FOTO = COMPROBANTE
  if (msg.photo) {
    const fileId = msg.photo[msg.photo.length - 1].file_id;

    await bot.sendMessage(ADMIN_ID,
`📥 Nuevo comprobante

Cliente ID:
${chatId}

Para aprobar:

/aprobar ${chatId} KimshantalVip`
    );

    return bot.sendPhoto(ADMIN_ID, fileId);
  }

  // TEXTO = COMPROBANTE
  if (text && chatId !== ADMIN_ID) {
    await bot.sendMessage(ADMIN_ID,
`📩 Mensaje del cliente:

${text}

Cliente ID:
${chatId}`
    );

    return bot.sendMessage(chatId,
`✅ Recibido.

Tu comprobante fue enviado al administrador.

Espera confirmación 🙌`
    );
  }

});

// APROBAR PAGO
bot.onText(/\/aprobar (\d+) (\w+)/, (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;

  const clientId = match[1];
  const channel = match[2];

  if (!CHANNELS[channel]) {
    return bot.sendMessage(ADMIN_ID, "❌ Canal inválido");
  }

  bot.sendMessage(clientId,
`✅ Pago confirmado.

Aquí está tu acceso:

${CHANNELS[channel]}

Gracias por tu compra 🙌`
  );

  bot.sendMessage(ADMIN_ID, "✅ Link enviado");
});

console.log("🤖 Bot activo");


