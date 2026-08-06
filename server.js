===========================================
FILE 1: index.html
============================================
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlackStone | Writing, Marketing and AI Agents</title>
<style>
:root{
--black:#0b0b0b;
--cream:#f3ead9;
--gray:#9a9a9a;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{
background:var(--black);
color:var(--cream);
font-family:Georgia, 'Times New Roman', serif;
line-height:1.6;
}
header{
display:flex;
justify-content:space-between;
align-items:center;
padding:24px 48px;
border-bottom:1px solid rgba(243,234,217,0.15);
}
.logo{
display:flex;
align-items:center;
gap:12px;
font-size:22px;
letter-spacing:3px;
font-weight:bold;
}
.logo svg{width:28px;height:28px;}
nav a{
color:var(--cream);
text-decoration:none;
margin-left:32px;
font-size:14px;
letter-spacing:1px;
opacity:0.85;
}
nav a:hover{opacity:1;}
.hero{
text-align:center;
padding:120px 24px 100px;
max-width:900px;
margin:0 auto;
}
.hero h1{
font-size:46px;
line-height:1.3;
margin-bottom:24px;
}
.hero p{
font-size:18px;
color:var(--gray);
max-width:600px;
margin:0 auto 40px;
}
.cta{
display:inline-block;
background:var(--cream);
color:var(--black);
padding:16px 36px;
text-decoration:none;
font-size:14px;
letter-spacing:2px;
font-weight:bold;
}
.rule{
width:60px;
height:1px;
background:var(--cream);
margin:24px auto;
opacity:0.4;
}
.services{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:32px;
padding:80px 48px;
max-width:1100px;
margin:0 auto;
}
.service-card{
border:1px solid rgba(243,234,217,0.15);
padding:32px;
text-align:center;
}
.service-card h3{
font-size:20px;
margin-bottom:16px;
letter-spacing:1px;
}
.service-card p{
color:var(--gray);
font-size:15px;
}
footer{
text-align:center;
padding:40px;
color:var(--gray);
font-size:13px;
border-top:1px solid rgba(243,234,217,0.15);
}
#chat-widget-container{
position:fixed;
bottom:24px;
right:24px;
z-index:9999;
}
</style>
</head>
<body>

<header>
<div class="logo">
<svg viewBox="0 0 24 24" fill="none" xmlns="https://www.google.com/url?q=http://www.w3.org/2000/svg&source=gmail&ust=1786075966822000&sa=E">
<polygon points="12,2 21,8 18,22 6,22 3,8" stroke="#f3ead9" stroke-width="1.2"/>
<circle cx="12" cy="2" r="1.4" fill="#f3ead9"/>
<circle cx="21" cy="8" r="1.4" fill="#f3ead9"/>
<circle cx="18" cy="22" r="1.4" fill="#f3ead9"/>
<circle cx="6" cy="22" r="1.4" fill="#f3ead9"/>
<circle cx="3" cy="8" r="1.4" fill="#f3ead9"/>
</svg>
BLACKSTONE
</div>
<nav>
<a href="#services">Services</a>
<a href="#about">About</a>
<a href="#contact">Contact</a>
</nav>
</header>

<section class="hero">
<h1>Words that convert. Agents that work around the clock.</h1>
<div class="rule"></div>
<p>BlackStone blends sharp copywriting with intelligent AI agents to grow your business, capture every lead, and free up your time.</p>
<a class="cta" href="#contact">BOOK A CALL</a>
</section>

<section class="services" id="services">
<div class="service-card">
<h3>Copywriting and Marketing</h3>
<p>Email campaigns, SEO content, and ad copy engineered to sell.</p>
</div>
<div class="service-card">
<h3>AI Chatbots</h3>
<p>Always-on assistants that answer questions and represent your brand.</p>
</div>
<div class="service-card">
<h3>Lead Qualifying Agents</h3>
<p>Real conversations that score leads and book calls automatically.</p>
</div>
</section>

