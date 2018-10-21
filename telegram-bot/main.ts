import * as dotenv from 'dotenv';
import * as teleBot from 'telebot';

dotenv.load();

const bot = new teleBot({
    token: process.env.TELEGRAM_BOT_TOKEN as string,
    polling: {},
});

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();
