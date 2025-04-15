// routes/guest.js
const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all guests for an event
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if user is the event organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view guest list' 
      });
    }
    
    const guests = await Guest.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      guests
    });
  } catch (error) {
    console.error('Guests fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch guests' 
    });
  }
});

// RSVP to event (authenticated users)
router.post('/rsvp/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if event is full
    if (event.capacity > 0) {
      const guestCount = await Guest.countDocuments({ 
        event: event._id,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      if (guestCount >= event.capacity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event is at full capacity' 
        });
      }
    }
    
    // Check if user already RSVP'd
    const existingRSVP = await Guest.findOne({
      event: event._id,
      user: req.user.userId
    });
    
    if (existingRSVP) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already RSVP\'d to this event' 
      });
    }
    
    // Create guest entry
    const guest = new Guest({
      event: event._id,
      user: req.user.userId,
      status: 'confirmed'
    });
    
    await guest.save();
    
    res.status(201).json({
      success: true,
      message: 'Successfully RSVP\'d to event',
      guest
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to RSVP' 
    });
  }
});

// RSVP for non-authenticated guest
router.post('/rsvp-guest/:eventId', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if event is public
    if (!event.isPublic) {
      return res.status(403).json({ 
        success: false, 
        message: 'This event is private' 
      });
    }
    
    // Check if event is full
    if (event.capacity > 0) {
      const guestCount = await Guest.countDocuments({ 
        event: event._id,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      if (guestCount >= event.capacity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event is at full capacity' 
        });
      }
    }
    
    // Check if email already RSVP'd
    const existingRSVP = await Guest.findOne({
      event: event._id,
      email
    });
    
    if (existingRSVP) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email has already RSVP\'d to this event' 
      });
    }
    
    // Create guest entry
    const guest = new Guest({
      event: event._id,
      name,
      email,
      status: 'pending'
    });
    
    await guest.save();
    
    res.status(201).json({
      success: true,
      message: 'Successfully RSVP\'d to event',
      guest
    });
  } catch (error) {
    console.error('Guest RSVP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to RSVP' 
    });
  }
});

// Update guest status (organizer only)
router.put('/:guestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const guest = await Guest.findById(req.params.guestId);
    
    if (!guest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }
    
    const event = await Event.findById(guest.event);
    
    // Check if user is the event organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update guest status' 
      });
    }
    
    guest.status = status;
    await guest.save();
    
    res.status(200).json({
      success: true,
      guest
    });
  } catch (error) {
    console.error('Guest update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update guest' 
    });
  }
});

// Remove guest from event
router.delete('/:guestId', auth, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.guestId);
    
    if (!guest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }
    
    // Check if user is the event organizer or the guest themselves
    const event = await Event.findById(guest.event);
    
    if (event.organizer.toString() !== req.user.userId && 
        (!guest.user || guest.user.toString() !== req.user.userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to remove this guest' 
      });
    }
    
    await guest.remove();
    
    res.status(200).json({
      success: true,
      message: 'Guest removed successfully'
    });
  } catch (error) {
    console.error('Guest removal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove guest' 
    });
  }
});

// Get events the user is attending
router.get('/my/events', auth, async (req, res) => {
  try {
    const guests = await Guest.find({ 
      user: req.user.userId,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('event');
    
    const events = guests.map(guest => guest.event);
    
    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
});

module.exports = router;