# 🎤 Voice Based AI Legal Assistant

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge&logo=vercel)](https://legal-assistant-client.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Active-green?style=for-the-badge&logo=node.js)](https://legal-assistant-rust.vercel.app)

**Voice-powered legal assistant with AI-driven responses**

🌐 **[Try It Live](https://legal-assistant-client.vercel.app)** | 🔗 **[API Docs](https://legal-assistant-rust.vercel.app/api/health)**

</div>

---

## 🚀 Features

- 🎙️ **Voice Recording** - Speak your legal questions naturally
- 🤖 **AI-Powered Responses** - Context-aware answers using Google Gemini 2.5
- 🗣️ **Text-to-Speech** - Listen to AI responses with premium voices
- 💬 **Conversation History** - Maintains context across questions
- 🌍 **Multi-Jurisdiction** - Indian, US, UK, and General law support
- 🎨 **Modern Dark UI** - Beautiful, responsive interface

---

## 🛠️ Tech Stack

**Frontend:** React + Vite + Material-UI  
**Backend:** Node.js + Express + MongoDB  
**AI/Voice:** Google Gemini + Deepgram  
**Deployment:** Vercel (Serverless)

---

## 📦 Installation

```
# Clone repository
git clone https://github.com/YOUR_USERNAME/ai-legal-assistant.git
cd ai-legal-assistant

# Setup backend
cd server
npm install
# Create .env with: MONGODB_URI, GEMINI_API_KEY, DEEPGRAM_API_KEY
npm run dev

# Setup frontend (new terminal)
cd client
npm install
# Create .env with: VITE_API_URL=http://localhost:5000
npm run dev
```

Visit `http://localhost:5173`

---

## 🏗️ Architecture

```
Voice Input → Deepgram STT → Transcript Display
    ↓
Google Gemini AI → Context-Aware Response
    ↓
Deepgram TTS → Audio Playback + Text
```

---

## 📡 API Endpoints

**Base URL:** `https://legal-assistant-rust.vercel.app/api`

- `POST /users/register` - Register new user
- `GET /users/:userId` - Get user details
- `PUT /users/:userId/preferences` - Update preferences
- `POST /conversations/transcribe` - Convert speech to text
- `POST /conversations/process-query` - Get AI response
- `GET /conversations/user/:userId` - Get conversation history

---

## 🎯 Key Features

**Voice Processing:**
- Deepgram Nova-2 for speech-to-text
- Real-time transcription display
- 10+ premium voice options for TTS

**AI Intelligence:**
- Google Gemini 2.5 Flash
- Conversation context tracking
- Customizable tone (formal/casual/technical)

**User Experience:**
- 80/20 split layout (Chat/Controls)
- Dark theme with smooth animations
- Progress indicators and status updates

---

## 🔐 Environment Variables

**Server (.env):**
```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
DEEPGRAM_API_KEY=your_deepgram_key
```

**Client (.env):**
```
VITE_API_URL=your_backend_url
```

---

## 📝 License

MIT License - feel free to use for your projects!

---

<div align="center">

**Built with ❤️ using React, Node.js, Gemini AI, and Deepgram**

</div>
```
