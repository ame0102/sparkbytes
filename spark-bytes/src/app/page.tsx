
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { Button, Input, Select, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import NavBar from "@/components/NavBar";
import CreateEventModal from "@/components/CreateEventModal";
import { getCurrentUser, getAllEvents } from "@/utils/eventApi";
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
  const pageSize        = 10;

  // create modal
  const [showCreate, setShowCreate] = useState(false);

  const fmt = (d: string) => dayjs(d).format("MMM. D, YYYY");

  // load events
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllEvents(urlQuery);
      setEvents(data || []);
      setLoading(false);
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

        {/* status */}
        {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading…</p>}
        {!loading && total === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>No events found.</p>
        )}

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
                <img
                  src={`/${ev.location}.jpg`}
                  alt={ev.location}
                  style={{ width: "100%", height: 200, objectFit: "cover" }}
                  onError={e => (e.currentTarget.src = "/default.jpg")}
                />
                <div style={{ padding: 16, flex: 1 }}>
                  {/* address under image */}
                  {ev.address && (
                    <p style={{ margin: 0, color: "#999", fontSize: 14, marginBottom: 8,  textOverflow: "ellipsis", }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {ev.address}
                    </p>
                  )}
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: "bold" }}>
                    {ev.title}
                  </h3>
                  <p style={{ margin: "4px 0", color: "#555", fontSize: 12}}>
                    {fmt(ev.date)} · {ev.time}
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
