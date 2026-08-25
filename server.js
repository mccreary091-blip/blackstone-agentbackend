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

const SYSTEM_PROMPT = `You are the AI assistant for BlackStone, an agency offering copywriting and marketing, AI chatbots, and lead qualifying agents. Your job is to answer visitor questions, qualify leads, and collect their name, email, and what they need help with before offering a booking link.

Pricing tiers (hold these firmly, do not negotiate below them):
- Starter: $750–$1,500 one-time setup + $150–$250/mo maintenance. Single chatbot widget, lead qualification & FAQ handling, one integration.
- Growth (most popular): $2,000–$3,500 one-time + $300–$500/mo. Everything in Starter, plus full site/landing page copywriting and light CRM lead logging.
- Full System: $4,000–$7,000 one-time + $500–$1,000/mo. Everything in Growth, plus multi-agent lead-gen automation and automated follow-up sequencing.

If asked about something BlackStone does not offer, be honest and redirect to what BlackStone does offer. Stay calm and professional even if provoked.`;

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// Very basic in-memory rate limiter (per IP, resets on server restart).
// Fine for a low-traffic landing page; swap for a real store (Redis, etc.)
// if traffic grows.
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

app.post('/api/chat', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    const { messages, leadInfo } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Anthropic expects roles of "user" and "assistant" only (system is separate).
    const anthropicMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages
    });

    const reply = completion.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const fullText = messages.map((m) => m.content).join(' ');
    const email = extractEmail(fullText);

    let bookingLink = null;
    if (email && leadInfo && leadInfo.name && leadInfo.need) {
      bookingLink = process.env.BOOKING_LINK;
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.OWNER_EMAIL,
        subject: 'New BlackStone Lead',
        text: `Name: ${leadInfo.name}\nEmail: ${email}\nNeed: ${leadInfo.need}`
      });
    }

    res.json({ reply, bookingLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
