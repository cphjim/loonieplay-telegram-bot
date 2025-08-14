const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// /start
bot.start((ctx) => {
  ctx.reply(`👋 Welcome to LooniePlay, ${ctx.from.first_name}!\n\n🎁 /promo\n🎮 /tournament\n❓ /faq\n🆘 /support\n✅ /verify`);
});

// /promo
bot.command('promo', (ctx) => {
  ctx.reply('🎁 Current Promotions:\n- 100% Welcome Bonus\n- Free Spins Friday\n- LoonieSpin Challenge');
});

// /faq
bot.command('faq', (ctx) => {
  ctx.reply('🧠 FAQ:\n1. How do I verify?\n2. When do I get my bonus?\n3. How long do withdrawals take?');
});

// /support
bot.command('support', (ctx) => {
  ctx.reply('🆘 Need help?\nGo to: https://loonieplay.com/support');
});

// /verify
bot.command('verify', (ctx) => {
  ctx.reply('🔐 Please upload a clear photo of your ID to begin verification.\n(This feature will be automated later with OCR)');
});

// Launch bot
bot.launch();
console.log('✅ Bot is live');
