import * as dotenv from 'dotenv';
import * as TelegramBot from 'node-telegram-bot-api';

dotenv.load();

let currentValue = 100;

const m: TelegramBot.InlineKeyboardMarkup = {
  inline_keyboard: [[
    {
      text: 'Decrease',
      callback_data: '-1',
    },
    {
      text: 'Increase',
      callback_data: '+1',
    },
  ]],
};

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, async (msg, _match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  // send back the matched "whatever" to the chat
  const res = await bot.sendMessage(chatId, `Текущее значение: ${currentValue}`, { reply_markup: m });
  console.log(JSON.stringify(res));
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  console.log(`Received message: ${JSON.stringify(msg)}`);
});

bot.on('callback_query', async (query) => {
  console.log(`Received message: ${JSON.stringify(query)}`);
  currentValue = currentValue + Number(query.data);
  await bot.editMessageText(`Текущее значение: ${currentValue}`,
    { chat_id: query.message.chat.id, message_id: query.message.message_id });
  await bot.editMessageReplyMarkup(m,
    { chat_id: query.message.chat.id, message_id: query.message.message_id });
  await bot.answerCallbackQuery(query.id);
});
