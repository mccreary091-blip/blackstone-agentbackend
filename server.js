const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: process.env.GMAIL_USER,
pass: process.env.GMAIL_APP_PASSWORD
}
});

const SYSTEM_PROMPT = `You are the AI assistant for BlackStone, an agency offering copywriting and marketing, AI chatbots, and lead qualifying agents. Your job is to answer visitor questions, qualify leads, and collect their name, email, and what they need help with before offering a booking link. Hold pricing ranges firmly and do not negotiate. If asked about something BlackStone does not offer, be honest and redirect to what BlackStone does offer. Stay calm and professional even if provoked.`;

function extractEmail(text) {
const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
return match ? match[0] : null;
}

https://www.google.com/url?q=http://app.post&source=gmail&ust=1786081300803000&sa=E('/api/chat', async (req, res) => {
try {
const { messages, leadInfo } = req.body;

const completion = await openai.chat.completions.create({
model: 'gpt-4o-mini',
messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
});

const reply = completion.choices[0].message.content;

const fullText = messages.map(m => m.content).join(' ');
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
