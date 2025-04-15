const supabase = require('./supabase');

// User/Auth Services
const userServices = {
  // Get user by email
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Create a new user
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Update user profile
  async updateUser(userId, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  }
};

// Profile Services
const profileServices = {
  // Get profile by user ID
  async getProfileByUserId(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // Create a new profile
  async createProfile(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Update profile
  async updateProfile(profileId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', profileId)
      .select();
    
    if (error) throw error;
    return data[0];
  }
};

// Event Services
const eventServices = {
  // Get all public events
  async getPublicEvents(limit = 10, page = 1, filters = {}) {
    let query = supabase
      .from('events')
      .select('*, organizer:user_id(*)')
      .eq('is_public', true);
    
    // Apply filters
    if (filters.tag) {
      query = query.contains('tags', [filters.tag]);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query
      .order('date', { ascending: true })
      .range(from, to)
      .select();
    
    if (error) throw error;
    return { events: data, total: count };
  },
  
  // Get event by ID
  async getEventById(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select('*, organizer:user_id(*)')
      .eq('id', eventId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Create a new event
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Update event
  async updateEvent(eventId, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Delete event
  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) throw error;
    return true;
  }
};

// Guest Services
const guestServices = {
  // Get all guests for an event
  async getGuestsByEventId(eventId) {
    const { data, error } = await supabase
      .from('guests')
      .select('*, user:user_id(*)')
      .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
  },
  
  // Check if user is registered for event
  async isUserRegistered(eventId, userId) {
    const { data, error } = await supabase
      .from('guests')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },
  
  // RSVP to event
  async createGuest(guestData) {
    const { data, error } = await supabase
      .from('guests')
      .insert([guestData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Update guest status
  async updateGuestStatus(guestId, status) {
    const { data, error } = await supabase
      .from('guests')
      .update({ status })
      .eq('id', guestId)
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Delete guest
  async deleteGuest(guestId) {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);
    
    if (error) throw error;
    return true;
  },
  
  // Get events a user is attending
  async getUserEvents(userId) {
    const { data, error } = await supabase
      .from('guests')
      .select('event:event_id(*)')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed']);
    
    if (error) throw error;
    return data.map(item => item.event);
  }
};

module.exports = {
  userServices,
  profileServices,
  eventServices,
  guestServices
};