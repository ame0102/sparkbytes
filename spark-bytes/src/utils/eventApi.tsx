// @ts-nocheck
"use client";

import { supabase } from "./supabaseClient";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

export async function createEvent(eventData: any) {
  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  if (authError || !userResponse?.user) {
    throw new Error("User not authenticated");
  }

  const { error, data } = await supabase.from("events").insert([
    {
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      address: eventData.address,
      room: eventData.room,
      food: eventData.food,
      dietary: eventData.dietary,
      dietary_comment: eventData.dietaryComment || null,
      user_id: userResponse.user.id,
      portions: eventData.portions,
      ended: false
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAllEvents(searchTerm = "") {
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw new Error(error.message);

  if (!searchTerm) return data;

  const term = searchTerm.toLowerCase();
  return (data || []).filter((e: any) =>
    `${e.title} ${e.description || ""}`.toLowerCase().includes(term)
  );
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getFavoriteEventIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("favorites")
    .select("event_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("getFavoriteEventIds", error);
    return [];
  }

  return data.map((row) => row.event_id as string);
}

export async function addFavorite(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Must be logged in to favorite events");
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert([
      {
        user_id: user.id,
        event_id: eventId     
      },
    ]);
  if (error) {
    console.error("Error inserting favorite:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function removeFavorite(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Must be logged in to remove favorites");
  }

  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error deleting favorite:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function getFavoriteEvents(): Promise<any[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Must be logged in to view favorites");

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `event_id, events (id, title, date, time, location, address, dietary, food, portions, ended)`
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("getFavoriteEvents error", error);
    return [];
  }

  return data.map((row) => row.events);
}

export async function getCommentsByEventId(eventId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Must be logged in to view comments");

  // Fetch comments
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (commentsError || !comments) {
    console.error("Error fetching comments:", commentsError);
    return [];
  }

  // Get unique user IDs
  const userIds = Array.from(new Set(comments.map((c) => c.user_id)));

  // Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", userIds);

  if (profilesError || !profiles) {
    console.error("Error fetching profiles:", profilesError);
    return comments.map((c) => ({ ...c, user_name: "Anonymous" }));
  }

  // Map IDs to names
  const nameMap: Record<string, string> = {};
  profiles.forEach((p) => { nameMap[p.id] = p.name; });

  // Attach user_name to each comment
  return comments.map((c) => ({
    ...c,
    user_name: nameMap[c.user_id] || "Anonymous",
  }));
}

export async function postComment(eventId: string, content: string, parentId: string | null = null) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Must be logged in to comment");
  }

  // Insert the new comment
  const { data: commentData, error } = await supabase
    .from("comments")
    .insert([{ event_id: eventId, user_id: user.id, content, parent_id: parentId }])
    .select()
    .single();

  if (error || !commentData) {
    console.error("Error inserting comment:", error);
    throw new Error(error?.message || "Failed to post comment");
  }

  // Fetch the user's profile name
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const user_name = profile && profile.name ? profile.name : 'Anonymous';

  // Return the comment augmented with user_name
  return { ...commentData, user_name };
}

export async function getAlerts() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }

  return data;
}

export async function getUnreadAlertsCount() {
  const user = await getCurrentUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("alerts")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread alerts count:", error);
    return 0;
  }

  return count || 0;
}

export async function markAlertAsRead(alertId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Must be logged in to mark alerts");

  const { error } = await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking alert as read:", error);
    throw new Error(error.message);
  }

  return true;
}

export async function deleteAlert(alertId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Must be logged in to delete alerts");

  const { error } = await supabase
    .from("alerts")
    .delete()
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting alert:", error);
    throw new Error(error.message);
  }

  return true;
}
