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

// banners
const BANNER_URL =
  process.env.BANNER_URL ||
  (PUBLIC_BASE ? `${PUBLIC_BASE}/static/${encodeURIComponent('startonoctoberfirst!.gif')}` : '');

const AFFILIATE_BANNER_URL =
  process.env.AFFILIATE_BANNER_URL ||
  (PUBLIC_BASE ? `${PUBLIC_BASE}/static/${encodeURIComponent('becomeaaffiliate.gif')}` : '');

// affiliate urls (opt.)
const AFFILIATE_PORTAL_URL = process.env.AFFILIATE_PORTAL_URL || '';
const AFFILIATE_PAYOUTS_URL = process.env.AFFILIATE_PAYOUTS_URL || '';
const AFFILIATE_SUPPORT_URL = process.env.AFFILIATE_SUPPORT_URL || '';
const AFFILIATE_APPLY_URL = process.env.AFFILIATE_APPLY_URL || 'https://loonieplay.com/affiliates';

// Kevin contact (vast)
const KEVIN_FIRST = 'Kevin';
const KEVIN_LAST = 'Korthagen';
const KEVIN_EMAIL = 'Kevin@loonieplay.com';
const KEVIN_PHONE_E164 = '+31616146537';       // voor contactkaart
const KEVIN_PHONE_HUMAN = '+31 (0)6 16146537'; // voor weergave
const KEVIN_TG = (process.env.KEVIN_TG || '').replace(/^@/, ''); // optioneel (zonder @)
const KEVIN_LINKEDIN = process.env.KEVIN_LINKEDIN || '';

const KEVIN_VCARD =
  `BEGIN:VCARD
VERSION:3.0
N:${KEVIN_LAST};${KEVIN_FIRST};;;
FN:${KEVIN_FIRST} ${KEVIN_LAST}
ORG:LooniePlay
TEL;TYPE=CELL:${KEVIN_PHONE_E164}
EMAIL;TYPE=INTERNET:${KEVIN_EMAIL}
URL:https://loonieplay.com
END:VCARD`;

// UI
const mainMenu = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🎁 Promotions', 'PROMO'),  Markup.button.callback('📖 FAQ', 'FAQ')],
    [Markup.button.callback('🆘 Support', 'SUPPORT'),   Markup.button.callback('🔐 Verify Me', 'VERIFY')],
    [Markup.button.callback('🎮 Tournaments', 'TOURNAMENTS'), Markup.button.callback('🤝 Affiliates', 'AFFILIATES')],
  ]);

const backMenu = () => Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to menu', 'HOME')]]);
const ai = () => ['✨', '⚡', '🚀', '🤖', '🎯', '🧠'][Math.floor(Math.random() * 6)];

// ---------- middlewares ----------
bot.catch((err, ctx) => {
  console.error('Bot error on', ctx.updateType, err);
});

bot.use(async (ctx, next) => {
  try { if (ctx.chat?.type === 'private') await ctx.sendChatAction('typing'); } catch {}
  return next();
});

// slash commands
(async () => {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Open the main menu' },
      { command: 'promo', description: 'Today’s promotions' },
      { command: 'support', description: 'Contact support' },
      { command: 'verify', description: 'Start verification' },
      { command: 'faq', description: 'Top questions' },
      { command: 'tournament', description: 'Upcoming tournaments' },
      { command: 'affiliates', description: 'Affiliate info & join' },
      { command: 'help', description: 'What can this bot do?' },
    ]);
  } catch (e) {
    console.warn('setMyCommands failed (non-fatal):', e?.message);
  }
})();

// ---------- views / handlers ----------
async function sendHome(ctx) {
  const name = ctx.from?.first_name || 'Loonie';
  if (BANNER_URL) {
    try {
      await ctx.replyWithAnimation(BANNER_URL, {
        caption:
          `✨ Welcome, ${name}!\n\n` +
          `You're now chatting with the official <i>LooniePlay Bot</i>.\n` +
          `Pick an option below.`,
        parse_mode: 'HTML',
        reply_markup: mainMenu().reply_markup
      });
      return;
    } catch (e) { console.warn('Banner failed, fallback to text:', e.message); }
  }
  await ctx.replyWithMarkdown(
    `${ai()} *Welcome, ${name}!*` +
      `\n\nYou're now chatting with the official _LooniePlay Bot_.\nPick an option below.`,
    mainMenu()
  );
}

// /start & /help
bot.start(sendHome);
bot.command('menu', sendHome);
bot.help(async (ctx) => {
  await ctx.replyWithMarkdown(
    `${ai()} I can help with:\n` +
      `• /promo – promotions\n` +
      `• /support – help & contact\n` +
      `• /verify – start verification\n` +
      `• /faq – quick answers\n` +
      `• /tournament – events\n` +
      `• /affiliates – partner with us\n\n` +
      `Or just use the buttons below.`,
    mainMenu()
  );
});

