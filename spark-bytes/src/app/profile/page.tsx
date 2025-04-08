"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Layout, Button, Avatar, Dropdown, Menu } from "antd";

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
      if (user) {
        setUser(user);
        setFormData({
          name: user.user_metadata?.name || "",
          email: user.email || "",
          bio: user.user_metadata?.bio || "",
          phone: user.user_metadata?.phone || "",
          location: user.user_metadata?.location || "",
        });
      } else {
        router.push("/login");
      }
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
      // Refresh user data
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Error updating profile:", error);
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
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header remains the same */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#808080] rounded-full"></div>
            <h1 className="text-xl font-semibold text-gray-800">
              Spark! Bytes
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#808080] hover:text-[#A00000] font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 relative">
              {/* can add user profile image here */}
              {/* <img
                src={
                  user.user_metadata?.avatar_url ||
                  "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-full h-full rounded-full border border-gray-300 object-cover"
              /> */}
            </div>

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
                  placeholder="Write a short bio..."
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-100 hover:text-[#A00000] text-gray-800 py-3 rounded-lg font-medium transition-colors"
              style={{ background: "#cc0103", color: "white" }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </main>
    </div>
  );
}