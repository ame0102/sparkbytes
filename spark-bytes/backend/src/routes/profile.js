const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const auth = require('../middleware/auth');

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      profile
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
    
    // Update profile data
    const updates = {
      updated_at: new Date()
    };
    
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar_url = avatar;
    if (major !== undefined) updates.major = major;
    if (graduationYear !== undefined) updates.graduation_year = graduationYear;
    if (interests !== undefined) updates.interests = interests;
    if (socialLinks !== undefined) updates.social_links = socialLinks;
    
    // Update profile in database
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      profile: data
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
    
    // Get profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, bio, avatar_url, major, graduation_year, interests, social_links')
      .eq('id', userId)
      .single();
    
    if (error) {
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
      message: 'Failed to fetch profile' 
    });
  }
});

module.exports = router;