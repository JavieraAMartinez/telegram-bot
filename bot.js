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
💳 Datos de pago

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

// guarda canal elegido
const userSelections = {};

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`👋 Bienvenido

Primero selecciona un canal 👇`,
keyboard);
});

// MENÚ
bot.on("message", (msg) => {
  if (!msg.text) return;
  const chat = msg.chat.id;

  if (msg.text === "📋 Canales") {
    bot.sendMessage(chat,"Selecciona canal:",{
      reply_markup:{
        inline_keyboard:[
          [{text:"KimshantalVip",callback_data:"select|kim"}],
          [{text:"DianaEstradaVip",callback_data:"select|dia"}],
          [{text:"CaeliVip",callback_data:"select|cae"}],
          [{text:"LiviaBritoVip",callback_data:"select|liv"}],
          [{text:"SamrazzuVIP ($100)",callback_data:"select|sam"}]
        ]
      }
    });
  }

  if (msg.text === "💰 Precios") {
    bot.sendMessage(chat,
Object.values(CHANNELS)
.map(c => `🔥 ${c.name} – $${c.price}`)
.join("\n"));
  }

  if (msg.text === "💳 Pagar") {
    if(!userSelections[chat]){
      bot.sendMessage(chat,"⚠️ Primero selecciona canal.");
      return;
    }
    bot.sendMessage(chat, CUENTA);
  }
});

// SELECCION CANAL
bot.on("callback_query", async (q)=>{
  const chat=q.message.chat.id;
  const data=q.data;

  if(data.startsWith("select")){
    const key=data.split("|")[1];
    userSelections[chat]=key;

    bot.answerCallbackQuery(q.id,{text:"Canal seleccionado"});
    bot.sendMessage(chat,`✅ Elegiste: ${CHANNELS[key].name}\nAhora presiona 💳 Pagar`);
    return;
  }

  // aprobar
  if(q.from.id!==ADMIN_ID) return;

  const [userId,key]=data.split("|");
  const canal=CHANNELS[key];

  await bot.sendMessage(userId,
`✅ Pago aprobado

Acceso:

${canal.link}`);

  const ventas=JSON.parse(fs.readFileSync(SALES_FILE));
  ventas.push({user:userId, canal:canal.name, precio:canal.price, fecha:new Date()});
  fs.writeFileSync(SALES_FILE,JSON.stringify(ventas,null,2));

  bot.answerCallbackQuery(q.id,{text:"Acceso enviado"});
});

// FOTO
bot.on("photo", async (msg)=>{
  const userId=msg.chat.id;
  const key=userSelections[userId];

  if(!key){
    bot.sendMessage(userId,"⚠️ Selecciona canal primero.");
    return;
  }

  bot.sendMessage(userId,"📩 Comprobante recibido.");

  bot.sendMessage(ADMIN_ID,
`📸 Comprobante

ID: ${userId}
Canal: ${CHANNELS[key].name}`,
{
reply_markup:{
inline_keyboard:[
[{text:`Aprobar ${CHANNELS[key].name}`,callback_data:`${userId}|${key}`}]
]}
});

  bot.forwardMessage(ADMIN_ID,userId,msg.message_id);
});

// PANEL
bot.onText(/\/panel/, (msg)=>{
 if(msg.chat.id!==ADMIN_ID) return;
 const v=JSON.parse(fs.readFileSync(SALES_FILE));
 const t=v.reduce((a,b)=>a+b.precio,0);
 bot.sendMessage(ADMIN_ID,`Ventas: ${v.length}\nTotal: $${t}`);
});

console.log("Bot listo 🚀");





