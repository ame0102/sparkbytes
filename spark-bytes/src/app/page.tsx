"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import Button from "antd/lib/button";

import NavBar from "@/components/NavBar";
import CreateEventModal from "@/components/CreateEventModal";
import { getCurrentUser, getAllEvents } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";

export default function Home() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlQuery     = (searchParams.get("search") || "").trim();

  // local search input state (sync with URL)
  const [query, setQuery] = useState(urlQuery);

  // auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [unauth, setUnauth]           = useState(false);
  const [isLogged, setIsLogged]       = useState(false);
  const [userName, setUserName]       = useState("User");

  // events state
  const [events,  setEvents]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fmt = (d: string) => dayjs(d).format("MMM. D, YYYY");

  /* auth once */
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        setUnauth(true);
        setAuthChecked(true);
        return;
      }
      setIsLogged(true);
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setUserName(data?.full_name ?? user.email?.split("@")[0] ?? "User");
      setAuthChecked(true);
    })();
  }, []);

  /* fetch events whenever the URL search term changes */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllEvents(urlQuery);
      setEvents(data || []);
      setLoading(false);
    })();
  }, [urlQuery]);

  /* handle inline search typing */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    router.replace(val.trim() ? `/?search=${encodeURIComponent(val.trim())}` : "/");
  };

  if (authChecked && unauth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full text-center border border-red-200 bg-red-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">Please log in to access the home page.</p>
          <div className="flex flex-col items-center gap-3">
            <Button type="primary" style={{ background: "#CC0000" }} onClick={() => router.push("/login")}>Login</Button>
            <button onClick={() => router.push("/guest")} className="text-[#CC0000] underline text-sm mt-1 hover:text-[#A00000]">Continue as Guest</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />

      <main style={{ padding: 40 }}>
        {/* header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: "bold" }}>Events</h2>
          <Button type="primary" onClick={() => setShowCreate(true)} style={{ background: "#CC0000" }}>
            + Create Event
          </Button>
        </div>

        {/* inline search bar */}
        <div style={{ maxWidth: 400, marginBottom: 24 }}>
          <input
            value={query}
            onChange={handleChange}
            placeholder="Search events…"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8 }}
          />
        </div>

        {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading…</p>}
        {!loading && events.length === 0 && <p style={{ textAlign: "center", color: "#666" }}>No events found.</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {events.map((ev) => (
            <Link key={ev.id} href={`/event/${ev.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{ width: 300, background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <img src={`/${ev.location}.jpg`} alt={ev.location} style={{ width: "100%", height: 180, objectFit: "cover" }} onError={(e) => ((e.target as HTMLImageElement).src = "/default.jpg")}/>
                <div style={{ padding: 16, flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 6, color: "black" }}>{ev.title}</h3>
                  <p style={{ fontSize: 14, margin: "4px 0", color: "#555" }}><strong>Time:</strong> {fmt(ev.date)} · {ev.time}</p>
                  <p style={{ fontSize: 14, margin: "4px 0", color: "#555" }}><strong>Location:</strong> {ev.location}</p>
                  <p style={{ fontSize: 14, margin: "4px 0", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><strong>Food:</strong> {ev.food}</p>
                </div>
                {ev.dietary?.length > 0 && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", flexWrap: "wrap", gap: 8, background: "#fafafa" }}>
                    {ev.dietary.map((d: string, i: number) => (
                      <span key={i} style={{ background: "#e6f4ff", color: "#1677ff", padding: "4px 8px", borderRadius: 8, fontSize: 12 }}>{d}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <CreateEventModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onEventCreated={async () => {
            const data = await getAllEvents(query.trim());
            setEvents(data);
          }}
        />
      </main>
    </>
  );
}
