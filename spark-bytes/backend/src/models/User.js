const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return email.endsWith('@bu.edu');
      },
      message: 'Email must be a valid Boston University email'
    }
  },
  password: {
    type: String,
    required: function() {
      // Make password optional if using passwordless auth
      return this.authMethod === 'password';
    },
    minlength: 6
  },
  authMethod: {
    type: String,
    enum: ['password', 'magic_link', 'bu_sso'],
    default: 'magic_link'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Added profile reference
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }
});

// Hash password before saving (only if using password auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
    
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);