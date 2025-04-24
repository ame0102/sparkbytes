"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/utils/eventApi";
import NavBar from "@/components/NavBar";
import dayjs from "dayjs";
import { Spin } from "antd";
import Button from "antd/lib/button/button";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEventById(id as string)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin className="mt-10" />;

  if (!event) {
    router.push("/404");
    return null;
  }

  return (
    <>
      <NavBar />

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <Button type="link" onClick={() => history.back()} style={{ paddingLeft: 0 }}>
          ← Back to all events
        </Button>

        <header className="space-y-1">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-gray-600">
            {dayjs(event.date).format("MMMM D, YYYY")} • {event.time} • {event.location}
          </p>
        </header>

        {/* optional image */}
        <img
          src={`/${event.location}.jpg`}
          onError={(e) => (e.currentTarget.style.display = "none")}
          alt=""
          className="w-full h-64 object-cover rounded-xl shadow"
        />

        <section className="prose max-w-none">
          <h2>Description</h2>
          <p>{event.description || "No description provided."}</p>

          <h2>Food</h2>
          <p>{event.food || "N/A"}</p>

          {event.dietary?.length > 0 && (
            <>
              <h2>Dietary Options</h2>
              <ul>{event.dietary.map((d: string) => <li key={d}>{d}</li>)}</ul>
            </>
          )}
        </section>
      </main>
    </>
  );

}
