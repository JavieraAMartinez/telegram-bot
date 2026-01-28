import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const ADMIN_ID = 6330182024;
const SALES_FILE = "./ventas.json";

if (!fs.existsSync(SALES_FILE)) fs.writeFileSync(SALES_FILE, "[]");

const CHANNELS = {
  kim: { name: "KimshantalVip", link: "https://t.me/TU_LINK_1", price: 50 },
  dia: { name: "DianaEstradaVip", link: "https://t.me/TU_LINK_2", price: 50 },
  cae: { name: "CaeliVip", link: "https://t.me/TU_LINK_3", price: 50 },
  liv: { name: "LiviaBritoVip", link: "https://t.me/TU_LINK_5", price: 50 },
  sam: { name: "SamrazzuVIP", link: "https://t.me/TU_LINK_4", price: 100 }
};

const CUENTA = `
💳 *Datos de pago*

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

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`👋 Bienvenido

Accesos VIP disponibles.`,
keyboard);
});

// MENÚ
bot.on("message", (msg) => {
  if (!msg.text) return;
  const chat = msg.chat.id;

  if (msg.text === "📋 Canales") {
    bot.sendMessage(chat,
Object.values(CHANNELS).map(c => `✅ ${c.name}`).join("\n"));
  }

  if (msg.text === "💰 Precios") {
    bot.sendMessage(chat,
Object.values(CHANNELS)
.map(c => `🔥 ${c.name} – $${c.price} MXN`)
.join("\n"));
  }

  if (msg.text === "💳 Pagar") {
    bot.sendMessage(chat, CUENTA, { parse_mode: "Markdown" });
  }
});

// FOTO
bot.on("photo", async (msg) => {
  const userId = msg.chat.id;

  bot.sendMessage(userId, "📩 Comprobante recibido.");

  const buttons = Object.entries(CHANNELS).map(([k,v]) => [{
    text: v.name,
    callback_data: `${userId}|${k}`
  }]);

  bot.sendMessage(ADMIN_ID,
`📸 Nuevo comprobante

ID: ${userId}`,
{
reply_markup:{inline_keyboard:buttons}
});

  bot.forwardMessage(ADMIN_ID,userId,msg.message_id);
});

// BOTONES ADMIN
bot.on("callback_query", async (q) => {
  if (q.from.id !== ADMIN_ID) return;

  const [userId, key] = q.data.split("|");
  const canal = CHANNELS[key];

  await bot.sendMessage(userId,
`✅ Pago confirmado

Acceso:

${canal.link}

Gracias 🙌`);

  const ventas = JSON.parse(fs.readFileSync(SALES_FILE));
  ventas.push({user:userId, canal:canal.name, precio:canal.price, fecha:new Date()});
  fs.writeFileSync(SALES_FILE, JSON.stringify(ventas,null,2));

  bot.answerCallbackQuery(q.id,{text:"Acceso enviado"});
});

// PANEL
bot.onText(/\/panel/, (msg) => {
  if (msg.chat.id !== ADMIN_ID) return;

  const ventas = JSON.parse(fs.readFileSync(SALES_FILE));
  const total = ventas.reduce((a,b)=>a+b.precio,0);

  bot.sendMessage(ADMIN_ID,
`📊 Panel

Ventas: ${ventas.length}
Total: $${total} MXN`);
});

// HISTORIAL
bot.onText(/\/historial/, (msg) => {
  if (msg.chat.id !== ADMIN_ID) return;

  const ventas = JSON.parse(fs.readFileSync(SALES_FILE)).slice(-10);

  bot.sendMessage(ADMIN_ID,
ventas.map(v=>`${v.user} – ${v.canal} – $${v.precio}`).join("\n") || "Sin ventas");
});

console.log("Bot PRO activo 🤖");




