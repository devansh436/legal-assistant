const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to ensure DB connection
const ensureConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ MongoDB disconnected, reconnecting...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB reconnected');
  }
};

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    await ensureConnection(); // ADDED
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    await ensureConnection(); // ADDED
    
    const { name, email, preferences } = req.body;

    const newUser = await User.create({
      name,
      email,
      preferences,
    });

    res.status(201).json({
      userId: newUser._id,
      user: newUser,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    await ensureConnection(); // ADDED
    
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { preferences },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Preferences updated', user });
  } catch (error) {
    console.error('❌ Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
