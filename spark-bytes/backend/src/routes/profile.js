const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get profile from database
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Get user to include name
    const user = await User.findById(userId).select('name email');
    
    // Combine user info with profile
    const profileData = {
      ...profile.toObject(),
      name: user.name,
      email: user.email
    };
    
    res.status(200).json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update current user's profile
router.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      bio,
      avatar,
      major,
      graduationYear,
      interests,
      socialLinks
    } = req.body;
    
    // Find profile
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Update user's name if provided
    if (name) {
      await User.findByIdAndUpdate(userId, { name });
    }
    
    // Update profile fields
    const updates = {};
    
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (major !== undefined) updates.major = major;
    if (graduationYear !== undefined) updates.graduationYear = graduationYear;
    if (interests !== undefined) updates.interests = interests;
    if (socialLinks !== undefined) updates.socialLinks = socialLinks;
    
    // Update profile with changes
    profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true }
    );
    
    // Get updated user info
    const user = await User.findById(userId).select('name email');
    
    // Combine user info with profile
    const profileData = {
      ...profile.toObject(),
      name: user.name,
      email: user.email
    };
    
    res.status(200).json({
      success: true,
      profile: profileData
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
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get profile and user info
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    const user = await User.findById(userId).select('name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create response with only public fields
    const publicProfile = {
      id: profile._id,
      name: user.name,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      major: profile.major || '',
      graduationYear: profile.graduationYear || null,
      interests: profile.interests || [],
      socialLinks: {
        website: profile.socialLinks?.website || '',
        github: profile.socialLinks?.github || '',
        linkedin: profile.socialLinks?.linkedin || '',
        twitter: profile.socialLinks?.twitter || ''
      }
    };
    
    res.status(200).json({
      success: true,
      profile: publicProfile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;