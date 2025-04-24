"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/utils/eventApi";
import NavBar from "@/components/NavBar";
import dayjs from "dayjs";
import { Spin } from "antd";
import Button from "antd/lib/button";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin className="mt-20" />;

  if (!event) {
    router.push("/404");
    return null;
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event image */}
          <img
            src={`/${event.location}.jpg`}
            alt={event.location}
            onError={e =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
            className="w-full h-64 object-cover"
          />
          <div className="p-6 space-y-4">
            {/* Title & meta */}
            <h1 className="text-3xl font-bold text-gray-900">
              {event.title}
            </h1>
            <p className="text-gray-600">
              {dayjs(event.date).format("MMMM D, YYYY")} • {event.time} •{" "}
              {event.location}
            </p>
            {/* Address */}
            {event.address && (
              <p className="text-gray-600">
                <strong>Address:</strong> {event.address}
              </p>
            )}

            {/* Description */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Description
              </h2>
              <p className="text-gray-700">
                {event.description || "No description provided."}
              </p>
            </section>

            {/* Food */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">Food</h2>
              <p className="text-gray-700">{event.food || "N/A"}</p>
            </section>

            {/* Dietary chips */}
            {event.dietary?.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  Dietary Options
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.dietary.map((d: string) => (
                    <span
                      key={d}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="max-w-3xl mx-auto mt-6">
          <Button
            type="primary"
            style={{ background: "#CC0000", borderColor: "#CC0000", color: "#fff" }}
            onClick={() => router.push("/")}
          >
            ← Back to all events
          </Button>
        </div>
      </main>
    </>
  );
}
