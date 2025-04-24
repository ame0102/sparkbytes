"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

/* 👉  NEW: bring in the shared navigation bar */
import NavBar from "@/components/NavBar";            // adjust path if different

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setFormData({
        name: user.user_metadata?.name ?? "",
        email: user.email ?? "",
        bio: user.user_metadata?.bio ?? "",
        phone: user.user_metadata?.phone ?? "",
        location: user.user_metadata?.location ?? "",
      });
    };

    fetchUser();
  }, [router]);


  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
        },
      });

      if (error) throw error;

      setIsEditing(false);

      // refresh cached user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };


  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );


  return (
    <div className="min-h-screen bg-white flex flex-col">

      <NavBar />


      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-md p-8">
          <div className="text-center mb-8">
            {/* avatar placeholder – add user image if desired */}
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200" />


            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  placeholder="Full Name"
                />

                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                />

                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  rows={3}
                  placeholder="Write a short bio…"
                />

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  placeholder="Phone"
                />

                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  placeholder="Location"
                />
              </div>
            ) : (

              <>
                <h2 className="text-xl font-semibold text-gray-800">
                  {formData.name || "No name set"}
                </h2>
                <p className="text-gray-500">{formData.email}</p>
                <p className="text-gray-600 text-sm mt-2">
                  {formData.bio || "No bio yet"}
                </p>
                {formData.phone && (
                  <p className="text-gray-500 mt-2">{formData.phone}</p>
                )}
                {formData.location && (
                  <p className="text-gray-500">{formData.location}</p>
                )}
              </>
            )}
          </div>


          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-[#CC0000] hover:bg-[#A00000] text-white py-3 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#CC0000] hover:bg-[#A00000] text-white py-3 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
