const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Guest = require('../models/Guest');
const auth = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, tag, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = { isPublic: true };
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, description, date, startTime, endTime, 
      location, capacity, imageUrl, isPublic, tags 
    } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      organizer: req.user.userId,
      capacity: capacity || 0,
      imageUrl: imageUrl || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      tags: tags || []
    });
    
    const event = await newEvent.save();
    
    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create event' 
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get guest count
    const guestCount = await Guest.countDocuments({ event: event._id });
    
    res.status(200).json({
      success: true,
      event: {
        ...event._doc,
        guestCount
      }
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event' 
    });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
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
        message: 'Not authorized to update this event' 
      });
    }
    
    // Update fields
    const updates = req.body;
    updates.updatedAt = Date.now();
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update event' 
    });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
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
        message: 'Not authorized to delete this event' 
      });
    }
    
    // Delete event and all associated guests
    await Guest.deleteMany({ event: event._id });
    await event.remove();
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete event' 
    });
  }
});

// Get events created by current user
router.get('/my/events', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.userId })
      .sort({ date: 1 });
    
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