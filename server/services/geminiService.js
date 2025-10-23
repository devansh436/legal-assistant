const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate legal advice response using Gemini
 * This function acts as the "Think" component in Deepgram's architecture
 */
const generateLegalResponse = async (conversationHistory, userContext, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      // UPDATED: More explicit instructions about length
      const systemPrompt = `You are an expert AI legal assistant for ${
        userContext.jurisdiction || "Indian"
      } law. 

CRITICAL: Keep responses CONCISE and VOICE-FRIENDLY:
- Maximum 300-400 words (about 1-2 minutes of speaking)
- Use simple, clear language for ${userContext.conversationStyle || "formal"} tone
- Provide key information first
- If the topic is complex, give a brief overview and mention details are available on request

Keep your response under 1500 characters total.`;

      const lastMessage = conversationHistory[conversationHistory.length - 1].content;
      const fullPrompt = systemPrompt + "\n\nUser Question: " + lastMessage;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      
      return response.text();

    } catch (error) {
      console.error(`❌ Gemini API Error (Attempt ${attempt}/${retries}):`, error.message);

      if (error.message.includes("429") || error.message.includes("rate limit") || error.message.includes("RESOURCE_EXHAUSTED")) {
        if (attempt < retries) {
          const waitTime = attempt * 2000;
          console.log(`⏳ Rate limited. Waiting ${waitTime/1000}s...`);
          await sleep(waitTime);
          continue;
        }
        return "I'm experiencing high demand. Please try again in a moment.";
      }

      if (attempt === retries) {
        return "I apologize, but I'm having trouble processing your request. Please try again.";
      }
    }
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate response with full conversation history (for multi-turn chats)
 * Use this for the WebSocket voice agent to maintain context
 */
const generateWithHistory = async (conversationHistory, userContext) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const systemPrompt = `You are an expert AI legal assistant specializing in ${
      userContext.jurisdiction || "Indian"
    } law. Use ${userContext.conversationStyle || "formal"} tone. Keep responses concise for voice interaction.`;

    // Format conversation for Gemini
    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add system context to first message
    if (formattedHistory.length > 0) {
      formattedHistory[0].parts[0].text = 
        systemPrompt + "\n\n" + formattedHistory[0].parts[0].text;
    }

    // Start chat with history
    const chat = model.startChat({
      history: formattedHistory.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    // Send last message
    const lastMessage = conversationHistory[conversationHistory.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return "I apologize, but I'm having trouble processing your request. Please try again.";
  }
};

/**
 * Format response for voice output
 * Removes formatting that doesn't work well in TTS
 */
const formatForVoice = (text) => {
  return text
    .replace(/\*\*/g, "") // Remove markdown bold
    .replace(/\*/g, "") // Remove markdown italic
    .replace(/#+/g, "") // Remove markdown headers
    .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
    .replace(/[•\-]\s/g, "") // Remove bullet points
    .trim();
};

module.exports = {
  generateLegalResponse,
  generateWithHistory,
  formatForVoice,
};
