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
  ctx.answerCbQuery();
  ctx.replyWithMarkdownV2(
    `🎁 *Current Promotions*\n\n` +
    `• 💯 100% Welcome Bonus\n` +
    `• 🎰 Free Spins Friday\n` +
    `• 🔄 LoonieSpin Challenge\n\n` +
    `Use /promo anytime to check updates!`
  );
});

bot.action('FAQ', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdownV2(
    `📖 *Top 3 Questions*\n\n` +
    `1️⃣ *How do I verify?* — Use /verify\n` +
    `2️⃣ *Where is my bonus?* — After first deposit 🎁\n` +
    `3️⃣ *Withdrawals?* — 24–72h via bank or crypto\n\n` +
    `Full AI FAQ coming soon 🤖`
  );
});

bot.action('SUPPORT', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdownV2(
    `🆘 *Need help?*\n\n` +
    `Live support: [Click here](https://loonieplay.com/support)\n` +
    `Or ask your question here — our team is watching 👀`
  );
});

bot.action('VERIFY', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdownV2(
    `🔐 *ID Verification*\n\n` +
    `Please upload a clear photo of your ID now.\n` +
    `OCR-based instant check coming soon!`
  );
});

bot.action('TOURNAMENTS', (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithMarkdownV2(
    `🎮 *Upcoming Tournaments*\n\n` +
    `🏆 CS2 Weekend Showdown\n` +
    `🎲 Slot Spin-Off Battle\n` +
    `🕹️ 1v1 Loonie Arena\n\n` +
    `More info: [Tournaments](https://loonieplay.com/tournaments)`
  );
});

// 🔁 Slash command handlers (zonder hacks)
bot.command('promo', (ctx) => {
  ctx.scene ? null : bot.telegram.emit('callback_query', { data: 'PROMO', from: ctx.from });
  ctx.reply('🎁 Use /promo or click the menu for promotions.');
});

bot.command('faq', (ctx) => {
  ctx.scene ? null : bot.telegram.emit('callback_query', { data: 'FAQ', from: ctx.from });
  ctx.reply('📖 Use /faq or the menu to learn more.');
});

bot.command('support', (ctx) => {
  ctx.scene ? null : bot.telegram.emit('callback_query', { data: 'SUPPORT', from: ctx.from });
  ctx.reply('🆘 Visit https://loonieplay.com/support');
});

bot.command('verify', (ctx) => {
  ctx.scene ? null : bot.telegram.emit('callback_query', { data: 'VERIFY', from: ctx.from });
  ctx.reply('🔐 Send a clear photo of your ID to start verification.');
});

bot.command('tournament', (ctx) => {
  ctx.scene ? null : bot.telegram.emit('callback_query', { data: 'TOURNAMENTS', from: ctx.from });
  ctx.reply('🎮 Type /tournament or click the button for info.');
});

// 🧠 AI-like text recognition
bot.on('text', (ctx) => {
  const message = ctx.message.text.toLowerCase();

  if (message.includes('bonus')) {
    ctx.reply('🎁 Bonuses activate after your first deposit. Need help? Try /support');
  } else if (message.includes('withdrawal') || message.includes('payout')) {
    ctx.reply('💸 Withdrawals take 24–72h depending on method and verification status.');
  } else if (message.includes('verify') || message.includes('id')) {
    ctx.reply('🔐 Use /verify to start your ID check.');
  } else if (message.includes('tournament')) {
    ctx.reply('🎮 Type /tournament to view current events.');
  } else {
    ctx.reply('🤖 I’m still learning. Try using one of the buttons or type /start again!');
  }
});

// 🚀 Launch the bot
bot.launch();
console.log('✅ LooniePlay Bot is live and ready for 2025!');
