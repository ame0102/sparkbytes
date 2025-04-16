const nodemailer = require('nodemailer');

// Store verification codes in memory (in production, use a database)
const verificationCodes = new Map();

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a transporter for development - logs to console
const createConsoleTransporter = () => {
  return {
    sendMail: (mailOptions) => {
      console.log('=========== EMAIL SENT ===========');
      console.log(`TO: ${mailOptions.to}`);
      console.log(`SUBJECT: ${mailOptions.subject}`);
      console.log(`VERIFICATION CODE: ${mailOptions.text}`);
      console.log('=================================');
      return Promise.resolve({ messageId: 'console-log' });
    }
  };
};

// Send verification code to email
const sendVerificationCode = async (email) => {
  // Validate BU email
  if (!email.endsWith('@bu.edu')) {
    throw new Error('Only Boston University email addresses are allowed.');
  }
  
  // Generate verification code
  const code = generateVerificationCode();
  
  // Store code with expiration time (30 minutes)
  verificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
  });
  
  // Use console transporter for development
  const transporter = createConsoleTransporter();
  
  const mailOptions = {
    from: '"Spark! Bytes" <noreply@sparkbytes.bu.edu>',
    to: email,
    subject: 'Verification Code for Spark! Bytes',
    text: `Your verification code is: ${code}. This code will expire in 30 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #CC0000; color: white; padding: 20px; text-align: center;">
          <h1>Spark! Bytes</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering with Spark! Bytes. Please use the verification code below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; background-color: #f4f4f4; padding: 15px; border-radius: 4px;">
              ${code}
            </div>
          </div>
          <p>This code will expire in 30 minutes. If you did not request this code, please ignore this email.</p>
          <p>Best regards,<br>The Spark! Bytes Team</p>
        </div>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Verify confirmation code
const verifyCode = (email, code) => {
  // Check if email exists in our verification map
  if (!verificationCodes.has(email)) {
    return { valid: false, message: 'No verification code found for this email' };
  }
  
  const verification = verificationCodes.get(email);
  
  // Check if code has expired
  if (Date.now() > verification.expiresAt) {
    verificationCodes.delete(email); // Clean up expired codes
    return { valid: false, message: 'Verification code has expired' };
  }
  
  // Check if code matches
  if (verification.code !== code) {
    return { valid: false, message: 'Invalid verification code' };
  }
  
  // Code is valid, clean up
  verificationCodes.delete(email);
  return { valid: true, message: 'Email verified successfully' };
};

module.exports = {
  sendVerificationCode,
  verifyCode
};