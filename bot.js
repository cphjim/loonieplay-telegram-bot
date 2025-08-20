// bot.js
require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const { Telegraf, Markup } = require('telegraf');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('Missing BOT_TOKEN env var');

const bot = new Telegraf(BOT_TOKEN, { handlerTimeout: 10_000 });

// ---------- util ----------
const hash = crypto.createHash('sha256').update(BOT_TOKEN).digest('hex').slice(0, 32);
const HOOK_PATH = `/telegram/webhook/${hash}`;
const PORT = process.env.PORT || 10_000;
const PUBLIC_BASE =
  process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_URL || process.env.PUBLIC_URL;

// banner url (gebruik je env BANNER_URL als je wilt, anders /static/…)
const BANNER_URL =
  process.env.BANNER_URL ||
  (PUBLIC_BASE ? `${PUBLIC_BASE}/static/${encodeURIComponent('startonoctoberfirst!.gif')}` : '');

const mainMenu = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🎁 Promotions', 'PROMO')],
    [Markup.button.callback('📖 FAQ', 'FAQ')],
    [Markup.button.callback('🆘 Support', 'SUPPORT')],
    [Markup.button.callback('🔐 Verify Me', 'VERIFY')],
    [Markup.button.callback('🎮 Tournaments', 'TOURNAMENTS')],
  ]);

const backMenu = () =>
  Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to menu', 'HOME')]]);

const ai = () => ['✨', '⚡', '🚀', '🤖', '🎯', '🧠'][Math.floor(Math.random() * 6)];

// ---------- global middlewares ----------
bot.catch((err, ctx) => {
  console.error('Bot error on', ctx.updateType, err);
});

// Optional: typing hint for DM chats
bot.use(async (ctx, next) => {
  try {
    if (ctx.chat?.type === 'private') await ctx.sendChatAction('typing');
  } catch {}
  return next();
});

// Expose slash commands to users
(async () => {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Open the main menu' },
      { command: 'promo', description: 'Today’s promotions' },
      { command: 'support', description: 'Contact support' },
      { command: 'verify', description: 'Start verification' },
      { command: 'faq', description: 'Top questions' },
      { command: 'tournament', description: 'Upcoming tournaments' },
      { command: 'help', description: 'What can this bot do?' },
    ]);
  } catch (e) {
    console.warn('setMyCommands failed (non-fatal):', e?.message);
  }
})();

// ---------- views / handlers ----------
async function sendHome(ctx) {
  const name = ctx.from?.first_name || 'Loonie';

  // probeer eerst de banner (gif/mp4)
  if (BANNER_URL) {
    try {
      await ctx.replyWithAnimation(BANNER_URL, {
        caption:
          `✨ Welcome, ${name}!\n\n` +
          `You're now chatting with the official <i>LooniePlay Bot</i>.\n` +
          `Pick an option below.`,
        parse_mode: 'HTML',
        ...mainMenu()
      });
      return;
    } catch (e) {
      console.warn('Banner failed, fallback to text:', e.message);
    }
  }

  // tekst fallback
  await ctx.replyWithMarkdown(
    `${ai()} *Welcome, ${name}!*` +
      `\n\nYou're now chatting with the official _LooniePlay Bot_.\nPick an option below.`,
    mainMenu()
  );
}

// /start & /help
bot.start(sendHome);
bot.help(async (ctx) => {
  await ctx.replyWithMarkdown(
    `${ai()} I can help with:\n` +
      `• /promo – promotions\n` +
      `• /support – help & contact\n` +
      `• /verify – start verification\n` +
      `• /faq – quick answers\n` +
      `• /tournament – events\n\n` +
      `Or just use the buttons below.`,
    mainMenu()
  );
});

// ----- PROMO -----
async function showPromo(ctx) {
  await ctx.replyWithHTML(
    '🎁 <b>Current Promotions</b>\n\n' +
      '• 💯 100% Welcome Bonus\n' +
      '• 🎰 Free Spins Friday\n' +
      '• 🔄 LoonieSpin Challenge\n\n' +
      'Use <b>/promo</b> anytime for updates.',
    Markup.inlineKeyboard([
      [Markup.button.url('🌐 Visit site', 'https://loonieplay.com')],
      [Markup.button.callback('⬅️ Back to menu', 'HOME')],
    ])
  );
}
bot.command('promo', (ctx) => showPromo(ctx));
bot.action('PROMO', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  return showPromo(ctx);
});

