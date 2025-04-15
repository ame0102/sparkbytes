const supabase = require('./supabase');

/**
 * Sync user data between Supabase Auth and Profiles table
 * This is useful when user metadata is updated in Auth but not in Profiles
 */
async function syncUserProfiles() {
  try {
    console.log('Starting user profile sync...');
    
    // Fetch all users from Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }
    
    console.log(`Found ${authUsers.users.length} users in Auth`);
    
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');
    
    if (profilesError) {
      throw profilesError;
    }
    
    console.log(`Found ${profiles.length} profiles in database`);
    
    // Create a map of existing profiles by ID
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
    
    // Process each auth user
    const results = {
      created: 0,
      updated: 0,
      unchanged: 0,
      failed: 0
    };
    
    for (const user of authUsers.users) {
      try {
        const existingProfile = profileMap.get(user.id);
        
        if (!existingProfile) {
          // Create new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              created_at: new Date()
            }]);
          
          if (insertError) {
            throw insertError;
          }
          
          results.created++;
        } else if (existingProfile.email !== user.email) {
          // Update profile if email has changed
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email: user.email,
              updated_at: new Date()
            })
            .eq('id', user.id);
          
          if (updateError) {
            throw updateError;
          }
          
          results.updated++;
        } else {
          results.unchanged++;
        }
      } catch (error) {
        console.error(`Error syncing user ${user.id}:`, error);
        results.failed++;
      }
    }
    
    console.log('User profile sync results:', results);
    return results;
  } catch (error) {
    console.error('Error syncing user profiles:', error);
    throw error;
  }
}

/**
 * Fix any orphaned guest records by removing them
 * This removes guest records for events that don't exist
 */
async function cleanupOrphanedGuests() {
  try {
    console.log('Starting orphaned guests cleanup...');
    
    // Find guests with non-existent events
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, event_id');
    
    if (guestsError) {
      throw guestsError;
    }
    
    const eventIds = [...new Set(guests.map(guest => guest.event_id))];
    
    // Check which events actually exist
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .in('id', eventIds);
    
    if (eventsError) {
      throw eventsError;
    }
    
    // Create a set of valid event IDs
    const validEventIds = new Set(events.map(event => event.id));
    
    // Find orphaned guests
    const orphanedGuests = guests.filter(guest => !validEventIds.has(guest.event_id));
    
    if (orphanedGuests.length === 0) {
      console.log('No orphaned guests found');
      return { removed: 0 };
    }
    
    const orphanedIds = orphanedGuests.map(guest => guest.id);
    
    // Delete orphaned guests
    const { error: deleteError } = await supabase
      .from('guests')
      .delete()
      .in('id', orphanedIds);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`Removed ${orphanedIds.length} orphaned guests`);
    return { removed: orphanedIds.length };
  } catch (error) {
    console.error('Error cleaning up orphaned guests:', error);
    throw error;
  }
}

/**
 * Archive past events by setting is_archived=true
 * This helps keep the active events list clean
 */
async function archivePastEvents(daysThreshold = 7) {
  try {
    console.log(`Starting archive of events older than ${daysThreshold} days...`);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Find events to archive
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .lt('date', cutoffDateStr)
      .eq('is_archived', false);
    
    if (eventsError) {
      throw eventsError;
    }
    
    if (events.length === 0) {
      console.log('No past events to archive');
      return { archived: 0 };
    }
    
    // Archive events
    const { error: updateError } = await supabase
      .from('events')
      .update({ is_archived: true })
      .in('id', events.map(event => event.id));
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`Archived ${events.length} past events`);
    return { archived: events.length };
  } catch (error) {
    console.error('Error archiving past events:', error);
    throw error;
  }
}

/**
 * Initialize the database with necessary schema changes
 * This should be run when setting up the app for the first time
 */
async function initializeDatabase() {
  try {
    console.log('Checking if database needs initialization...');
    
    // Check if is_archived column exists in events table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_column_info', { table_name: 'events', column_name: 'is_archived' });
    
    if (columnsError) {
      throw columnsError;
    }
    
    // If the column doesn't exist, add it
    if (columns.length === 0) {
      console.log('Adding is_archived column to events table...');
      
      // This requires direct SQL execution
      const { error: alterError } = await supabase
        .rpc('execute_sql', { 
          sql: 'ALTER TABLE events ADD COLUMN is_archived BOOLEAN DEFAULT false;' 
        });
      
      if (alterError) {
        throw alterError;
      }
      
      console.log('Added is_archived column to events table');
    } else {
      console.log('Database schema is up to date');
    }
    
    return { initialized: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  syncUserProfiles,
  cleanupOrphanedGuests,
  archivePastEvents,
  initializeDatabase
};