<footer id="contact">
BlackStone Franchise. All rights reserved. Reach out through the chat to book a call.
</footer>

<div id="chat-widget-container"></div>
<script src="agent-widget.js"></script>

</body>
</html>


============================================
FILE 2: agent-widget.js
============================================
(function(){
const API_URL = "https://www.google.com/url?q=https://YOUR-RENDER-APP.onrender.com/api/chat&source=gmail&ust=1786075966822000&sa=E";

const container = document.getElementById("chat-widget-container");

const style = document.createElement("style");
style.textContent = `
#bs-chat-bubble{
width:60px;height:60px;border-radius:50%;
background:#f3ead9;color:#0b0b0b;
display:flex;align-items:center;justify-content:center;
font-size:26px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.4);
}
#bs-chat-window{
display:none;flex-direction:column;
width:340px;height:460px;
background:#0b0b0b;border:1px solid rgba(243,234,217,0.2);
position:absolute;bottom:76px;right:0;
font-family:Georgia,serif;
}
#bs-chat-header{
background:#f3ead9;color:#0b0b0b;padding:14px 16px;
font-weight:bold;letter-spacing:1px;font-size:14px;
}
#bs-chat-messages{
flex:1;overflow-y:auto;padding:12px;color:#f3ead9;font-size:14px;
}
.bs-msg{margin-bottom:10px;line-height:1.4;}
.bs-msg.user{color:#f3ead9;text-align:right;}
.bs-msg.agent{color:#d8cdb8;text-align:left;}
#bs-chat-input-row{
display:flex;border-top:1px solid rgba(243,234,217,0.15);
}
#bs-chat-input{
flex:1;background:#0b0b0b;color:#f3ead9;border:none;
padding:12px;font-size:14px;outline:none;
}
#bs-chat-send{
background:#f3ead9;color:#0b0b0b;border:none;
padding:0 16px;cursor:pointer;font-weight:bold;
}
`;
document.head.appendChild(style);

container.innerHTML = `
<div id="bs-chat-window">
<div id="bs-chat-header">BlackStone Assistant</div>
<div id="bs-chat-messages"></div>
<div id="bs-chat-input-row">
<input id="bs-chat-input" type="text" placeholder="Type a message..." />
<button id="bs-chat-send">Send</button>
</div>
</div>
<div id="bs-chat-bubble">Chat</div>
`;

const bubble = document.getElementById("bs-chat-bubble");
const win = document.getElementById("bs-chat-window");
const messages = document.getElementById("bs-chat-messages");
const input = document.getElementById("bs-chat-input");
const sendBtn = document.getElementById("bs-chat-send");

let history = [];
let leadInfo = {};

bubble.addEventListener("click", () => {
win.style.display = win.style.display === "flex" ? "none" : "flex";
if(messages.children.length === 0){
addMessage("agent", "Hi, I'm the BlackStone assistant. What brings you here today, are you looking for copywriting, an AI agent, or lead generation help?");
}
});

function addMessage(role, text){
const div = document.createElement("div");
div.className = "bs-msg " + role;
div.textContent = text;
messages.appendChild(div);
messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(){
const text = input.value.trim();
if(!text) return;
addMessage("user", text);
input.value = "";
history.push({role:"user", content:text});

try{
const res = await fetch(API_URL, {
method:"POST",
headers:{"Content-Type":"application/json"},
body: JSON.stringify({ messages: history, leadInfo })
});
const data = await res.json();
addMessage("agent", data.reply);
history.push({role:"assistant", content:data.reply});
if(data.leadInfo){ leadInfo = data.leadInfo; }
if(data.bookingLink){
addMessage("agent", "You can book a call here: " + data.bookingLink);
}
}catch(err){
addMessage("agent", "Sorry, something went wrong on my end. Please try again in a moment.");
}
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
if(e.key === "Enter") sendMessage();
});
})();


============================================
FILE 3: server.js
============================================
// BlackStone Agent Backend
// Node.js + Express server
// Handles chat agent logic, lead capture, and email notifications

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.GMAIL_USER,
pass: process.env.GMAIL_APP_PASSWORD
}
});

