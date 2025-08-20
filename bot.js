require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🟢 /start
bot.start((ctx) => {
  const name = ctx.from.first_name || 'Loonie';
  ctx.reply(
    `🎉 Welcome, ${name}!\n\nYou're now chatting with the official 🤖 *LooniePlay Bot*.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🎁 Promotions', 'PROMO')],
      [Markup.button.callback('📖 FAQ', 'FAQ')],
      [Markup.button.callback('🆘 Support', 'SUPPORT')],
      [Markup.button.callback('🔐 Verify Me', 'VERIFY')],
      [Markup.button.callback('🎮 Tournaments', 'TOURNAMENTS')],
    ])
  );
});

// 📍 Callback handlers
bot.action('PROMO', (ctx) => {
  ctx.reply(
    `🎁 *Current Promotions*\n\n` +
    `• 💯 100% Welcome Bonus\n` +
    `• 🎰 Free Spins Friday\n` +
    `• 🔄 LoonieSpin Challenge\n` +
    `\nUse /promo any time for updates!`
  );
});

bot.action('FAQ', (ctx) => {
  ctx.reply(
    `📖 *Top 3 Questions*\n\n` +
    `1️⃣ *How do I verify?* — Use /verify\n` +
    `2️⃣ *Where is my bonus?* — Bonuses activate after deposit 🎁\n` +
    `3️⃣ *How long do withdrawals take?* — 24–72h via bank or crypto\n\n` +
    `More soon via AI 🤖`
  );
});

bot.action('SUPPORT', (ctx) => {
  ctx.reply(
    `🆘 *Need help?*\n\n` +
    `Go to our live support:\n` +
    `🌐 https://loonieplay.com/support\n\n` +
    `Or just type your question here — our team is watching 👀`
  );
});

bot.action('VERIFY', (ctx) => {
  ctx.reply(
    `🔐 *ID Verification*\n\n` +
    `Please upload a clear photo of your ID.\n` +
    `🔎 OCR processing coming soon for instant validation!`
  );
});

bot.action('TOURNAMENTS', (ctx) => {
  ctx.reply(
    `🎮 *Upcoming Tournaments*\n\n` +
    `🏆 CS2 Weekend Showdown\n` +
    `🎲 Slot Spin-Off Battle\n` +
    `🕹️ 1v1 Loonie Arena\n\n` +
    `Stay tuned at: https://loonieplay.com/tournaments`
  );
});

// 🔁 Slash command aliases
bot.command('promo', (ctx) => ctx.telegram.emit('callback_query', { data: 'PROMO', from: ctx.from }));
bot.command('faq', (ctx) => ctx.telegram.emit('callback_query', { data: 'FAQ', from: ctx.from }));
bot.command('support', (ctx) => ctx.telegram.emit('callback_query', { data: 'SUPPORT', from: ctx.from }));
bot.command('verify', (ctx) => ctx.telegram.emit('callback_query', { data: 'VERIFY', from: ctx.from }));
bot.command('tournament', (ctx) => ctx.telegram.emit('callback_query', { data: 'TOURNAMENTS', from: ctx.from }));

// 🧠 Simpele "AI" met keyword detection
bot.on('text', (ctx) => {
  const message = ctx.message.text.toLowerCase();

  if (message.includes('bonus')) {
    ctx.reply('🎁 Bonuses usually activate after your first deposit. Still no bonus? Try /support');
  } else if (message.includes('withdrawal')) {
    ctx.reply('💸 Withdrawals take 24–72h depending on your method.');
  } else if (message.includes('verify')) {
    ctx.reply('🔐 You can start the verification with /verify');
  } else {
    ctx.reply('🤔 I’m still learning. Try using one of the menu buttons or type /start again.');
  }
});

bot.launch();
console.log('✅ LooniePlay Bot is live and ready for 2025.');
