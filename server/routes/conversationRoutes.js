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

// Helper to ensure DB connection
const ensureConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ MongoDB disconnected, reconnecting...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB reconnected');
  }
};

// NEW: Fast STT-only endpoint
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log("🎤 Transcribing audio...");

    const audioBuffer = req.file.buffer;

    // Step 1: STT ONLY (Fast!)
    const { result, error: sttError } =
      await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
      });

    if (sttError) throw sttError;

    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log("📝 Transcript:", transcript);

    // Return ONLY transcript immediately
    res.json({
      transcript,
    });
  } catch (error) {
    console.error("❌ Transcription error:", error);
    res.status(500).json({
      error: "Transcription failed",
      details: error.message,
    });
  }
});

// NEW: Process transcript with AI
router.post("/process-query", async (req, res) => {
  try {
    const { transcript, userId } = req.body;

    console.log("=== PROCESSING QUERY ===");
    console.log("📝 Transcript:", transcript);
    console.log("👤 User ID:", userId);

    if (!transcript || !userId) {
      return res
        .status(400)
        .json({ error: "transcript and userId are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", user.name);
    console.log("🤖 Processing query with AI...");

    // Get conversation history
    let conversation = await Conversation.findOne({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    const messages = conversation ? [...conversation.messages] : [];
    messages.push({ role: "user", content: transcript });

    console.log(`💬 Conversation has ${messages.length} messages in history`);

    // Generate AI response with context
    const userContext = {
      jurisdiction: user.preferences.legalJurisdiction,
      conversationStyle: user.preferences.conversationStyle,
    };

    const aiResponse = await generateWithHistory(messages, userContext);
    const voiceOptimizedResponse = formatForVoice(aiResponse);
    console.log(
      "🤖 AI Response generated:",
      voiceOptimizedResponse.substring(0, 100) + "..."
    );

    // Save conversation
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

    console.log("💾 Conversation saved");

    // Generate TTS
    let audioUrl = null;
    try {
      // Truncate if needed
      let ttsText = voiceOptimizedResponse;
      if (ttsText.length > 2000) {
        console.log(
          `⚠️ Response too long (${ttsText.length} chars), truncating...`
        );
        const truncated = ttsText.substring(0, 1900);
        const lastPeriod = Math.max(
          truncated.lastIndexOf("."),
          truncated.lastIndexOf("?"),
          truncated.lastIndexOf("!")
        );
        ttsText = truncated.substring(0, lastPeriod + 1);
      }

      console.log(`🔊 Generating TTS (${ttsText.length} chars)...`);
      console.log(
        `🔊 Using voice: ${user.preferences.voiceId || "aura-asteria-en"}`
      );

      const ttsResponse = await deepgram.speak.request(
        { text: ttsText },
        {
          model: user.preferences.voiceId || "aura-asteria-en",
        }
      );

      console.log("✅ TTS response received, streaming audio...");

      const audioStream = await ttsResponse.getStream();
      const chunks = [];

      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      console.log(`✅ Audio buffer created: ${audioBuffer.length} bytes`);

      // FIXED: Use data URL instead of file system on Vercel
      if (process.env.VERCEL) {
        // On Vercel: Return as base64 data URL
        audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
        console.log("✅ TTS audio encoded as data URL (Vercel)");
      } else {
        // Local: Save to file
        const filename = `response_${Date.now()}_${userId}.mp3`;
        const filepath = path.join(audioDir, filename);
        await fs.writeFile(filepath, audioBuffer);
        audioUrl = `/audio/${filename}`;
        console.log("✅ TTS audio saved:", filename);
      }

      console.log("✅ Audio URL ready");
    } catch (ttsError) {
      console.error("❌ TTS Error:", ttsError);
      console.error("❌ TTS Error details:", ttsError.message);
      // Continue without audio
    }

    console.log("=== RESPONSE BEING SENT ===");
    console.log("Response:", voiceOptimizedResponse.substring(0, 50) + "...");
    console.log("Audio URL:", audioUrl);
    console.log("===========================");

    res.json({
      response: voiceOptimizedResponse,
      audioUrl,
    });
  } catch (error) {
    console.error("❌ Processing error:", error);
    res.status(500).json({
      error: "Processing failed",
      details: error.message,
    });
  }
});

// Get all conversations for a user
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

// Get specific conversation
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

// Archive a conversation
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

module.exports = router;
