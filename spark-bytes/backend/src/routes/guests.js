const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const auth = require('../middleware/auth');

// Get all guests for an event
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Verify event ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if user is the event organizer
    if (event.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view guest list' 
      });
    }
    
    // Get guests
    const { data, error } = await supabase
      .from('guests')
      .select('*, user:user_id(id, name, email)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      guests: data
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
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, capacity')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if event is at capacity
    if (event.capacity > 0) {
      const { count, error: countError } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .in('status', ['pending', 'confirmed']);
      
      if (!countError && count >= event.capacity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event is at full capacity' 
        });
      }
    }
    
    // Check if user already RSVP'd
    const { data: existingRSVP, error: rsvpError } = await supabase
      .from('guests')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingRSVP) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already RSVP\'d to this event' 
      });
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();
      
    if (userError) {
      throw userError;
    }
    
    // Create guest entry
    const { data, error } = await supabase
      .from('guests')
      .insert([{
        event_id: eventId,
        user_id: userId,
        name: userData.name,
        email: userData.email,
        status: 'confirmed',
        rsvp_date: new Date(),
        created_at: new Date()
      }])
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully RSVP\'d to event',
      guest: data[0]
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
    const { eventId } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, capacity, is_public')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if event is public
    if (!event.is_public) {
      return res.status(403).json({ 
        success: false, 
        message: 'This event is private' 
      });
    }
    
    // Check if event is at capacity
    if (event.capacity > 0) {
      const { count, error: countError } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .in('status', ['pending', 'confirmed']);
      
      if (!countError && count >= event.capacity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event is at full capacity' 
        });
      }
    }
    
    // Check if email already RSVP'd
    const { data: existingRSVP, error: rsvpError } = await supabase
      .from('guests')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email)
      .maybeSingle();
    
    if (existingRSVP) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email has already RSVP\'d to this event' 
      });
    }
    
    // Create guest entry
    const { data, error } = await supabase
      .from('guests')
      .insert([{
        event_id: eventId,
        name,
        email,
        status: 'pending',
        rsvp_date: new Date(),
        created_at: new Date()
      }])
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully RSVP\'d to event',
      guest: data[0]
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
    const { guestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    // Verify the guest exists
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, event_id')
      .eq('id', guestId)
      .single();
    
    if (guestError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }
    
    // Verify event ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', guest.event_id)
      .single();
    
    if (eventError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if user is the event organizer
    if (event.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update guest status' 
      });
    }
    
    // Update guest status
    const { data, error } = await supabase
      .from('guests')
      .update({ status, updated_at: new Date() })
      .eq('id', guestId)
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      guest: data[0]
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
    const { guestId } = req.params;
    const userId = req.user.id;
    
    // Verify the guest exists
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, event_id, user_id')
      .eq('id', guestId)
      .single();
    
    if (guestError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }
    
    // Verify event ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', guest.event_id)
      .single();
    
    if (eventError) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if user is the event organizer or the guest themselves
    if (event.user_id !== userId && guest.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to remove this guest' 
      });
    }
    
    // Delete guest
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);
    
    if (error) {
      throw error;
    }
    
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
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('guests')
      .select('event:event_id(*)')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed']);
    
    if (error) {
      throw error;
    }
    
    const events = data.map(item => item.event);
    
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