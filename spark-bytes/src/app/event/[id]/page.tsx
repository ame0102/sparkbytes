"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCommentsByEventId, getEventById, postComment } from "@/utils/eventApi";
import NavBar from "@/components/NavBar";
import dayjs from "dayjs";
import { Spin, Input, Button } from "antd";
import { supabase } from "@/utils/supabaseClient";

const { TextArea } = Input;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getEventById(id),
      getCommentsByEventId(id)
    ]).then(([eventData, commentsData]) => {
      setEvent(eventData);
      setComments(commentsData);
    }).finally(() => setLoading(false));
  }, [id]);

  const handlePostComment = async (parentId: string | null = null) => {
    if (newComment.trim() === "") return;
    const posted = await postComment(id!, newComment, parentId);
    if (posted) {
      setComments(prev => [...prev, posted]);
      setNewComment("");
      setReplyingTo(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;
  
    console.log("Trying to delete comment:", commentId);
  
    const { data, error } = await supabase
      .from("comments")
      .update({ deleted: true })
      .eq("id", commentId)
      .select();
  
    if (error) {
      console.error("Error deleting comment:", error.message);
      return;
    }
  
    console.log("Deleted comment response:", data);
  
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, deleted: true } : c))
    );
  };
  

  const renderComments = (parentId: string | null = null, level = 0) => {
    const filtered = comments.filter(c => c.parent_id === parentId);

    return (
      <div className={`space-y-4 ${level > 0 ? 'pl-6 border-l-2 border-gray-300' : ''}`}>
        {filtered.map(comment => (
          <div key={comment.id}>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-800">
                {comment.deleted ? (
                  <em className="text-gray-400">This comment has been deleted.</em>
                ) : (
                  comment.content
                )}
              </p>
              <p className="text-sm text-gray-500">
                {dayjs(comment.created_at).format('MMM D, YYYY h:mm A')}
              </p>

              <Button
                size="small"
                type="link"
                onClick={() => setReplyingTo(comment.id)}
                className="p-0 mt-1"
              >
                Reply
              </Button>

              {/* Only show Delete button if not deleted */}
              {!comment.deleted && (
                <Button
                  size="small"
                  type="link"
                  danger
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-0 mt-1"
                >
                  Delete
                </Button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mt-2 flex flex-col gap-2">
                <TextArea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your reply..."
                />
                <div className="flex gap-2">
                  <Button type="primary" onClick={() => handlePostComment(comment.id)}>
                    Post Reply
                  </Button>
                  <Button onClick={() => { setReplyingTo(null); setNewComment(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {renderComments(comment.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

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

        {/* COMMENTS SECTION */}
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Comments</h2>
            <div className="flex flex-col gap-2">
              <TextArea
                rows={4}
                value={replyingTo ? "" : newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a new comment..."
                disabled={replyingTo !== null}
              />
              {!replyingTo && (
                <Button
                  type="primary"
                  style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
                  onClick={() => handlePostComment(null)}
                >
                  Post Comment
                </Button>
              )}
            </div>

            {/* Render all comments */}
            {renderComments()}
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
