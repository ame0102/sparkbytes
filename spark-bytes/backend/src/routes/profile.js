// routes/profile.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.userId });
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Create or update profile
router.post('/', auth, async (req, res) => {
  try {
    const { bio, avatar, major, graduationYear, interests, socialLinks } = req.body;
    
    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.userId;
    if (bio) profileFields.bio = bio;
    if (avatar) profileFields.avatar = avatar;
    if (major) profileFields.major = major;
    if (graduationYear) profileFields.graduationYear = graduationYear;
    if (interests) profileFields.interests = interests;
    if (socialLinks) profileFields.socialLinks = socialLinks;
    profileFields.updatedAt = Date.now();
    
    // Find and update profile or create new one
    let profile = await Profile.findOne({ user: req.user.userId });
    
    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.userId },
        { $set: profileFields },
        { new: true }
      );
    } else {
      // Create new profile
      profile = new Profile(profileFields);
      await profile.save();
      
      // Add profile reference to user
      await User.findByIdAndUpdate(
        req.user.userId,
        { profile: profile._id }
      );
    }
    
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// Get profile by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', ['name', 'email']);
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;