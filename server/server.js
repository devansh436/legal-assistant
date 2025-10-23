const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });
const path = require('path');

// Serve static audio files
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import Routes
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// gemini response
app.get('/test-gemini', async (req, res) => {
  const { generateLegalResponse } = require('./services/geminiService');
  
  try {
    const testMessages = [
      { role: 'user', content: 'What is Section 420 of IPC?' }
    ];
    
    const response = await generateLegalResponse(testMessages, {
      jurisdiction: 'Indian',
      conversationStyle: 'formal'
    });
    
    res.json({ 
      success: true, 
      question: testMessages[0].content,
      response: response 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// Test Deepgram API connection
app.get('/test-deepgram', async (req, res) => {
  const { createClient } = require('@deepgram/sdk');
  
  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    
    // Test Text-to-Speech (simplest test)
    const response = await deepgram.speak.request(
      { text: "Hello, this is a test of Deepgram text to speech." },
      { model: "aura-asteria-en" }
    );
    
    const stream = await response.getStream();
    const buffer = await getAudioBuffer(stream);
    
    res.json({ 
      success: true, 
      message: 'Deepgram TTS working',
      audioSize: buffer.length + ' bytes',
      creditsInfo: 'Check console.deepgram.com for balance'
    });
  } catch (error) {
    console.error('Deepgram Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper to convert stream to buffer
async function getAudioBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Add to server.js
const fs = require('fs').promises;

// Clean up old audio files every hour
setInterval(async () => {
  try {
    const audioDir = path.join(__dirname, 'public', 'audio');
    const files = await fs.readdir(audioDir);
    const now = Date.now();
    
    for (const file of files) {
      const filepath = path.join(audioDir, file);
      const stats = await fs.stat(filepath);
      const age = now - stats.mtimeMs;
      
      // Delete files older than 1 hour
      if (age > 60 * 60 * 1000) {
        await fs.unlink(filepath);
        console.log('🗑️ Deleted old audio:', file);
      }
    }
  } catch (error) {
    console.error('Error cleaning audio files:', error);
  }
}, 60 * 60 * 1000); // Run every hour


// Test Deepgram Speech-to-Text
app.post('/test-deepgram-stt', upload.any(), async (req, res) => {
  const { createClient } = require('@deepgram/sdk');
  
  try {
    // Check if any file was uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No audio file uploaded',
        help: 'Upload an audio file in form-data with any field name'
      });
    }

    const audioFile = req.files[0]; // Get first uploaded file
    
    console.log('📁 File received:', audioFile.originalname);

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    
    // Transcribe the uploaded audio
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioFile.buffer,
      {
        model: 'nova-2',
        smart_format: true,
      }
    );

    if (error) {
      throw error;
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    res.json({
      success: true,
      transcript: transcript,
      confidence: result.results.channels[0].alternatives[0].confidence
    });
  } catch (error) {
    console.error('❌ Deepgram STT Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// Add to server.js
app.get('/check-gemini-status', async (req, res) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const result = await model.generateContent("Test");
    
    res.json({
      status: 'Available',
      message: 'Gemini API is working',
      response: result.response.text()
    });
  } catch (error) {
    res.json({
      status: 'Error',
      message: error.message,
      isRateLimit: error.message.includes('429') || error.message.includes('rate limit')
    });
  }
});



// Test Deepgram Voice Agent API initialization
app.get('/test-voice-agent', async (req, res) => {
  const { createClient } = require('@deepgram/sdk');
  
  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    
    // Check if we can initialize voice agent
    const agentConfig = {
      listen: {
        model: 'nova-2',
        language: 'en',
      },
      speak: {
        model: 'aura-asteria-en',
      }
    };
    
    res.json({
      success: true,
      message: 'Voice Agent API ready',
      config: agentConfig,
      note: 'WebSocket connection needed for full test'
    });
  } catch (error) {
    console.error('Voice Agent Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


  
// WebSocket Server for Deepgram Voice Agent
const wss = new WebSocket.Server({ server });

const { handleVoiceAgentConnection } = require('./services/deepgramAgentService');

wss.on('connection', (clientWs, req) => {
  console.log('🎤 New WebSocket client connected');
  
  // Extract userId from query params
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    clientWs.send(JSON.stringify({ error: 'userId required' }));
    clientWs.close();
    return;
  }

  // Handle voice agent connection
  handleVoiceAgentConnection(clientWs, userId);
  
  clientWs.on('close', () => {
    console.log('👋 Client disconnected');
  });
});

module.exports = app;
