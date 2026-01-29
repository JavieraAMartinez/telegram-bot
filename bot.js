import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fs from "fs";
import express from "express";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// EXPRESS (PUERTO PARA RENDER)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req,res)=>{
  res.send("Bot activo 🤖");
});

app.listen(PORT, ()=>console.log("Servidor listo"));

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

const userSelections = {};

// START
bot.onText(/\/start/, (msg)=>{
  bot.sendMessage(msg.chat.id,"👋 Bienvenido\nSelecciona canal 👇",keyboard);
});

// MENÚ
bot.on("message",(msg)=>{
 if(!msg.text) return;
 const chat=msg.chat.id;

 if(msg.text==="📋 Canales"){
  bot.sendMessage(chat,"Selecciona:",{
   reply_markup:{inline_keyboard:[
    [{text:"KimshantalVip",callback_data:"select|kim"}],
    [{text:"DianaEstradaVip",callback_data:"select|dia"}],
    [{text:"CaeliVip",callback_data:"select|cae"}],
    [{text:"LiviaBritoVip",callback_data:"select|liv"}],
    [{text:"SamrazzuVIP $100",callback_data:"select|sam"}]
   ]}
  });
 }

 if(msg.text==="💰 Precios"){
  bot.sendMessage(chat,Object.values(CHANNELS).map(c=>`🔥 ${c.name} $${c.price}`).join("\n"));
 }

 if(msg.text==="💳 Pagar"){
  if(!userSelections[chat]) return bot.sendMessage(chat,"⚠️ Selecciona canal primero");
  bot.sendMessage(chat,CUENTA);
 }
});

// SELECT
bot.on("callback_query",async(q)=>{
 const chat=q.message.chat.id;
 const data=q.data;

 if(data.startsWith("select")){
  const key=data.split("|")[1];
  userSelections[chat]=key;
  bot.answerCallbackQuery(q.id,{text:"Seleccionado"});
  bot.sendMessage(chat,`✅ ${CHANNELS[key].name}\nAhora 💳 Pagar`);
  return;
 }

 if(q.from.id!==ADMIN_ID) return;

 const [userId,key]=data.split("|");

 await bot.sendMessage(userId,`✅ Pago aprobado\n\n${CHANNELS[key].link}`);

 const ventas=JSON.parse(fs.readFileSync(SALES_FILE));
 ventas.push({user:userId,canal:CHANNELS[key].name,precio:CHANNELS[key].price});
 fs.writeFileSync(SALES_FILE,JSON.stringify(ventas,null,2));

 bot.answerCallbackQuery(q.id,{text:"Acceso enviado"});
});

// FOTO
bot.on("photo",(msg)=>{
 const userId=msg.chat.id;
 const key=userSelections[userId];
 if(!key) return bot.sendMessage(userId,"⚠️ Selecciona canal");

 bot.sendMessage(userId,"📩 Comprobante recibido");

 bot.sendMessage(ADMIN_ID,
`📸 Nuevo pago\nID: ${userId}\nCanal: ${CHANNELS[key].name}`,
{reply_markup:{inline_keyboard:[
 [{text:`Aprobar ${CHANNELS[key].name}`,callback_data:`${userId}|${key}`}]
]}});

 bot.forwardMessage(ADMIN_ID,userId,msg.message_id);
});

bot.on("channel_post",(msg)=>{
 console.log("ID DEL CANAL:", msg.chat.id);
});


console.log("Bot funcionando 🚀");






