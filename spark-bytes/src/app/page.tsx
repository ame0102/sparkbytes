
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { Button, Input, Select, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import NavBar from "@/components/NavBar";
import CreateEventModal from "@/components/CreateEventModal";
import { getCurrentUser, getAllEvents, addFavorite, removeFavorite, getFavoriteEventIds } from "@/utils/eventApi";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { FilterOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function Home() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlQuery     = (searchParams.get("search") || "").trim();

  // search input
  const [query, setQuery] = useState(urlQuery);

  // auth guard
  const [authChecked, setAuthChecked] = useState(false);
  const [unauth, setUnauth]           = useState(false);

  // raw events
  const [events, setEvents]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [locFilter,  setLocFilter]  = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("new_to_old");
  const [dietFilter, setDietFilter] = useState<string[]>([]);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize        = 8;

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  
  // favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  const fmt = (d: string) => dayjs(d).format("MMM. D, YYYY");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        setUnauth(true);
      }
      setAuthChecked(true);
    })();
  }, []);  

  // load events
  useEffect(() => {
    (async () => {
      setLoading(true);
      setFavoritesLoading(true);
      const [data, favs] = await Promise.all([
        getAllEvents(urlQuery),
        getFavoriteEventIds()
      ]);
      setEvents(data || []);
      setFavoriteIds(favs);
      setLoading(false);
      setFavoritesLoading(false);
    })();
  }, [urlQuery]);

  // reset page on filter change
  useEffect(() => setPage(1), [query, locFilter, timeFilter, dietFilter]);

  // derive filter options
  const locations = Array.from(new Set(events.map(e => e.location))).sort();
  const dietaryOptions = [
    "Vegan","Vegetarian","Gluten Free","Dairy Free","Nut Free","Other","None"
  ];



  // filter pipeline
  const now = dayjs();

  const filtered = events
    // text search
    .filter(e => {
      if (!dietFilter.length) return true;
      const evDiet = Array.isArray(e.dietary) ? e.dietary : [];
      return evDiet.some((tag: string) => dietFilter.includes(tag));
    })
    .filter(e => e.title.toLowerCase().includes(query.toLowerCase()))
    // location filter
    .filter(e => !locFilter.length || locFilter.includes(e.location))
    // time‐based filter (uses both date + time)
    
    .filter(e => {
      const dt = dayjs(`${e.date} ${e.time}`, "YYYY-MM-DD HH:mm:ss");
      switch (timeFilter) {
        case "happening_now":
          // today’s events that have started and not ended
          return dt.isBefore(now) && !e.ended;
        case "coming_up":
          // strictly in the future and not ended
          return dt.isAfter(now) && !e.ended;
        case "past":
          // anything before today or manually ended
          return dt.isBefore(now.startOf("day")) || e.ended;
        default:
          // for new_to_old / old_to_new include all
          return true;
      }
    });
  
    
  const sorted = [...filtered].sort((a, b) => {
    const aDT = dayjs(`${a.date} ${a.time}`, "YYYY-MM-DD HH:mm:ss");
    const bDT = dayjs(`${b.date} ${b.time}`, "YYYY-MM-DD HH:mm:ss");
  
    if (timeFilter === "new_to_old") {
      // Newest first
      return bDT.valueOf() - aDT.valueOf();
    }
    if (timeFilter === "old_to_new" || timeFilter === "coming_up" ) {
      // Oldest first
      return aDT.valueOf() - bDT.valueOf();
    }
    // default fallback: newest first
    return bDT.valueOf() - aDT.valueOf();
  });
  
  // pagination slice
  const total = sorted.length;
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (authChecked && unauth) {
    router.push('/login');
  }  
  
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
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "2rem 0 1rem"
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: "bold" }}>Events</h2>
        </div>

        {/* filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <Input
              placeholder="Search event titles..."
              allowClear
              value={query}
              prefix={<SearchOutlined style={{ color: "#999" }} />}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={() => {
                router.push(`/?search=${encodeURIComponent(query.trim())}`);
              }}
              style={{
                width: 300, 
                height: 40,          
                borderRadius: 8,         
              }}
            />
            <Dropdown
              trigger={["click"]}
              overlay={
                <Menu style={{ padding: 12, width: 280 }}>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Location</strong>
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Select Locations"
                      value={locFilter}
                      onChange={setLocFilter}
                      style={{ width: "100%", marginTop: 8 }}
                      maxTagCount={2}
                      maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
                    >
                      {locations.map(loc => (
                        <Option key={loc} value={loc}>{loc}</Option>
                      ))}
                    </Select>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <strong>Time</strong>
                    <Select
                      value={timeFilter}
                      onChange={setTimeFilter}
                      style={{ width: "100%", marginTop: 8 }}
                    >
                      <Option value="new_to_old">New to Old</Option>
                      <Option value="old_to_new">Old to New</Option>
                      <Option value="happening_now">Happening Now</Option>
                      <Option value="coming_up">Coming Up</Option>
                    </Select>
                  </div>

                  <div>
                    <strong>Dietary</strong>
                    <Select
  mode="multiple"
  allowClear
  placeholder="Select Dietary Preferences"
  value={dietFilter}
  onChange={setDietFilter}
  style={{ width: "100%", marginTop: 8 }}
  maxTagCount={2}
  maxTagPlaceholder={omitted => `+${omitted.length} more`}
>
  {dietaryOptions.map(d => (
    <Option key={d} value={d}>{d}</Option>
  ))}
</Select>

                  </div>
                  {/* Reset button */}
                  <div style={{ marginTop: 16, textAlign: "right" }}>
                    <Button
                      type="default"
                      size="small"
                      onClick={() => {
                        setLocFilter([]);
                        setTimeFilter("new_to_old");
                        setDietFilter([]);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </Menu>
              }
            >
              <Button size="large" icon={<FilterOutlined />} style={{ borderRadius: 8 }}>
                Filters
              </Button>
            </Dropdown>
          </div>

          {/* Create Event Button */}
          <Button
            type="primary"
            style={{ background: "#CC0000", marginTop: "0.5rem" }}
            onClick={() => setShowCreate(true)}
          >
            + Create Event
          </Button>
        </div>

        {/* events */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: "1.5rem"
          }}
        >
          {paged.map(ev => (
            <Link key={ev.id} href={`/event/${ev.id}`} style={{ textDecoration: "none" }}> 
              <div
                style={{
                  background: "#fff",
                  position: "relative", 
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
                <div
                  className={pulsingId === ev.id ? "pulse" : ""}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setPulsingId(ev.id);
                    setTimeout(() => setPulsingId(null), 400);

                    setFavLoading(true);
                    if (favoriteIds.includes(ev.id)) {
                      await removeFavorite(ev.id);
                      setFavoriteIds(favoriteIds.filter((id) => id !== ev.id));
                    } else {
                      await addFavorite(ev.id);
                      setFavoriteIds([...favoriteIds, ev.id]);
                    }
                    setFavLoading(false);
                  }}
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
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {favoriteIds.includes(ev.id) ? (
                    <StarFilled style={{ fontSize: 24, color: "#CC0000" }} />
                  ) : (
                    <StarOutlined style={{ fontSize: 24, color: "#999" }} />
                  )}
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
                    <p style={{ margin: 0, color: "#999", fontSize: 14, marginBottom: 8,  whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis", }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {ev.address}
                    </p>
                  )}
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis" }}>
                    {ev.title}
                  </h3>
                  <p style={{ margin: "4px 0", color: "#555", fontSize: 12 }}>
                  {fmt(ev.date)} · {dayjs(ev.time, "HH:mm:ss").format("h:mm A")}
                </p>

                  {ev.portions !== undefined && (
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
                    <strong>Portions Left:</strong> {ev.portions}
                  </p>
                )}

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
                   <strong>Food Available:</strong> {ev.food}
                 </p>

                  {/* dietary chips */}
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

        {/* pagination */}
        {total > pageSize && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={p => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        )}

        {/* create modal */}
        <CreateEventModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onEventCreated={async () => {
            const data = await getAllEvents(query);
            setEvents(data);
          }}
        />
      </main>
    </>
  );
}
