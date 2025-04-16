const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: function() {
      return !this.user; // Required only if no user reference
    }
  },
  email: {
    type: String,
    required: function() {
      return !this.user; // Required only if no user reference
    },
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'attended'],
    default: 'pending'
  },
  rsvpDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Guest', guestSchema);