const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

// Authentication middleware
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      supabaseId: decoded.supabaseId
    };
    
    // If we have a supabaseId, also verify with Supabase
    if (decoded.supabaseId) {
      supabase.auth.getUser()
        .then(({ data, error }) => {
          if (error) {
            console.warn('Supabase token verification failed:', error);
            // Continue anyway since JWT is valid
          } else if (data && data.user) {
            req.user.supabaseUser = data.user;
          }
          next();
        })
        .catch(error => {
          console.error('Supabase auth error:', error);
          next(); // Continue anyway
        });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};