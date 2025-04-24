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