// ----- PROMO -----
async function showPromo(ctx) {
  await ctx.replyWithHTML(
    '🎁 <b>Current promotions</b>\n\n' +
      '• 💯 100% welcome bonus\n' +
      '• 🎰 Free Spins Friday\n' +
      '• 🔄 LoonieSpin challenge\n\n' +
      'Use <b>/promo</b> anytime for updates.',
    Markup.inlineKeyboard([
      [Markup.button.url('🌐 Visit site', 'https://loonieplay.com')],
      [Markup.button.callback('⬅️ Back to menu', 'HOME')],
    ])
  );
}
bot.command('promo', (ctx) => showPromo(ctx));
bot.action('PROMO', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showPromo(ctx); });

// ----- FAQ -----
async function showFaq(ctx) {
  await ctx.replyWithHTML(
    '📖 <b>Top questions</b>\n\n' +
      '1️⃣ <b>How do I verify?</b> — Use <b>/verify</b>\n' +
      '2️⃣ <b>Where is my bonus?</b> — After first deposit 🎁\n' +
      '3️⃣ <b>Withdrawals?</b> — 24–72h via bank or crypto\n\n' +
      'AI-powered FAQ is coming soon 🤖',
    backMenu()
  );
}
bot.command('faq', (ctx) => showFaq(ctx));
bot.action('FAQ', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showFaq(ctx); });

// ----- SUPPORT -----
async function showSupport(ctx) {
  await ctx.replyWithHTML(
    '🆘 <b>Need help?</b>\n\n' +
      '• Live support: <a href="https://loonieplay.com/support">open support</a>\n' +
      '• Or ask your question here — our team is watching 👀',
    backMenu()
  );
}
bot.command('support', (ctx) => showSupport(ctx));
bot.action('SUPPORT', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showSupport(ctx); });

// ----- VERIFY -----
async function showVerify(ctx) {
  await ctx.replyWithHTML(
    '🔐 <b>ID verification</b>\n\n' +
      'OCR-based instant check is coming soon.\n' +
      'For now, you can link your Telegram via pre-verification.',
    Markup.inlineKeyboard([
      [Markup.button.callback('🚀 Start pre-verify', 'PREVERIFY')],
      [Markup.button.callback('⬅️ Back to menu', 'HOME')],
    ])
  );
}
bot.command('verify', (ctx) => showVerify(ctx));
bot.action('VERIFY', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showVerify(ctx); });
bot.action('PREVERIFY', async (ctx) => {
  try { await ctx.answerCbQuery('Pre-verification saved'); } catch {}
  await ctx.reply(`${ai()} Pre-verification noted. You’ll get a ping when OCR is live.`, mainMenu());
});

// ----- TOURNAMENTS -----
async function showTournaments(ctx) {
  await ctx.replyWithHTML(
    '🎮 <b>Upcoming tournaments</b>\n\n' +
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
bot.action('TOURNAMENTS', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showTournaments(ctx); });

// ----- AFFILIATES -----
function affiliatesRootKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🧑‍💻 I’m an affiliate', 'AFF_EXISTING'),
     Markup.button.callback('🚀 Become an affiliate', 'AFF_JOIN')],
    [Markup.button.callback('⬅️ Back to menu', 'HOME')],
  ]);
}

async function showAffiliates(ctx) {
  await ctx.replyWithHTML('🤝 <b>Affiliates</b>\n\nChoose your path:', affiliatesRootKeyboard());
}
bot.command('affiliates', (ctx) => showAffiliates(ctx));
bot.action('AFFILIATES', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showAffiliates(ctx); });

// Existing affiliates (2 kolommen)
async function showExistingAffiliate(ctx) {
  const btns = [];
  if (AFFILIATE_PORTAL_URL)  btns.push(Markup.button.url('🔐 Login to portal',  AFFILIATE_PORTAL_URL));
  if (AFFILIATE_PAYOUTS_URL) btns.push(Markup.button.url('💸 Payouts & terms',  AFFILIATE_PAYOUTS_URL));
  if (AFFILIATE_SUPPORT_URL) btns.push(Markup.button.url('🆘 Affiliate support', AFFILIATE_SUPPORT_URL));

  const rows = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  rows.push([Markup.button.callback('⬅️ Back', 'AFFILIATES'), Markup.button.callback('🏠 Menu', 'HOME')]);

  await ctx.replyWithHTML(
    '🧑‍💻 <b>Resources for existing affiliates</b>\n\nUse the buttons below.',
    Markup.inlineKeyboard(rows)
  );
}
bot.action('AFF_EXISTING', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showExistingAffiliate(ctx); });

