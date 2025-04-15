const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationCode, verifyCode } = require('../utils/email');
const supabase = require('../utils/supabase');
const { userServices } = require('../utils/supabaseServices');

// Request verification code
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
    
    // Check if email is already in use (MongoDB)
    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists' 
      });
    }
    
    // Also check Supabase
    try {
      const supabaseUser = await userServices.getUserByEmail(email);
      if (supabaseUser && supabaseUser.is_verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'An account with this email already exists' 
        });
      }
    } catch (error) {
      // If no user exists, this is fine
      if (error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
      }
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
    
    // Generate a temporary token for registration
    const tempToken = jwt.sign(
      { email, verified: true },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      tempToken
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
    const { name, email, password, tempToken } = req.body;
    
    // Validate token to ensure email was verified
    let verified = false;
    try {
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'your_jwt_secret');
      verified = decoded.verified && decoded.email === email;
    } catch (error) {
      verified = false;
    }
    
    if (!verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email verification required before registration' 
      });
    }
    
    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Create new MongoDB user
    const user = new User({
      name,
      email,
      password,
      isVerified: true
    });
    
    await user.save();
    
    // Also create the user in Supabase
    try {
      // First sign up for auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // Then create user in the users table
      await userServices.createUser({
        id: authData.user.id,
        email,
        name,
        is_verified: true,
        created_at: new Date()
      });
      
    } catch (supaError) {
      console.error('Supabase user creation error:', supaError);
      // Continue anyway - we can sync later
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
    }
    
    // Try to sign in with Supabase as well
    let supabaseUser = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error) {
        supabaseUser = data.user;
      }
    } catch (supaError) {
      console.error('Supabase login error:', supaError);
      // Continue anyway with MongoDB authentication
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        supabaseId: supabaseUser ? supabaseUser.id : null
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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

// BU Single Sign-On Auth
router.post('/bu-auth', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email.endsWith('@bu.edu')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only BU email addresses are allowed' 
      });
    }
    
    // Check if user exists in MongoDB, create if not
    let user = await User.findOne({ email });
    
    if (!user) {
      // Extract name from email (firstname.lastname@bu.edu)
      const nameParts = email.split('@')[0].split('.');
      const name = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      
      // Create a new user with a random password
      const randomPassword = Math.random().toString(36).slice(-10);
      
      user = new User({
        name,
        email,
        password: randomPassword,
        isVerified: true // Auto-verify for BU SSO
      });
      
      await user.save();
      
      // Also create in Supabase if possible
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: randomPassword,
          email_confirm: true
        });
        
        if (!authError) {
          // Create user record
          await userServices.createUser({
            id: authData.user.id,
            email,
            name,
            is_verified: true,
            created_at: new Date()
          });
        }
      } catch (supaError) {
        console.error('Supabase user creation error:', supaError);
        // Continue anyway
      }
    }
    
    // Try to find or create user in Supabase
    let supabaseId = null;
    try {
      let supabaseUser = await userServices.getUserByEmail(email);
      
      if (!supabaseUser) {
        // Create auth user if not exists
        const { data: authData } = await supabase.auth.admin.createUser({
          email,
          password: Math.random().toString(36).slice(-10),
          email_confirm: true
        });
        
        supabaseId = authData.user.id;
      } else {
        supabaseId = supabaseUser.id;
      }
    } catch (supaError) {
      console.error('Supabase user lookup error:', supaError);
      // Continue anyway
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        supabaseId
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'BU authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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

module.exports = router;