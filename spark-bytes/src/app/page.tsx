"use client";

import React, { useState, useEffect } from "react";
import Button from "antd/lib/button";
import { useRouter } from "next/navigation";
import CreateEventModal from "../components/CreateEventModal";
import { getCurrentUser, getAllEvents } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";
import NavBar from "@/components/NavBar";
import dayjs from "dayjs";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [authChecked, setAuthChecked] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM. D, YYYY");
  };

  // Check user authentication status on load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
  
          if (data?.full_name) {
            setUserName(data.full_name);
          } else {
            setUserName(user.email?.split('@')[0] || 'User');
          }
        } else {
          setUnauthorized(true);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUnauthorized(true);
      } finally {
        setAuthChecked(true);
      }
    };
  
    checkUser();
  }, []);  

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        if (data) {
          console.log("Supabase response:", data);
          setEvents(data);
        } else {
          console.warn("No events returned from database.");
        }
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, []);  

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/login");
  };

  // If not authorized, show message and login link
  if (authChecked && unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full text-center border border-red-200 bg-red-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">Please log in to access the home page.</p>

          <div className="flex flex-col items-center gap-3">
            <Button 
              type="primary" 
              style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
              onClick={() => router.push('/login')}
            >
              Login
            </Button>

            <button 
              onClick={() => router.push('/guest')}
              className="text-[#CC0000] underline text-sm mt-1 hover:text-[#A00000] transition-colors"
            >
              Continue as Guest
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
  
      <main style={{ padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Events</h2>
          <Button
            type="primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
          >
            + Create Event
          </Button>
        </div>
  
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginTop: "30px" }}>
          {events.map((event) => (
            <Link key={event.id} href={`/event/${event.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div
              key={event.id}
              style={{
                width: "300px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {/* Top Image */}
              <img
                src={`/${event.location}.jpg`}
                alt={`${event.location} event`}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                }}
                onError={(e) => (e.currentTarget.src = "/default.jpg")} // fallback if not found
              />

              {/* Content */}
              <div style={{ padding: "16px", flex: 1 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "6px", color: "black" }}>
                  {event.title}
                </h3>

                <p style={{ fontSize: "14px", margin: "4px 0", color: "#555" }}>
                  <strong>Time:</strong> {formatDate(event.date)} · {event.time}
                </p>

                <p style={{ fontSize: "14px", margin: "4px 0", color: "#555" }}>
                  <strong>Location:</strong> {event.location}
                </p>

                <p
                  style={{
                    margin: "4px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    fontSize: "14px",
                    color: "#555"
                  }}
                >
                  <strong>Food:</strong> {event.food}
                </p>
              </div>

              {/* Dietary Tags */}
              {event.dietary && event.dietary.length > 0 && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {event.dietary.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: "#e6f4ff",
                        color: "#1677ff",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
            </Link>
          ))}
        </div>
  
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEventCreated={async () => {
            const data = await getAllEvents();
            setEvents(data);
          }}
        />
      </main>
    </>
  );  
}