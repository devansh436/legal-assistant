const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      preferences: preferences || {}
    });

    await user.save();
    res.status(201).json({ 
      message: 'User created successfully',
      userId: user._id,
      user 
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { preferences: req.body.preferences },
      { new: true }
    );
    res.json({ message: 'Preferences updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
