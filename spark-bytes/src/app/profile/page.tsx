"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";
import EditEventModal from "@/components/EditEventModal";
import NavBar from "@/components/NavBar";
import { DownOutlined } from "@ant-design/icons";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // profile form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [endingEventId, setEndingEventId] = useState<string | null>(null);

  // my events
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [filterMode, setFilterMode] = useState<"active" | "all">("active");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // fetch user & profile
  useEffect(() => {
    (async () => {
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
    })();
  }, [router]);

  // fetch user's events
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingEvents(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      if (!error) setMyEvents(data || []);
      setLoadingEvents(false);
    })();
  }, [user]);

  // save profile
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { ...formData },
    });
    setSaving(false);
    if (error) {
      alert("Update failed");
    } else {
      setIsEditing(false);
    }
  };

  // edit event
  const handleEdit = (id: string) => {
    setEditingEventId(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  // end event
  const handleEndEvent = async () => {
    if (!endingEventId) return;
  
    const { error } = await supabase
      .from("events")
      .update({ ended: true })
      .eq("id", endingEventId);
  
    if (!error) {
      setMyEvents((prev) =>
        prev.map((ev) =>
          ev.id === endingEventId ? { ...ev, ended: true } : ev
        )
      );
    }
  
    setEndingEventId(null);
  };  

  const now = dayjs();

  const filteredEvents = myEvents.filter(ev => {
    if (filterMode === "all") return true;
    return dayjs(ev.date).isBefore(now) && !ev.ended;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-red-600 h-12" />
          <div className="p-6 space-y-6">
            {/* avatar */}
            <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-full border-2 border-red-600 bg-white -mt-12">
              <UserOutlined style={{ fontSize: 36, color: "#CC0000" }} />
            </div>

            {/* profile info */}
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Name"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  rows={3}
                  placeholder="Bio"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Location"
                />
              </div>
            ) : (
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formData.name || "-"}
                </h2>
                <p className="text-gray-600">{formData.email}</p>
                {formData.bio && (
                  <p className="text-gray-700">{formData.bio}</p>
                )}
                {formData.phone && (
                  <p className="text-gray-600">{formData.phone}</p>
                )}
                {formData.location && (
                  <p className="text-gray-600">{formData.location}</p>
                )}
              </div>
            )}

            {/* profile actions */}
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MY EVENTS */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4 relative">
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center text-2xl font-semibold text-gray-800 hover:text-red-600 transition-colors"
                >
                  {filterMode === "active" ? "Active Events" : "All Events"}
                  <DownOutlined className="ml-2 text-base" />
                </button>

                {dropdownOpen && (
                  <div className="absolute mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => { setFilterMode("active"); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Active Events
                    </button>
                    <button
                      onClick={() => { setFilterMode("all"); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      All Events
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loadingEvents ? (
              <p>Loading your events…</p>
            ) : myEvents.length === 0 ? (
              <p className="text-gray-600">
                You haven’t posted any events yet.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {ev.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {dayjs(ev.date).format("MMM D, YYYY")} · {ev.time}
                      </p>
                    </div>
                    <div className="flex space-x-2 items-center">
                      {!ev.ended ? (
                        <>
                          <button
                            onClick={() => handleEdit(ev.id)}
                            className="px-3 py-1 bg-sky-100 text-sky-700 border border-sky-300 rounded-lg hover:bg-sky-200"
                          >
                            Edit
                          </button>

                          <EditEventModal
                            isOpen={!!editingEventId}
                            eventId={editingEventId}
                            onClose={() => setEditingEventId(null)}
                            onEventUpdated={async () => {
                              setLoadingEvents(true);
                              const { data } = await supabase
                                .from("events")
                                .select("*")
                                .eq("user_id", user.id)
                                .order("date", { ascending: true });
                              setMyEvents(data || []);
                              setLoadingEvents(false);
                            }}
                          />

                          <button
                            onClick={() => setEndingEventId(ev.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200"
                          >
                            End
                          </button>
                        </>
                      ) : (
                        <span className="text-red-600 font-semibold">(Ended)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
            {endingEventId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure you want to end this event?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEndingEventId(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={handleEndEvent}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
