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
  const {
    data,
    error,
  } = await supabase
    .from("favorites")
    .select("event_id")
    .eq("user_id", (await supabase.auth.getUser())?.data.user?.id);

  if (error) {
    console.error("getFavoriteEventIds", error);
    return [];
  }

  return data.map((row) => row.event_id as string);
}

export async function addFavorite(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    console.error("User not found.");
    return;
  }

  const { error } = await supabase.from("favorites").insert([
    {
      user_id: user.id,
      event_id: eventId,
    },
  ]);

  if (error) {
    console.error("Error inserting favorite:", error.message);
  } else {
    console.log("Favorite added successfully");
  }
}

export async function removeFavorite(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    console.error("User not found.");
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error deleting favorite:", error.message);
  } else {
    console.log("Favorite removed successfully");
  }
}

export async function getFavoriteEvents(): Promise<any[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      event_id,
      events (
        id,
        title,
        date,
        time,
        location,
        address,
        dietary,
        food,
        portions
      )
    `)
    .eq("user_id", (await supabase.auth.getUser())?.data.user?.id);

  if (error) {
    console.error("getFavoriteEvents error", error);
    return [];
  }

  return data.map((row) => row.events);
}