// ----- FAQ -----
async function showFaq(ctx) {
  await ctx.replyWithHTML(
    '📖 <b>Top 3 Questions</b>\n\n' +
      '1️⃣ <b>How do I verify?</b> — Use <b>/verify</b>\n' +
      '2️⃣ <b>Where is my bonus?</b> — After first deposit 🎁\n' +
      '3️⃣ <b>Withdrawals?</b> — 24–72h via bank or crypto\n\n' +
      'AI-powered FAQ is coming soon 🤖',
    backMenu()
  );
}
bot.command('faq', (ctx) => showFaq(ctx));
bot.action('FAQ', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  return showFaq(ctx);
});

// ----- SUPPORT -----
async function showSupport(ctx) {
  await ctx.replyWithHTML(
    '🆘 <b>Need help?</b>\n\n' +
      '• Live support: <a href="https://loonieplay.com/support">Open support</a>\n' +
      '• Or ask your question here — our team is watching 👀',
    backMenu()
  );
}
bot.command('support', (ctx) => showSupport(ctx));
bot.action('SUPPORT', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  return showSupport(ctx);
});

// ----- VERIFY -----
async function showVerify(ctx) {
  await ctx.replyWithHTML(
    '🔐 <b>ID Verification</b>\n\n' +
      'OCR-based instant check is coming soon.\n' +
      'For now, you can link your Telegram via pre-verification.',
    Markup.inlineKeyboard([
      [Markup.button.callback('🚀 Start pre-verify', 'PREVERIFY')],
      [Markup.button.callback('⬅️ Back to menu', 'HOME')],
    ])
  );
}
bot.command('verify', (ctx) => showVerify(ctx));
bot.action('VERIFY', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  return showVerify(ctx);
});

bot.action('PREVERIFY', async (ctx) => {
  try { await ctx.answerCbQuery('Pre-verification saved'); } catch {}
  await ctx.reply(
    `${ai()} Pre-verification noted. You’ll get a ping when OCR is live.`,
    mainMenu()
  );
});

// ----- TOURNAMENTS -----
async function showTournaments(ctx) {
  await ctx.replyWithHTML(
    '🎮 <b>Upcoming Tournaments</b>\n\n' +
      '🏆 CS2 Weekend Showdown\n' +
      '🎲 Slot Spin-Off Battle\n' +
      '🕹️ 1v1 Loonie Arena\n\n' +
      'More info on our website.',
    Markup.inlineKeyboard([
      [Markup.button.url('📅 Tournaments', 'https://loonieplay.com/tournaments')],
      [Markup.button.callback('⬅️ Back to menu', 'HOME')],
    ])
  );
}
bot.command('tournament', (ctx) => showTournaments(ctx));
bot.action('TOURNAMENTS', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  return showTournaments(ctx);
});

// Back to menu
bot.action('HOME', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  return sendHome(ctx);
});

// ----- Lightweight AI-ish replies -----
bot.on('text', async (ctx) => {
  const m = (ctx.message.text || '').toLowerCase();
  if (m.includes('bonus')) return ctx.reply('🎁 Bonuses activate after your first deposit. Need help? Try /support');
  if (m.includes('withdraw')) return ctx.reply('💸 Withdrawals take 24–72h depending on method & verification.');
  if (m.includes('verify') || m.includes('id')) return ctx.reply('🔐 Use /verify to start your ID check.');
  if (m.includes('tournament')) return ctx.reply('🎮 Use /tournament for current events.');
  return ctx.reply('🤖 I’m learning. Use the menu or type /start.');
});

// ---------- webhook server (no polling, no bot.launch) ----------
const app = express();
app.use(express.json());

// health + static files
app.get('/', (_req, res) => res.status(200).send('LooniePlay Telegram bot is up.'));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Attach Telegraf webhook handler
app.use(bot.webhookCallback(HOOK_PATH));

async function bootstrap() {
  const fullHook = PUBLIC_BASE ? `${PUBLIC_BASE}${HOOK_PATH}` : null;

  try {
    if (fullHook) {
      const info = await bot.telegram.getWebhookInfo();
      if (info.url !== fullHook) {
        if (info.url) await bot.telegram.deleteWebhook();
        await bot.telegram.setWebhook(fullHook);
        console.log('🔗 Webhook set to:', fullHook);
      } else {
        console.log('🔗 Webhook already set:', fullHook);
      }
    } else {
      console.warn('No PUBLIC_BASE URL detected; server will run without setting a webhook.');
    }
  } catch (e) {
    console.warn('Setting webhook failed (non-fatal):', e?.message);
  }

  app.listen(PORT, () => {
    console.log(`✅ LooniePlay Bot is live and ready for 2025! Listening on ${PORT}`);
  });
}

bootstrap();
