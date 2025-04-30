"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, 
         EnvironmentOutlined, MenuOutlined, FilterOutlined, 
         CheckCircleOutlined, EditOutlined, StopOutlined,
         SortAscendingOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import EditEventModal from "@/components/EditEventModal";
import NavBar from "@/components/NavBar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // profile form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",

  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [endingEventId, setEndingEventId] = useState<string | null>(null);

  // events states
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [filterMode, setFilterMode] = useState<"active" | "all">("active");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"recent" | "ongoing" | "past">("recent");
  
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  // fetch user data
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
      });
    })();
  }, [router]);

  // fetch events
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

  // Filter events based on current filter and sort modes
  const filteredEvents = myEvents.filter(ev => {
    if (filterMode === "all") return true;
    return dayjs(ev.date).isBefore(now) && !ev.ended;
  }).sort((a, b) => {
    // Sort based on sort mode
    if (sortMode === "recent") {
      return dayjs(b.date).unix() - dayjs(a.date).unix(); // newest first
    } else if (sortMode === "ongoing") {
      const aIsOngoing = dayjs(a.date).isBefore(now) && !a.ended;
      const bIsOngoing = dayjs(b.date).isBefore(now) && !b.ended;
      if (aIsOngoing && !bIsOngoing) return -1;
      if (!aIsOngoing && bIsOngoing) return 1;
      return dayjs(a.date).unix() - dayjs(b.date).unix();
    } else if (sortMode === "past") {
      const aIsPast = a.ended || dayjs(a.date).isBefore(now);
      const bIsPast = b.ended || dayjs(b.date).isBefore(now);
      if (aIsPast && !bIsPast) return -1;
      if (!aIsPast && bIsPast) return 1;
      return dayjs(b.date).unix() - dayjs(a.date).unix();
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#CC0000] h-12" />
          <div className="p-6 space-y-6">
            {/* avatar */}
            <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-full border-2 border-[#CC0000] bg-white -mt-12">
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
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                  placeholder="Name"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                  rows={3}
                  placeholder="Bio"
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
                    className="flex-1 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#aa0000] disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 bg-white text-[#CC0000] border border-[#CC0000] rounded-lg hover:bg-red-50"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MY EVENTS - ENHANCED UI */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header with filter and sort */}
            <div className="bg-[#CC0000] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">My Events</h2>
              
              <div className="flex space-x-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <SortAscendingOutlined />
                    <span>
                      {sortMode === "recent" ? "Recent" : 
                       sortMode === "ongoing" ? "Ongoing" : "Past"}
                    </span>
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={() => { setSortMode("recent"); setSortDropdownOpen(false); setCurrentPage(1); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>Recent First</span>
                      </button>
                      <button
                        onClick={() => { setSortMode("past"); setSortDropdownOpen(false); setCurrentPage(1); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>Past First</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FilterOutlined />
                    <span>{filterMode === "active" ? "Active" : "All"}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={() => { setFilterMode("active"); setDropdownOpen(false); setCurrentPage(1); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <CheckCircleOutlined style={{ color: filterMode === "active" ? "#CC0000" : "#999" }} />
                        <span>Active Events</span>
                      </button>
                      <button
                        onClick={() => { setFilterMode("all"); setDropdownOpen(false); setCurrentPage(1); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <MenuOutlined style={{ color: filterMode === "all" ? "#CC0000" : "#999" }} />
                        <span>All Events</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loadingEvents ? (
                <div className="py-8 flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-red-200 border-t-[#CC0000] rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading your events...</p>
                  </div>
                </div>
              ) : myEvents.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CalendarOutlined style={{ fontSize: 32, color: "#999" }} />
                  </div>
                  <p className="text-gray-600 mb-6">You haven't posted any events yet.</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#aa0000] transition-colors"
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {paginatedEvents.map((ev) => (
                      <div key={ev.id} className="py-4 first:pt-0 last:pb-0">
                        <div className={`rounded-xl overflow-hidden border ${!ev.ended ? 'border-gray-200' : 'border-gray-200 bg-gray-50'}`}>
                          {/* Image banner with event title overlay */}
                          <div className="h-32 bg-gray-200 relative">
                            <img
                              src={`/${ev.location}.jpg`}
                              alt={ev.location}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.target as HTMLImageElement).src = "/default.jpg")}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                              <div className="p-4 w-full">
                                <h3 className="text-white font-bold text-lg truncate">{ev.title}</h3>
                                {ev.ended && (
                                  <span className="inline-block mt-1 px-2 py-1 bg-[#CC0000]/80 text-white text-xs rounded-md">
                                    Ended
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Event details */}
                          <div className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <CalendarOutlined className="mr-2" />
                                <span>{dayjs(ev.date).format("MMM D, YYYY")}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <ClockCircleOutlined className="mr-2" />
                                <span>{ev.time}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <EnvironmentOutlined className="mr-2" />
                                <span>{ev.location}</span>
                              </div>
                            </div>
                            
                            {/* Event food info */}
                            {ev.food && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Food: </span>
                                <span className="text-gray-700">{ev.food}</span>
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => router.push(`/event/${ev.id}`)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center text-sm"
                              >
                                View
                              </button>
                              
                              {!ev.ended && (
                                <>
                                  <button
                                    onClick={() => handleEdit(ev.id)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center text-sm"
                                  >
                                    <EditOutlined className="mr-1" /> 
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => setEndingEventId(ev.id)}
                                    className="px-3 py-1.5 bg-red-50 text-[#CC0000] rounded-md hover:bg-red-100 flex items-center text-sm"
                                  >
                                    <StopOutlined className="mr-1" />
                                    End Event
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <LeftOutlined />
                      </button>
                      
                      <div className="text-gray-700">
                        Page {currentPage} of {totalPages}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <RightOutlined />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={!!editingEventId}
        eventId={editingEventId}
        onClose={() => setEditingEventId(null)}
        onEventUpdated={async () => {
          setLoadingEvents(true);
          try {
            const { data, error } = await supabase
              .from("events")
              .select("*")
              .eq("user_id", user.id)
              .order("date", { ascending: true });
              
            if (error) throw error;
            setMyEvents(data || []);
          } catch (err) {
            console.error("Failed to refresh events:", err);
          } finally {
            setLoadingEvents(false);
          }
        }}
      />
      
      {/* End Event Confirmation Modal */}
      {endingEventId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800">
              End This Event?
            </h2>
            <p className="text-gray-600">
              This will mark the event as ended and remove it from active listings. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEndingEventId(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndEvent}
                className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#aa0000] transition-colors"
              >
                End Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}