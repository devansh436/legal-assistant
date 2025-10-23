const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createClient } = require("@deepgram/sdk");
const {
  generateWithHistory,
  formatForVoice,
} = require("../services/geminiService");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const fs = require("fs").promises;
const path = require("path");

const upload = multer({ storage: multer.memoryStorage() });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Ensure audio directory exists
const audioDir = path.join(__dirname, "..", "public", "audio");
fs.mkdir(audioDir, { recursive: true }).catch(console.error);

// Process voice query endpoint
router.post("/voice-query", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const audioBuffer = req.file.buffer;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("🎤 Processing voice query");

    // Step 1: STT
    const { result, error: sttError } =
      await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
      });

    if (sttError) throw sttError;

    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log("📝 Transcript:", transcript);

    // Step 2: Get conversation
    let conversation = await Conversation.findOne({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    const messages = conversation ? [...conversation.messages] : [];
    messages.push({ role: "user", content: transcript });

    // Step 3: Generate AI response with FULL CONVERSATION HISTORY
    const userContext = {
      jurisdiction: user.preferences.legalJurisdiction,
      conversationStyle: user.preferences.conversationStyle,
    };

    // FIXED: Use generateWithHistory instead of generateLegalResponse
    const aiResponse = await generateWithHistory(messages, userContext);
    const voiceOptimizedResponse = formatForVoice(aiResponse);
    console.log("🤖 AI Response generated with context");

    // Step 4: Save conversation
    if (conversation) {
      conversation.messages.push(
        { role: "user", content: transcript },
        { role: "assistant", content: voiceOptimizedResponse }
      );
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        userId,
        messages: [
          { role: "user", content: transcript },
          { role: "assistant", content: voiceOptimizedResponse },
        ],
        status: "active",
      });
    }

    // Step 5: Generate TTS and save as file
    let audioUrl = null;
    try {
      // Truncate if needed
      let ttsText = voiceOptimizedResponse;
      if (ttsText.length > 2000) {
        const truncated = ttsText.substring(0, 1900);
        const lastPeriod = Math.max(
          truncated.lastIndexOf("."),
          truncated.lastIndexOf("?"),
          truncated.lastIndexOf("!")
        );
        ttsText = truncated.substring(0, lastPeriod + 1);
      }

      console.log(`🔊 Generating TTS (${ttsText.length} chars)`);

      const ttsResponse = await deepgram.speak.request(
        { text: ttsText },
        {
          model: user.preferences.voiceId || "aura-asteria-en",
        }
      );

      const audioStream = await ttsResponse.getStream();
      const chunks = [];

      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);

      // Save to file
      const filename = `response_${Date.now()}_${userId}.mp3`;
      const filepath = path.join(audioDir, filename);
      await fs.writeFile(filepath, audioBuffer);

      audioUrl = `/audio/${filename}`;
      console.log("✅ TTS audio saved:", filename);
    } catch (ttsError) {
      console.error("❌ TTS Error:", ttsError.message);
    }

    res.json({
      transcript,
      response: voiceOptimizedResponse,
      audioUrl,
    });
  } catch (error) {
    console.error("❌ Voice query error:", error);
    res.status(500).json({
      error: "Processing failed",
      details: error.message,
    });
  }
});

// Other routes...
router.get("/user/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.get("/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

router.put("/:conversationId/archive", async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { status: "archived" },
      { new: true }
    );
    res.json({ message: "Conversation archived", conversation });
  } catch (error) {
    res.status(500).json({ error: "Failed to archive conversation" });
  }
});


// NEW: Fast STT-only endpoint
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Transcribing audio...');

    const audioBuffer = req.file.buffer;

    // Step 1: STT ONLY (Fast!)
    const { result, error: sttError } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
      }
    );

    if (sttError) throw sttError;

    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log('📝 Transcript:', transcript);

    // Return ONLY transcript immediately
    res.json({
      transcript,
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    res.status(500).json({ 
      error: 'Transcription failed',
      details: error.message 
    });
  }
});

// NEW: Process transcript with AI
router.post('/process-query', async (req, res) => {
  try {
    const { transcript, userId } = req.body;

    if (!transcript || !userId) {
      return res.status(400).json({ error: 'transcript and userId are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🤖 Processing query with AI...');

    // Get conversation history
    let conversation = await Conversation.findOne({ userId, status: 'active' })
      .sort({ createdAt: -1 });
    
    const messages = conversation ? [...conversation.messages] : [];
    messages.push({ role: 'user', content: transcript });

    // Generate AI response with context
    const userContext = {
      jurisdiction: user.preferences.legalJurisdiction,
      conversationStyle: user.preferences.conversationStyle
    };

    const { generateWithHistory } = require('../services/geminiService');
    const aiResponse = await generateWithHistory(messages, userContext);
    const voiceOptimizedResponse = formatForVoice(aiResponse);
    console.log('🤖 AI Response generated');

    // Save conversation
    if (conversation) {
      conversation.messages.push(
        { role: 'user', content: transcript },
        { role: 'assistant', content: voiceOptimizedResponse }
      );
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        userId,
        messages: [
          { role: 'user', content: transcript },
          { role: 'assistant', content: voiceOptimizedResponse }
        ],
        status: 'active'
      });
    }

    // Generate TTS
    let audioUrl = null;
    try {
      let ttsText = voiceOptimizedResponse;
      if (ttsText.length > 2000) {
        const truncated = ttsText.substring(0, 1900);
        const lastPeriod = Math.max(
          truncated.lastIndexOf('.'),
          truncated.lastIndexOf('?'),
          truncated.lastIndexOf('!')
        );
        ttsText = truncated.substring(0, lastPeriod + 1);
      }

      const ttsResponse = await deepgram.speak.request(
        { text: ttsText },
        { model: user.preferences.voiceId || 'aura-asteria-en' }
      );

      const audioStream = await ttsResponse.getStream();
      const chunks = [];
      
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      
      const audioBuffer = Buffer.concat(chunks);
      const filename = `response_${Date.now()}_${userId}.mp3`;
      const filepath = path.join(audioDir, filename);
      await fs.writeFile(filepath, audioBuffer);
      
      audioUrl = `/audio/${filename}`;
      console.log('✅ TTS audio saved');
    } catch (ttsError) {
      console.error('❌ TTS Error:', ttsError.message);
    }

    res.json({
      response: voiceOptimizedResponse,
      audioUrl
    });

  } catch (error) {
    console.error('❌ Processing error:', error);
    res.status(500).json({ 
      error: 'Processing failed',
      details: error.message 
    });
  }
});



module.exports = router;
