"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import NavBar from "@/components/NavBar";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "", phone: "", location: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [evtLoading, setEvtLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) { router.push("/login"); return; }

      setUser(auth.user);
      setFormData({
        name: auth.user.user_metadata?.name ?? "",
        email: auth.user.email ?? "",
        bio: auth.user.user_metadata?.bio ?? "",
        phone: auth.user.user_metadata?.phone ?? "",
        location: auth.user.user_metadata?.location ?? "",
      });

      const { data, error } = await supabase.from("events").select("*").eq("user_id", auth.user.id).order("date", { ascending: false });
      if (!error) setMyEvents(data || []);
      setEvtLoading(false);
    })();
  }, [router]);

  const handleSave = async () => {
    if (!formData.name.trim()) { alert("Name is required"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { name: formData.name, bio: formData.bio, phone: formData.phone, location: formData.location } });
    if (!error) setIsEditing(false); else alert(error.message);
    setLoading(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) setMyEvents((prev) => prev.filter((e) => e.id !== id)); else alert(error.message);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />

      <main className="flex-1 p-6 flex flex-col items-center gap-8">
        <div className="bg-white rounded-lg shadow-sm border w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full border border-[#CC0000] bg-white">
              <UserOutlined style={{ fontSize: 40, color: "#CC0000" }} />
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="Full Name" />
                <input value={formData.email} disabled className="w-full p-2.5 border rounded-lg bg-gray-100" />
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="w-full p-2.5 border rounded-lg" placeholder="Bio" />
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="Phone" />
                <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="Location" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800">{formData.name || "No name"}</h2>
                <p className="text-gray-500">{formData.email}</p>
                {formData.bio && <p className="text-gray-600 text-sm mt-2">{formData.bio}</p>}
                {formData.phone && <p className="text-gray-500 mt-2">{formData.phone}</p>}
                {formData.location && <p className="text-gray-500">{formData.location}</p>}
              </>
            )}
          </div>

          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 py-3 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#CC0000] text-white py-3 rounded-lg">{loading ? "Saving…" : "Save"}</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full bg-[#CC0000] text-white py-3 rounded-lg">Edit Profile</button>
          )}
        </div>

        <div className="w-full max-w-4xl">
          <h3 className="text-lg font-semibold mb-4">My Events</h3>
          {evtLoading ? (
            <p>Loading events…</p>
          ) : myEvents.length === 0 ? (
            <p className="text-gray-500">You haven't posted any events yet.</p>
          ) : (
            <div className="space-y-4">
              {myEvents.map((evt) => (
                <div key={evt.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{evt.title}</p>
                    <p className="text-sm text-gray-500">{dayjs(evt.date).format("MMM D, YYYY")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/event/edit/${evt.id}`)} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md">Edit</button>
                    <button onClick={() => handleDeleteEvent(evt.id)} className="px-3 py-1 text-sm text-white bg-red-600 rounded-md">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
