const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      audioTranscript: String, // Original audio transcription
      metadata: {
        confidence: Number,
        duration: Number,
      },
    },
  ],
  category: {
    type: String,
    enum: ["contract", "property", "family", "criminal", "corporate", "other"],
    default: "other",
  },
  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update 'updatedAt' on save
ConversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Conversation", ConversationSchema);
