require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Startcommand – welkom en UX-gerichte categoriekeuze
bot.start((ctx) => {
  const name = ctx.from.first_name || 'there';
  ctx.replyWithMarkdownV2(`
👋 *Hey ${name}, welcome to LooniePlay\!*  

🎰 *Choose a category to get started:*

🎁 *Promotions* → type /promo  
🎮 *Tournaments* → type /tournament  
🔐 *Verify Account* → type /verify  

📚 *Help & Support:*  
❓ /faq – Frequent questions  
🆘 /support – Contact our team  

🚀 _Let’s play, win, and get rewarded\._  
  `);
});

// === Casino section ===

// /promo – promotions
bot.command('promo', (ctx) => {
  ctx.replyWithMarkdownV2(`
🎁 *Current Promotions:*
• 100% Welcome Bonus  
• 🎡 *LoonieSpin Friday* – Free Spins for all  
• 🎯 Weekly Wager Challenge  

🌍 Visit [LooniePlay Promotions](https://loonieplay.com/promos) for full details
  `);
});

// /tournament – tournaments info
bot.command('tournament', (ctx) => {
  ctx.replyWithMarkdownV2(`
🎮 *This Week’s Tournaments:*

🏆 *LoonieCash Cup* – $1,000 prize pool  
🎲 *Slot Showdown* – Win Free Spins  
🕹️ *Live Casino Battles* – Join daily

🔗 Register & Play: [loonieplay.com/tournaments](https://loonieplay.com/tournaments)
  `);
});

// /verify – Verification process
bot.command('verify', (ctx) => {
  ctx.replyWithMarkdownV2(`
🔐 *Account Verification*  
To keep our platform safe, please upload a *clear photo of your ID*\.

📸 This feature will soon be automated using OCR\!  
In the meantime, send your image here securely and our team will review it within 24 hours.
  `);
});

// === Help section ===

// /faq – Frequently asked questions
bot.command('faq', (ctx) => {
  ctx.replyWithMarkdownV2(`
📚 *Frequently Asked Questions*  
1️⃣ How do I verify my account? → /verify  
2️⃣ When do I receive my bonus?  
3️⃣ How long do withdrawals take?  
4️⃣ Can I use crypto to deposit?

💬 For more: [FAQ Page](https://loonieplay.com/faq)
  `);
});

// /support – Contact support
bot.command('support', (ctx) => {
  ctx.replyWithMarkdownV2(`
🆘 *Need help?*  
Our team is available 24/7 via:

📩 Live Chat: [loonieplay.com/support](https://loonieplay.com/support)  
📧 Email: support@loonieplay.com  
📱 Telegram: @LooniePlaySupport
  `);
});

// === About command (optional)
bot.command('about', (ctx) => {
  ctx.replyWithMarkdownV2(`
ℹ️ *About LooniePlay*  
We’re the most dynamic casino experience of 2025\.

🎰 Built for gamers  
🎁 Rewarding every session  
🛡️ Fair, safe, and transparent

🌐 Visit [LooniePlay.com](https://loonieplay.com) for the full experience\.
  `);
});

// === Help command (overview of all commands)
bot.command('help', (ctx) => {
  ctx.replyWithMarkdownV2(`
🧭 *Command Overview*  
🎰 Casino  
- /promo – Current promotions  
- /tournament – Ongoing tournaments  
- /verify – Account verification  

📚 Help  
- /faq – Frequently asked questions  
- /support – Contact support  
- /about – Info about LooniePlay
  `);
});

// === Unknown commands fallback
bot.on('text', (ctx) => {
  const message = ctx.message.text;
  if (!message.startsWith('/')) return;

  ctx.replyWithMarkdownV2(`
❌ Unknown command: *${message}*  
Type */help* to see all available options.
  `);
});

// === Launch bot ===
bot.launch();
console.log('✅ LooniePlay Bot is live');
