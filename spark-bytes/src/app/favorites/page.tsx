"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spin, Button } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import NavBar from "@/components/NavBar";
import { getFavoriteEvents } from "@/utils/eventApi";
import dayjs from "dayjs";

export default function FavoritesPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const events = await getFavoriteEvents();
      setFavoriteEvents(events || []);
      setLoading(false);
    })();
  }, []);

  const fmt = (d: string) => dayjs(d).format("MMM. D, YYYY");

  return (
    <>
      <NavBar />

      <main
        style={{
          margin: "0 1.25in",
          paddingBottom: "2rem",
          maxWidth: "calc(100% - 2.5in)"
        }}
      >
        <div style={{ margin: "2rem 0 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: "bold" }}>My Favorites</h2>
          <Button type="primary" style={{ background: "#CC0000" }} onClick={() => window.location.href = "/"}>
            Back to Events
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <Spin size="large" />
          </div>
        ) : favoriteEvents.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <p style={{ fontSize: 18, color: "#888" }}>
              You haven't favorited any events yet.
            </p>
            <Button
              type="primary"
              style={{ backgroundColor: "#CC0000", marginTop: 16 }}
              onClick={() => window.location.href = "/"}
            >
              Explore Events
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: "1.5rem"
            }}
          >
            {favoriteEvents.map(ev => (
              <Link key={ev.id} href={`/event/${ev.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "transform .2s",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 360
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <img
                    src={`/${ev.location}.jpg`}
                    alt={ev.location}
                    style={{ width: "100%", height: 200, objectFit: "cover" }}
                    onError={e => (e.currentTarget.src = "/default.jpg")}
                  />
                  <div style={{ padding: 16, flex: 1 }}>
                    {/* address under image */}
                    {ev.address && (
                      <p style={{
                        margin: 0,
                        color: "#999",
                        fontSize: 14,
                        marginBottom: 8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {ev.address}
                      </p>
                    )}
                    <h3 style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {ev.title}
                    </h3>
                    <p style={{ margin: "4px 0", color: "#555", fontSize: 12 }}>
                      {fmt(ev.date)} · {ev.time}
                    </p>

                    {ev.portions !== undefined && (
                      <p style={{
                        margin: "4px 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        fontSize: "14px",
                        color: "#555"
                      }}>
                        <strong>Portions Left:</strong> {ev.portions}
                      </p>
                    )}

                    <p style={{
                      margin: "4px 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      fontSize: "14px",
                      color: "#555"
                    }}>
                      <strong>Food Available:</strong> {ev.food}
                    </p>

                    {ev.dietary?.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ev.dietary.map((d: string, i: number) => (
                          <span
                            key={i}
                            style={{
                              background: "#e6f4ff",
                              color: "#1677ff",
                              padding: "4px 8px",
                              borderRadius: 8,
                              fontSize: 12
                            }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}