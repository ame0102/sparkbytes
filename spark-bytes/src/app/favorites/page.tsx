"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spin, Button, Tooltip, message } from "antd";
import { EnvironmentOutlined, StarFilled } from "@ant-design/icons";
import NavBar from "@/components/NavBar";
import { getFavoriteEvents, removeFavorite } from "@/utils/eventApi";
import dayjs from "dayjs";
import Pagination from "antd/lib/pagination";
import { Dropdown, Menu, Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";

export default function FavoritesPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState("new_to_old");
  const now = dayjs();
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const events = await getFavoriteEvents();
      setFavoriteEvents(events || []);
      setLoading(false);
    })();
  }, []);

  const fmt = (d: string) => dayjs(d).format("MMM. D, YYYY");

  const handleRemoveFavorite = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setPulsingId(eventId);
    setTimeout(() => setPulsingId(null), 400);
    
    setRemovingId(eventId);
    
    try {
      await removeFavorite(eventId);
      setFavoriteEvents(favoriteEvents.filter(ev => ev.id !== eventId));
      message.success("Event removed from favorites");
    } catch (error) {
      message.error("Failed to remove event from favorites");
      console.error("Failed to remove favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse 0.4s ease;
        }
      `}</style>
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
          <Dropdown
            trigger={["click"]}
            overlay={
              <Menu style={{ padding: 12, width: 280 }}>
                <div>
                  <strong>Time</strong>
                  <Select
                    value={timeFilter}
                    onChange={setTimeFilter}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    <Select.Option value="new_to_old">New to Old</Select.Option>
                    <Select.Option value="old_to_new">Old to New</Select.Option>
                    <Select.Option value="happening_now">Happening Now</Select.Option>
                    <Select.Option value="coming_up">Coming Up</Select.Option>
                    <Select.Option value="past">Past</Select.Option>
                  </Select>
                </div>

                {/* Reset button */}
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => setTimeFilter("new_to_old")}
                  >
                    Reset Filter
                  </Button>
                </div>
              </Menu>
            }
          >
            <Button
              size="large"
              icon={<FilterOutlined />}
              style={{ borderRadius: 8 }}
            >
              Filters
            </Button>
          </Dropdown>

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
            {[...favoriteEvents]
              .filter(ev => {
                const evDate = dayjs(ev.date);
                if (timeFilter === "happening_now") return evDate.isBefore(now) && !ev.ended;
                if (timeFilter === "coming_up")     return evDate.isAfter(now) && !ev.ended;
                if (timeFilter === "past")          return ev.ended === true;
                return true;
              })
              .sort((a, b) => {
                const da = dayjs(a.date).valueOf();
                const db = dayjs(b.date).valueOf();

                const aStatus = a.ended
                  ? 2
                  : dayjs(a.date).isBefore(now)
                    ? 0
                    : 1;
                const bStatus = b.ended
                  ? 2
                  : dayjs(b.date).isBefore(now)
                    ? 0
                    : 1;

                if (timeFilter === "new_to_old") {
                  if (aStatus !== bStatus) return aStatus - bStatus;
                  return db - da;
                }
                if (timeFilter === "old_to_new") {
                  if (aStatus !== bStatus) return aStatus - bStatus;
                  return da - db;
                }
                return 0;
              })
              .slice((page - 1) * pageSize, page * pageSize)
              .map(ev => (
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
                    minHeight: 360,
                    position: "relative"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {/* Star button for removing from favorites */}
                  <div
                    className={pulsingId === ev.id ? "pulse" : ""}
                    onClick={(e) => handleRemoveFavorite(e, ev.id)}
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: "white",
                      borderRadius: "50%",
                      padding: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      zIndex: 2,
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      opacity: removingId === ev.id ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <StarFilled style={{ fontSize: 24, color: "#CC0000" }} />
                  </div>

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
        {favoriteEvents.length > pageSize && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={
                favoriteEvents.filter(ev => {
                  const evDate = dayjs(ev.date);
                  if (timeFilter === "happening_now") return evDate.isBefore(now) && !ev.ended;
                  if (timeFilter === "coming_up")     return evDate.isAfter(now) && !ev.ended;
                  if (timeFilter === "past")          return ev.ended === true;
                  return true;
                }).length
              }
              onChange={p => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        )}
      </main>
    </>
  );
  }