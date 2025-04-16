const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { sendVerificationCode, verifyCode } = require('../utils/email');

// Request verification code (for BU email verification)
router.post('/request-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate BU email
    if (!email || !email.endsWith('@bu.edu')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid Boston University email address' 
      });
    }
    
    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists' 
      });
    }
    
    // Send verification code
    await sendVerificationCode(email);
    
    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent to your email' 
    });
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send verification code' 
    });
  }
});

// Verify email with code
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Validate inputs
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }
    
    // Verify the code
    const verification = verifyCode(email, code);
    
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: verification.message 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify email' 
    });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, verified } = req.body;
    
    // Check if email is verified
    if (!verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email verification required before registration' 
      });
    }
    
    // Check if email is a BU email
    if (!email.endsWith('@bu.edu')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Boston University email addresses are allowed' 
      });
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    // Create profile record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: authData.user.id,
          name,
          email,
          created_at: new Date()
        }
      ]);
    
    if (profileError) {
      throw profileError;
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      session: data.session,
      user: {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata?.name || '',
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// BU Single Sign-On Auth (mock implementation)
router.post('/bu-auth', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email.endsWith('@bu.edu')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only BU email addresses are allowed' 
      });
    }
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    let userId;
    let session;
    
    if (userData) {
      // User exists, simulate login
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });
      
      if (error) throw error;
      
      // Use the token to get a session
      const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.properties.hashed_token,
        type: 'email'
      });
      
      if (sessionError) throw sessionError;
      
      session = sessionData.session;
      userId = userData.id;
    } else {
      // Create new user
      const nameParts = email.split('@')[0].split('.');
      const name = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      
      // Random password for the account
      const randomPassword = Math.random().toString(36).slice(-10);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        user_metadata: { name },
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      // Create profile record
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id,
            name,
            email,
            created_at: new Date()
          }
        ]);
      
      if (profileError) throw profileError;
      
      // Generate session for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
        userId: authData.user.id
      });
      
      if (sessionError) throw sessionError;
      
      session = sessionData.session;
      userId = authData.user.id;
    }
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    res.status(200).json({
      success: true,
      message: 'BU authentication successful',
      session,
      user: {
        id: userId,
        name: profile?.name || '',
        email
      }
    });
  } catch (error) {
    console.error('BU auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
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