const BOOKING_LINK = process.env.BOOKING_LINK || "https://www.google.com/url?q=https://calendar.google.com/your-booking-link&source=gmail&ust=1786075966823000&sa=E";
const OWNER_EMAIL = process.env.OWNER_EMAIL;

const SYSTEM_PROMPT = `
You are the BlackStone Assistant, representing BlackStone, a company offering
copywriting and marketing services (email campaigns, SEO, ads) as well as AI
chatbots, lead qualifying agents, and full operations agents.

Tone: confident, polished, sharp consultant. Not casual or overly chipper.
Match the upscale black and cream brand identity.

Your goals, in order:
1. Understand what the visitor needs.
2. Collect their name, email, and a short description of their need before
offering the booking link.
3. Hold pricing ranges when asked directly, but do not negotiate. Redirect
to the value and outcome, and steer toward booking a call for exact pricing.
4. If asked about something BlackStone does not offer, be honest and redirect
to the closest real service.
5. If a visitor goes off topic, redirect briefly and warmly back to business.
6. Stay calm and non-defensive if tested or provoked.
7. Once name, email, and need are all collected, tell them you will pass
their info along and share the booking link so they can grab a time.

Never invent details about pricing beyond general ranges. Never promise
specific outcomes.
`;

function extractLeadInfo(messages, leadInfo) {
const text = messages.map(m => m.content).join(" ");
const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
if (emailMatch && !leadInfo.email) leadInfo.email = emailMatch[0];
return leadInfo;
}

async function notifyOwner(leadInfo, transcript) {
if (!OWNER_EMAIL) return;
await transporter.sendMail({
from: process.env.GMAIL_USER,
to: OWNER_EMAIL,
subject: `New BlackStone lead: ${leadInfo.name || "Unknown"}`,
text: `Name: ${leadInfo.name || "N/A"}
Email: ${leadInfo.email || "N/A"}
Need: ${leadInfo.need || "N/A"}

Transcript:
${transcript}`
});
}

https://www.google.com/url?q=http://app.post&source=gmail&ust=1786075966823000&sa=E("/api/chat", async (req, res) => {
try {
const { messages, leadInfo = {} } = req.body;

const updatedLead = extractLeadInfo(messages, leadInfo);

const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
messages: [
{ role: "system", content: SYSTEM_PROMPT },
{ role: "system", content: `Known lead info so far: ${JSON.stringify(updatedLead)}` },
...messages
],
temperature: 0.6
});

const reply = completion.choices[0].message.content;

const readyForBooking = updatedLead.name && updatedLead.email && updatedLead.need;
let bookingLink = null;

if (readyForBooking && !updatedLead.notified) {
updatedLead.notified = true;
bookingLink = BOOKING_LINK;
const transcript = messages.map(m => `${m.role}: ${m.content}`).join("\n");
await notifyOwner(updatedLead, transcript);
}

res.json({ reply, leadInfo: updatedLead, bookingLink });
} catch (err) {
console.error(err);
res.status(500).json({ reply: "Something went wrong. Please try again shortly." });
}
});

app.get("/", (req, res) => res.send("BlackStone agent backend is running."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BlackStone backend running on port ${PORT}`));


============================================
FILE 4: package.json
============================================
{
"name": "blackstone-agent-backend",
"version": "1.0.0",
"main": "server.js",
"scripts": {
"start": "node server.js"
},
"dependencies": {
"express": "^4.19.2",
"cors": "^2.8.5",
"nodemailer": "^6.9.13",
"openai": "^4.47.1"
}
}


============================================
FILE 5: .env.example (for reference - don't upload real keys to GitHub)
============================================
OPENAI_API_KEY=your_openai_api_key_here
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
OWNER_EMAIL=robert_email@example.com
BOOKING_LINK=https://www.google.com/url?q=https://calendar.google.com/your-real-booking-link&source=gmail&ust=1786075966823000&sa=E
PORT=3000