// Become affiliate (Kevin) — topknop = brede DM
async function showJoinAffiliate(ctx) {
  const rows = [];

  if (KEVIN_TG) {
    rows.push([Markup.button.url('💬 DM Kevin! (fastest)', `https://t.me/${KEVIN_TG}`)]);
  } else {
    rows.push([Markup.button.callback('💬 DM Kevin! (fastest)', 'AFF_DM_MISSING')]);
  }

  rows.push([
    Markup.button.callback(`📞 Call Kevin (${KEVIN_PHONE_HUMAN})`, 'AFF_CALL_KEVIN'),
    Markup.button.callback('✉️ Email Kevin', 'AFF_EMAIL_KEVIN'),
  ]);

  const row3 = [];
  if (KEVIN_LINKEDIN)      row3.push(Markup.button.url('🔗 LinkedIn', KEVIN_LINKEDIN));
  if (AFFILIATE_APPLY_URL) row3.push(Markup.button.url('✅ Apply now', AFFILIATE_APPLY_URL));
  if (row3.length) rows.push(row3);

  rows.push([Markup.button.callback('⬅️ Back', 'AFFILIATES'), Markup.button.callback('🏠 Menu', 'HOME')]);

  const caption =
    '🚀 <b>Become an affiliate</b>\n\n' +
    'Meet <b>Kevin Korthagen</b> — Affiliate Manager.\n' +
    'Choose how you want to connect:';

  if (AFFILIATE_BANNER_URL) {
    try {
      await ctx.replyWithAnimation(AFFILIATE_BANNER_URL, {
        caption,
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard(rows).reply_markup,
      });
      return;
    } catch (e) {
      console.warn('Affiliate banner failed, fallback to text:', e.message);
    }
  }

  await ctx.replyWithHTML(caption, Markup.inlineKeyboard(rows));
}
bot.action('AFF_JOIN', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return showJoinAffiliate(ctx); });

// Fallback wanneer KEVIN_TG niet is gezet (DM-knop kan dan niet naar een URL)
bot.action('AFF_DM_MISSING', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  await ctx.reply(
    '💬 Telegram DM is nog niet geconfigureerd.\n' +
    'Tip voor beheerder: zet de env var KEVIN_TG naar Kevins handle (zonder @), bv. KEVIN_TG=KevinKorthagen, en redeploy.\n\n' +
    'Gebruik intussen de knoppen hieronder.',
    Markup.inlineKeyboard([
      [
        Markup.button.callback(`📞 Call Kevin (${KEVIN_PHONE_HUMAN})`, 'AFF_CALL_KEVIN'),
        Markup.button.callback('✉️ Email Kevin', 'AFF_EMAIL_KEVIN')
      ],
      [Markup.button.callback('⬅️ Back', 'AFFILIATES'), Markup.button.callback('🏠 Menu', 'HOME')]
    ])
  );
});

// Call / Email actions
bot.action('AFF_CALL_KEVIN', async (ctx) => {
  try { await ctx.answerCbQuery('Sending contact…'); } catch {}
  await ctx.replyWithContact(KEVIN_PHONE_E164, KEVIN_FIRST, { last_name: KEVIN_LAST, vcard: KEVIN_VCARD });
  await ctx.reply(
    `📞 Tap the contact above to call ${KEVIN_FIRST}.`,
    Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'AFFILIATES'), Markup.button.callback('🏠 Menu', 'HOME')]])
  );
});

bot.action('AFF_EMAIL_KEVIN', async (ctx) => {
  try { await ctx.answerCbQuery(); } catch {}
  await ctx.replyWithHTML(
    `✉️ Email <b>${KEVIN_FIRST} ${KEVIN_LAST}</b>: <a href="mailto:${KEVIN_EMAIL}">${KEVIN_EMAIL}</a>`,
    Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'AFFILIATES'), Markup.button.callback('🏠 Menu', 'HOME')]])
  );
});

// Back to menu
bot.action('HOME', async (ctx) => { try { await ctx.answerCbQuery(); } catch {} return sendHome(ctx); });

// ----- lightweight AI-ish replies -----
bot.on('text', async (ctx) => {
  const m = (ctx.message.text || '').toLowerCase();
  if (m.includes('bonus')) return ctx.reply('🎁 Bonuses activate after your first deposit. Need help? Try /support');
  if (m.includes('withdraw')) return ctx.reply('💸 Withdrawals take 24–72h depending on method & verification.');
  if (m.includes('verify') || m.includes('id')) return ctx.reply('🔐 Use /verify to start your ID check.');
  if (m.includes('tournament')) return ctx.reply('🎮 Use /tournament for current events.');
  if (m.includes('affiliate')) return showAffiliates(ctx);
  return ctx.reply('🤖 I’m learning. Use the menu or type /start.');
});

// ---------- webhook server (no polling) ----------
const app = express();
app.use(express.json());

// health + static
app.get('/', (_req, res) => res.status(200).send('LooniePlay Telegram bot is up.'));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.use('/static', express.static(path.join(__dirname, 'public')));

// webhook
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
