const { createClient } = require('@deepgram/sdk');
const { generateLegalResponse, formatForVoice } = require('./geminiService');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

/**
 * Handle Voice Agent WebSocket Connection (Simplified Version)
 * Uses regular STT and TTS instead of Voice Agent API
 */
const handleVoiceAgentConnection = async (clientWs, userId) => {
  try {
    // Fetch user preferences
    const user = await User.findById(userId);
    if (!user) {
      clientWs.send(JSON.stringify({ error: 'User not found' }));
      clientWs.close();
      return;
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({ 
      userId, 
      status: 'active' 
    }).sort({ createdAt: -1 });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        messages: [],
        status: 'active'
      });
      await conversation.save();
    }

    console.log('✅ Voice assistant ready for user:', userId);

    // Send ready status
    clientWs.send(JSON.stringify({
      type: 'status',
      message: 'Voice agent ready'
    }));

    let conversationBuffer = [...conversation.messages];

    /**
     * Handle incoming audio from client
     */
    clientWs.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'audio') {
          console.log('🎤 Received audio from client');
          
          // Convert base64 to buffer
          const audioBuffer = Buffer.from(data.data, 'base64');
          
          // Step 1: Transcribe audio (STT)
          const { result, error: sttError } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
              model: 'nova-2',
              smart_format: true,
              punctuate: true,
            }
          );

          if (sttError) {
            throw sttError;
          }

          const transcript = result.results.channels[0].alternatives[0].transcript;
          console.log('📝 Transcript:', transcript);

          // Send transcript to client
          clientWs.send(JSON.stringify({
            type: 'transcript',
            role: 'user',
            text: transcript
          }));

          // Add to conversation buffer
          conversationBuffer.push({
            role: 'user',
            content: transcript,
            timestamp: new Date()
          });

          // Step 2: Generate AI response with Gemini
          const userContext = {
            jurisdiction: user.preferences.legalJurisdiction,
            conversationStyle: user.preferences.conversationStyle
          };

          const aiResponse = await generateLegalResponse(
            conversationBuffer,
            userContext
          );

          const voiceOptimizedResponse = formatForVoice(aiResponse);
          console.log('🤖 AI Response:', voiceOptimizedResponse);

          // Send text response to client
          clientWs.send(JSON.stringify({
            type: 'assistant_response',
            text: voiceOptimizedResponse
          }));

          // Add to conversation buffer
          conversationBuffer.push({
            role: 'assistant',
            content: voiceOptimizedResponse,
            timestamp: new Date()
          });

          // Step 3: Convert response to speech (TTS)
          try {
            const ttsResponse = await deepgram.speak.request(
              { text: voiceOptimizedResponse },
              {
                model: user.preferences.voiceId || 'aura-asteria-en',
              }
            );

            const audioStream = await ttsResponse.getStream();
            const chunks = [];
            
            for await (const chunk of audioStream) {
              chunks.push(chunk);
            }
            
            const audioBuffer = Buffer.concat(chunks);
            const base64Audio = audioBuffer.toString('base64');

            // Send audio to client
            clientWs.send(JSON.stringify({
              type: 'audio',
              data: base64Audio
            }));

            console.log('🔊 Audio sent to client');
          } catch (ttsError) {
            console.error('❌ TTS Error:', ttsError);
            // Continue even if TTS fails
          }

        }
      } catch (error) {
        console.error('❌ Error processing message:', error);
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process audio'
        }));
      }
    });

    /**
     * Cleanup on client disconnect
     */
    clientWs.on('close', async () => {
      console.log('👋 Client disconnected, saving conversation');
      
      try {
        // Save conversation to database
        conversation.messages = conversationBuffer;
        await conversation.save();
      } catch (error) {
        console.error('❌ Error saving conversation:', error);
      }
    });

  } catch (error) {
    console.error('❌ Voice agent initialization error:', error);
    try {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize voice agent: ' + error.message
      }));
    } catch (sendError) {
      console.error('Could not send error to client');
    }
  }
};

module.exports = { handleVoiceAgentConnection };
