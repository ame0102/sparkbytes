
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { Button, Input, Select, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { BookOutlined, BookFilled } from "@ant-design/icons";
import NavBar from "@/components/NavBar";
import CreateEventModal from "@/components/CreateEventModal";
import { getCurrentUser, getAllEvents, addFavorite, removeFavorite, getFavoriteEventIds } from "@/utils/eventApi";
import { EnvironmentOutlined } from "@ant-design/icons";

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
  const [timeFilter, setTimeFilter] = useState("all");
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

  // search handler
  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    router.replace(v.trim() ? `/?search=${encodeURIComponent(v.trim())}` : "/");
  };

  // filter pipeline
  const now = dayjs();
  const filtered = events
    .filter(e => e.title.toLowerCase().includes(query.toLowerCase()))
    .filter(e => !locFilter.length || locFilter.includes(e.location))
    .filter(e => {
      if (timeFilter === "all") return true;
      const ev = dayjs(e.date);
      if (timeFilter === "past_day")    return ev.isBefore(now) && now.diff(ev, "hour")  <= 24;
      if (timeFilter === "past_3days")  return ev.isBefore(now) && now.diff(ev, "day")   <= 3;
      if (timeFilter === "past_week")   return ev.isBefore(now) && now.diff(ev, "day")   <= 7;
      if (timeFilter === "past_3months")return ev.isBefore(now) && now.diff(ev, "month") <= 3;
      if (timeFilter === "next_day")    return ev.isAfter(now)   && ev.diff(now, "hour")  <= 24;
      if (timeFilter === "next_3days")  return ev.isAfter(now)   && ev.diff(now, "day")   <= 3;
      if (timeFilter === "next_week")   return ev.isAfter(now)   && ev.diff(now, "day")   <= 7;
      if (timeFilter === "next_3months")return ev.isAfter(now)   && ev.diff(now, "month") <= 3;
      return true;
    })
    .filter(e => {
      if (!dietFilter.length) return true;
      return (e.dietary || []).some((d: string) => dietFilter.includes(d));
    });

  // pagination slice
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (authChecked && unauth) {
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
          <Button
            type="primary"
            style={{ background: "#CC0000" }}
            onClick={() => setShowCreate(true)}
          >
            + Create Event
          </Button>
        </div>

        {/* filters */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}
        >
          <Input
            size="large"
            value={query}
            onChange={onSearchChange}
            placeholder="Search titles…"
            allowClear
            prefix={<SearchOutlined style={{ color: "#888" }} />}
            style={{ width: 300, borderRadius: 8 }}
          />

          <Select
            mode="multiple"
            allowClear
            placeholder="Locations"
            value={locFilter}
            onChange={setLocFilter}
            style={{ width: 220 }}
            maxTagCount={2}
            maxTagPlaceholder={omitted => `+${omitted.length} more`}
          >
            {locations.map(loc => (
              <Option key={loc} value={loc}>{loc}</Option>
            ))}
          </Select>

          <Select
            value={timeFilter}
            onChange={setTimeFilter}
            style={{ width: 220 }}
          >
            <Option value="all">All Time</Option>
            <Option value="past_day">Past 1 Day</Option>
            <Option value="past_3days">Past 3 Days</Option>
            <Option value="past_week">Past 1 Week</Option>
            <Option value="past_3months">Past 3 Months</Option>
            <Option value="next_day">Next 1 Day</Option>
            <Option value="next_3days">Next 3 Days</Option>
            <Option value="next_week">Next 1 Week</Option>
            <Option value="next_3months">Next 3 Months</Option>
          </Select>

          <Select
            mode="multiple"
            allowClear
            placeholder="Dietary"
            value={dietFilter}
            onChange={setDietFilter}
            style={{ width: 240 }}
            maxTagCount={2}
            maxTagPlaceholder={omitted => `+${omitted.length} more`}
          >
            {dietaryOptions.map(d => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Select>
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
                  minHeight: 360  // ensure taller cards
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

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
                    <BookFilled style={{ fontSize: 24, color: "#CC0000" }} />
                  ) : (
                    <BookOutlined style={{ fontSize: 24, color: "#999" }} />
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
                  <p style={{ margin: "4px 0", color: "#555", fontSize: 12}}>
                    {fmt(ev.date)} · {ev.time}
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
