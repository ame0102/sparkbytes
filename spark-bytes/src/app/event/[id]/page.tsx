"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const sampleEvent = {
  title: "HTC Leftovers",
  date: "February 17th, 2025",
  time: "7:00pm EST",
  location: "Howard Thurman Center",
  image: "image.jpg",
  dietaryOptions: ["Gluten free", "Vegetarian"],
  description: "We have leftover food from the event. We have gluten-free and vegetarian snacks available.",
};

interface Comment {
  id: number;
  author: string;
  message: string;
  replies: Comment[];
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      author: "You",
      message: commentInput.trim(),
      replies: [],
    };
    setComments([newComment, ...comments]);
    setCommentInput("");
  };

  const handleReply = (parentId: number, replyText: string) => {
    if (!replyText.trim()) return;
    const updatedComments = comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            { id: Date.now(), author: "You", message: replyText.trim(), replies: [] },
          ],
        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 max-w-3xl mx-auto">
      <img
        src={sampleEvent.image}
        alt={sampleEvent.title}
        className="w-full h-64 object-cover rounded-lg shadow-sm mb-6"
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{sampleEvent.title}</h1>
      <p className="text-gray-600 mb-1">
        <strong>Date:</strong> {sampleEvent.date}
      </p>
      <p className="text-gray-600 mb-1">
        <strong>Time:</strong> <span className="text-[#CC0000]">{sampleEvent.time}</span>
      </p>
      <p className="text-gray-600 mb-1">
        <strong>Location:</strong> {sampleEvent.location}
      </p>
      <p className="text-gray-600 mb-4">
        <strong>Dietary Options:</strong>{" "}
        <span className="text-[#CC0000]">{sampleEvent.dietaryOptions.join(", ")}</span>
      </p>
      <p className="text-gray-700 mb-8">{sampleEvent.description}</p>

      {/* Comment Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-2 text-sm"
        />
        <button
          onClick={handleAddComment}
          className="bg-[#CC0000] hover:bg-[#A00000] text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Post Comment
        </button>

        <div className="mt-6 space-y-6">
          {comments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} onReply={handleReply} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (parentId: number, replyText: string) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="font-medium text-gray-800">{comment.author}</p>
      <p className="text-gray-700 text-sm mb-2">{comment.message}</p>
      <button
        onClick={() => setShowReplyBox(!showReplyBox)}
        className="text-xs text-[#CC0000] hover:underline"
      >
        Reply
      </button>
      {showReplyBox && (
        <div className="mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
            placeholder="Write a reply..."
          />
          <button
            onClick={() => {
              onReply(comment.id, replyText);
              setReplyText("");
              setShowReplyBox(false);
            }}
            className="mt-1 bg-[#CC0000] hover:bg-[#A00000] text-white px-3 py-1 rounded text-xs"
          >
            Post Reply
          </button>
        </div>
      )}
      {comment.replies.length > 0 && (
        <div className="ml-4 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="border-l-2 border-gray-300 pl-3">
              <p className="font-medium text-gray-800">{reply.author}</p>
              <p className="text-gray-700 text-sm">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
