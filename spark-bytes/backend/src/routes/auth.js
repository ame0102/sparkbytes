const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { sendVerificationCode, verifyCode } = require('../utils/email');

// Request magic link login
router.post('/magic-link', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validate inputs
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Validate BU email
    if (!email.endsWith('@bu.edu')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid Boston University email address' 
      });
    }
    
    // Use Supabase to send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          name: name || email.split('@')[0] // Store name in user metadata
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    // Check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', email)
      .maybeSingle();
    
    // We don't need to create the profile here since we'll do it after successful login
    // This is just to check if the user already exists
    
    res.status(200).json({ 
      success: true, 
      message: 'Magic link sent to your email address'
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send magic link'
    });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    // Token verification is handled by the middleware
    // req.user is already set
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get profile data from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    // If profile doesn't exist, create it
    if (profileError || !profile) {
      // Create a new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            created_at: new Date()
          }
        ]);
      
      if (insertError) {
        console.error('Profile creation error:', insertError);
      }
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name || req.user.email.split('@')[0],
        profile: profile || null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

// Update user metadata
router.put('/update-name', async (req, res) => {
  try {
    // Token verification is handled by the middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    // Update user metadata
    const { error: updateMetadataError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { user_metadata: { name } }
    );
    
    if (updateMetadataError) {
      throw updateMetadataError;
    }
    
    // Update profile name
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', req.user.id);
    
    if (updateProfileError) {
      throw updateProfileError;
    }
    
    res.status(200).json({
      success: true,
      message: 'Name updated successfully'
    });
  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update name'
    });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to logout' 
    });
  }
});

module.exports = router;