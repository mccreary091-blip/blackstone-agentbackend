const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Where lead emails and alerts go. Falls back to your Gmail if OWNER_EMAIL isn't set.
const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.GMAIL_USER;

// Booking link: reads BOOKING_LINK from Render, falls back to the current Calendly link.
const BOOKING_LINK =
  process.env.BOOKING_LINK || 'https://calendly.com/blackstonewriting-teamup/30min';

const SYSTEM_PROMPT = `You are the AI assistant for BlackStone, an agency offering copywriting and marketing, AI chatbots, and lead qualifying agents. Your job is to answer visitor questions, qualify leads, and collect their name, email, and what they need help with before offering a booking link. When a visitor is ready to talk, invite them to book a free consultation at ${BOOKING_LINK}

Pricing tiers (hold these firmly, do not negotiate below them):
- Starter: $750–$1,500 one-time setup + $150–$250/mo maintenance. Single chatbot widget, lead qualification & FAQ handling, one integration.
- Growth (most popular): $2,000–$3,500 one-time + $300–$500/mo. Everything in Starter, plus full site/landing page copywriting and light CRM lead logging.
- Full System: $4,000–$7,000 one-time + $500–$1,000/mo. Everything in Growth, plus multi-agent lead-gen automation and automated follow-up sequencing.

If asked about something BlackStone does not offer, be honest and redirect to what BlackStone does offer. Stay calm and professional even if provoked.`;

// Friendly message visitors see if the AI is down.
const FALLBACK_REPLY = `Sorry, I'm having a brief technical hiccup. You can book a free consultation directly here: ${BOOKING_LINK} — or email us at ${OWNER_EMAIL} and we'll get right back to you.`;

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// ---------- ALERTS ----------
// Emails you when something breaks. Limited to one email per error type
// every 15 minutes, so a big outage doesn't flood your inbox.
const ALERT_COOLDOWN_MS = 15 * 60 * 1000;
const lastAlertSent = new Map();

async function sendAlert(type, err, messages) {
  const now = Date.now();
  if (now - (lastAlertSent.get(type) || 0) < ALERT_COOLDOWN_MS) return;
  lastAlertSent.set(type, now);

  const errorText = err && err.message ? err.message : String(err);
  const status = err && err.status ? ` (status ${err.status})` : '';
  const recent = Array.isArray(messages)
    ? messages
        .slice(-4)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n')
    : '(no conversation)';

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: OWNER_EMAIL,
      subject: `BlackStone ALERT: ${type}`,
      text:
        `Something went wrong on the BlackStone backend.\n\n` +
        `Type: ${type}\n` +
        `Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Central)\n` +
        `Error: ${errorText}${status}\n\n` +
        `Last messages:\n${recent}\n\n` +
        `Tip: if the error mentions "credit balance", top up at console.anthropic.com.`
    });
  } catch (mailErr) {
    // If even the alert email fails, at least log it in Render.
    console.error('Alert email failed:', mailErr);
  }
}

// Calls Claude, retrying once after a short pause if the first try fails.
async function askClaudeWithRetry(anthropicMessages) {
  const request = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: anthropicMessages
  };
  try {
    return await anthropic.messages.create(request);
  } catch (firstErr) {
    console.error('Claude call failed, retrying once:', firstErr.message);
    await new Promise((r) => setTimeout(r, 1500));
    return await anthropic.messages.create(request);
  }
}

// Very basic in-memory rate limiter (per IP, resets on server restart).
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

// ---------- HEALTH CHECK ----------
// UptimeRobot pings this every few minutes. Also keeps Render's free tier awake.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---------- CHAT ----------
app.post('/api/chat', async (req, res) => {
  const { messages, leadInfo } = req.body || {};

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const anthropicMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    // 1. Get Claude's reply (with one retry). If it still fails, alert you
    //    and give the visitor the friendly fallback instead of an error.
    let reply;
    try {
      const completion = await askClaudeWithRetry(anthropicMessages);
      reply = completion.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');
    } catch (aiErr) {
      console.error('Claude failed after retry:', aiErr);
      await sendAlert('AI reply failed', aiErr, messages);
      return res.json({ reply: FALLBACK_REPLY, bookingLink: BOOKING_LINK });
    }

    // 2. Lead notification. If this email fails, the visitor still gets
    //    their reply, and you get an alert so the lead isn't lost.
    const fullText = messages.map((m) => m.content).join(' ');
    const email = extractEmail(fullText);

    let bookingLink = null;
    if (email && leadInfo && leadInfo.name && leadInfo.need) {
      bookingLink = BOOKING_LINK;
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: OWNER_EMAIL,
          subject: 'New BlackStone Lead',
          text: `Name: ${leadInfo.name}\nEmail: ${email}\nNeed: ${leadInfo.need}`
        });
      } catch (mailErr) {
        console.error('Lead email failed:', mailErr);
        await sendAlert('Lead email failed', mailErr, messages);
      }
    }

    res.json({ reply, bookingLink });
  } catch (err) {
    console.error(err);
    await sendAlert('Unexpected server error', err, messages);
    res.json({ reply: FALLBACK_REPLY, bookingLink: BOOKING_LINK });
  }
});

// Catch crashes that happen outside a request.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  sendAlert('Unhandled rejection', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  sendAlert('Uncaught exception', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
