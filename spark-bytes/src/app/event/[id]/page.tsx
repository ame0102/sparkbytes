"use client";
import React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCommentsByEventId, getEventById, postComment } from "@/utils/eventApi";
import NavBar from "@/components/NavBar";
import dayjs from "dayjs";
import Typography from 'antd/es/typography';

import { Spin, Input, Button } from "antd";
import Space from "antd/es/space";
import Divider from "antd/es/divider";
import Card from "antd/es/card";
import Avatar from "antd/es/avatar";
import { supabase } from "@/utils/supabaseClient";
import { EnvironmentOutlined, UserOutlined, CommentOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { addFavorite, removeFavorite, getFavoriteEventIds } from "@/utils/eventApi";
import { StarOutlined, StarFilled } from "@ant-design/icons";

import TextArea from "antd/es/input/TextArea";
const { Title, Text, Paragraph } = Typography;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
  
    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchEventData = async () => {
      try {
        // Get event data
        const eventData = await getEventById(id);
        
        // If we have a user_id in the event, fetch their profile
        if (eventData.user_id) {
          // First try to get from the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', eventData.user_id)
            .single();
            
          if (!profileError && profileData) {
            // If we found a profile, use it
            setCreatorInfo({
              name: profileData.name || profileData.full_name,
              email: eventData.creator_email,
              id: eventData.user_id
            });
            
            // Update event data with creator name
            eventData.creator_name = profileData.name || profileData.full_name;
          } else {
            // Fallback: get user data from auth.users if available
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name, email')
              .eq('id', eventData.user_id)
              .single();
              
            if (!userError && userData) {
              setCreatorInfo({
                name: userData.name,
                email: userData.email,
                id: eventData.user_id
              });
              
              // Update event data with creator name
              eventData.creator_name = userData.name;
            }
          }
        }
        
        // Get comments
        const commentsData = await getCommentsByEventId(id);
        
        // Update state
        setEvent(eventData);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [id]);

  const loadFavoriteStatus = async () => {
    const favoriteIds = await getFavoriteEventIds();
    setIsFavorite(favoriteIds.includes(id));
  };
  loadFavoriteStatus();
  
  const handleToggleFavorite = async () => {
    if (!currentUser) return;
  
    setPulsing(true);
    setTimeout(() => setPulsing(false), 400);
  
    setFavLoading(true);
    if (isFavorite) {
      await removeFavorite(id);
      setIsFavorite(false);
    } else {
      await addFavorite(id);
      setIsFavorite(true);
    }
    setFavLoading(false);
  };  

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
      
      <div style={{ 
        marginLeft: level > 0 ? 24 : 0,
        borderLeft: level > 0 ? '2px solid #f0f0f0' : 'none',
        paddingLeft: level > 0 ? 16 : 0,
      }}>
        {filtered.map(comment => (
          <div key={comment.id} style={{ marginBottom: 16 }}>
            <Card
              size="small"
              style={{ 
                backgroundColor: '#f9f9f9',
                borderRadius: 8,
                marginBottom: 8
              }}
              bodyStyle={{ padding: '12px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  size={36} 
                  style={{ backgroundColor: '#CC0000' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: 4 
                  }}>
                  <Text strong>{comment.user_name}</Text>
                     <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(comment.created_at).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </div>
                  
                  <Paragraph style={{ margin: '8px 0' }}>
                    {comment.deleted ? (
                      <Text type="secondary" italic>This comment has been deleted.</Text>
                    ) : (
                      comment.content
                    )}
                  </Paragraph>
                  
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setReplyingTo(comment.id)}
                      disabled={comment.deleted || event.ended }
                      style={{ padding: '0', height: 'auto', fontSize: 13 }}
                    >
                      Reply
                    </Button>

                    {!comment.deleted && currentUser?.id === comment.user_id && (
                      <Button
                        type="text"
                        size="small"
                        danger
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{ padding: '0', height: 'auto', fontSize: 13 }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {replyingTo === comment.id && (
              <div style={{ 
                marginLeft: 48, 
                marginBottom: 20, 
                backgroundColor: 'white', 
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}>
                <TextArea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your reply..."
                  style={{ marginBottom: 12, borderRadius: 4 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button 
                    type="primary" 
                    size="small"
                    style={{ backgroundColor: '#CC0000', borderColor: '#CC0000' }}
                    onClick={() => handlePostComment(comment.id)}
                  >
                    Post Reply
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => { setReplyingTo(null); setNewComment(""); }}
                  >
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

  if (loading) {
    return (
      <>
        <NavBar />
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 70px)' 
        }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  if (!event) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <NavBar />
      <main style={{ 
        backgroundColor: '#f9f9f9', 
        minHeight: 'calc(100vh - 70px)',
        padding: '40px 20px'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          {/* Back button */}
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/")}
            style={{ alignSelf: 'flex-start' }}
          >
            Back to Events
          </Button>

          {/* Event Card */}
          <Card 
            style={{ 
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* Event image */}
            <div style={{ position: 'relative' }}>
              <img
                src={`/${event.location}.jpg`}
                alt={event.location}
                onError={e => ((e.target as HTMLImageElement).src = "/default.jpg")}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div
                className={pulsing ? "pulse" : ""}
                onClick={handleToggleFavorite}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 15,
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
                {isFavorite ? (
                  <StarFilled style={{ fontSize: 24, color: "#CC0000" }} />
                ) : (
                  <StarOutlined style={{ fontSize: 24, color: "#999" }} />
                )}
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* Event info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={2} style={{ margin: 0 }}>
                    {event.title}
                  </Title>
                  {event.ended && (
                    <span
                      style={{
                        backgroundColor: '#CC0000',
                        color: 'white',
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 12,
                        height: 'fit-content',
                        lineHeight: '1'
                      }}
                    >
                      Ended
                    </span>
                  )}
                </div>
                
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {/* Creator name with enhanced display */}
                  <Text type="secondary" style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    <span style={{ fontWeight: 500 }}>Posted by:</span> {event.creator_name || (event.creator_email ? event.creator_email.split('@')[0] : 'Anonymous')}
                  
                  </Text>
                  
                  {/* Date and time */}
                  <Text style={{ fontSize: '15px', display: 'block', margin: '8px 0' }}>
              <strong>When:</strong>{" "}
              {dayjs(event.date).format("MMMM D, YYYY")} •{" "}
              {dayjs(event.time, "HH:mm:ss").format("h:mm A")}
            </Text>
                  
                  {/* Location */}
                  <Text style={{ fontSize: '15px', display: 'block', margin: '8px 0' }}>
                    <strong>Where:</strong> {event.location}
                  </Text>
                  
                  {/* Address with Google Maps link */}
                  {event.address && (
                    <div>
                      <Text>
                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1677ff' }}
                        >
                          {event.address}
                        </a>
                      </Text>
                      {event.room && (
                        <div style={{ marginTop: 4, marginLeft: 24 }}>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            Room/Unit: {event.room}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Food info */}
                  <div>
                    <Title level={5} style={{ marginBottom: 8, marginTop: 16 }}>
                      Food Available
                    </Title>
                    <Text>{event.food || "N/A"}</Text>
                  </div>

                  {/* Portions left */}
                  {event.portions !== undefined && (
                    <Text>
                      <strong>Portions Left:</strong> {event.portions}
                    </Text>
                  )}
                  
                  {/* Dietary options */}
                  {event.dietary?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Title level={5} style={{ marginBottom: 8 }}>
                        Dietary Options
                      </Title>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {event.dietary.map((d: string) => (
                          <span
                            key={d}
                            style={{
                              background: "#e6f4ff",
                              color: "#1677ff",
                              padding: "4px 12px",
                              borderRadius: 16,
                              fontSize: 13
                            }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Space>
              </div>
            </div>
          </Card>

          {/* Comments Section */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CommentOutlined style={{ color: '#CC0000' }} />
                <span>Comments ({comments.length})</span>
              </div>
            }
            style={{ 
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            {/* New comment input */}
            <div style={{ marginBottom: 24 }}>
              <TextArea
                rows={3}
                value={replyingTo ? "" : newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                disabled={replyingTo !== null || event.ended }
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
              {!replyingTo && !event.ended && (
                <Button
                  type="primary"
                  style={{ 
                    backgroundColor: "#CC0000", 
                    borderColor: "#CC0000" 
                  }}
                  onClick={() => handlePostComment(null)}
                >
                  Post Comment
                </Button>
              )}

              {event.ended && (
                <Text type="secondary" italic>
                  Commenting is closed because this event has ended.
                </Text>
              )}
            </div>

            <Divider style={{ margin: '8px 0 24px' }} />

            {/* Comments list */}
            {comments.length > 0 ? (
              renderComments()
            ) : (
              !event.ended && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '24px 0', 
                  color: '#999' 
                }}>
                  <Text type="secondary">Be the first to comment on this event!</Text>
                </div>
              )
            )}
          </Card>
        </div>
      </main>
    </>
  );
}