const User = require('../models/User');
const Profile = require('../models/Profile');
const Event = require('../models/Event');
const Guest = require('../models/Guest');
const { userServices, profileServices, eventServices, guestServices } = require('./supabaseServices');

// Sync a single user from MongoDB to Supabase
const syncUserToSupabase = async (mongoUser, supabaseId = null) => {
  try {
    // Format user data for Supabase
    const userData = {
      name: mongoUser.name,
      email: mongoUser.email,
      is_verified: mongoUser.isVerified,
      created_at: mongoUser.createdAt
    };
    
    // If supabaseId is provided, update existing user
    if (supabaseId) {
      userData.id = supabaseId;
      await userServices.updateUser(supabaseId, userData);
      return supabaseId;
    }
    
    // Otherwise, try to find by email
    try {
      const existingUser = await userServices.getUserByEmail(mongoUser.email);
      if (existingUser) {
        await userServices.updateUser(existingUser.id, userData);
        return existingUser.id;
      }
    } catch (error) {
      // User not found, continue to create new
      if (error.code !== 'PGRST116') {
        throw error;
      }
    }
    
    // Create new user
    const newUser = await userServices.createUser(userData);
    return newUser.id;
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
    throw error;
  }
};

// Sync a single profile from MongoDB to Supabase
const syncProfileToSupabase = async (mongoProfile, supabaseUserId) => {
  try {
    // Format profile data for Supabase
    const profileData = {
      user_id: supabaseUserId,
      bio: mongoProfile.bio || '',
      avatar: mongoProfile.avatar || '',
      major: mongoProfile.major || '',
      graduation_year: mongoProfile.graduationYear || null,
      interests: mongoProfile.interests || [],
      social_links: mongoProfile.socialLinks || {},
      updated_at: mongoProfile.updatedAt || new Date()
    };
    
    // Try to find existing profile
    try {
      const existingProfile = await profileServices.getProfileByUserId(supabaseUserId);
      if (existingProfile) {
        return await profileServices.updateProfile(existingProfile.id, profileData);
      }
    } catch (error) {
      // Profile not found, continue to create new
      if (error.code !== 'PGRST116') {
        throw error;
      }
    }
    
    // Create new profile
    return await profileServices.createProfile(profileData);
  } catch (error) {
    console.error('Error syncing profile to Supabase:', error);
    throw error;
  }
};

// Sync a single event from MongoDB to Supabase
const syncEventToSupabase = async (mongoEvent, supabaseOrganizerId) => {
  try {
    // Format event data for Supabase
    const eventData = {
      title: mongoEvent.title,
      description: mongoEvent.description,
      date: mongoEvent.date,
      start_time: mongoEvent.startTime,
      end_time: mongoEvent.endTime,
      location: mongoEvent.location,
      user_id: supabaseOrganizerId,
      capacity: mongoEvent.capacity || 0,
      image_url: mongoEvent.imageUrl || '',
      is_public: mongoEvent.isPublic !== undefined ? mongoEvent.isPublic : true,
      tags: mongoEvent.tags || [],
      created_at: mongoEvent.createdAt || new Date(),
      updated_at: mongoEvent.updatedAt || new Date()
    };
    
    // Create or update event in Supabase
    let supabaseEvent;
    
    if (mongoEvent.supabaseId) {
      supabaseEvent = await eventServices.updateEvent(mongoEvent.supabaseId, eventData);
    } else {
      supabaseEvent = await eventServices.createEvent(eventData);
      
      // Update MongoDB event with Supabase ID
      await Event.findByIdAndUpdate(mongoEvent._id, { supabaseId: supabaseEvent.id });
    }
    
    return supabaseEvent;
  } catch (error) {
    console.error('Error syncing event to Supabase:', error);
    throw error;
  }
};

// Sync all users from MongoDB to Supabase
const syncAllUsersToSupabase = async () => {
  try {
    const users = await User.find({});
    const results = {
      success: 0,
      failed: 0,
      total: users.length
    };
    
    for (const user of users) {
      try {
        await syncUserToSupabase(user);
        results.success++;
      } catch (error) {
        console.error(`Failed to sync user ${user._id}:`, error);
        results.failed++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing all users:', error);
    throw error;
  }
};

module.exports = {
  syncUserToSupabase,
  syncProfileToSupabase,
  syncEventToSupabase,
  syncAllUsersToSupabase
};