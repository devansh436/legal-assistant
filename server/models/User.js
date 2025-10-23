const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    voiceId: {
      type: String,
      default: 'aura-asteria-en' // Deepgram Aura voice
    },
    language: {
      type: String,
      default: 'en'
    },
    legalJurisdiction: {
      type: String,
      default: 'Indian'
    },
    conversationStyle: {
      type: String,
      enum: ['formal', 'casual', 'technical'],
      default: 'formal'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
