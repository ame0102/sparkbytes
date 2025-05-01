"use client";

import React, { useState, useEffect } from "react";
import { Card, Empty, Spin, Badge, Button, Divider } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "@/utils/supabaseClient";
import { getCurrentUser } from "@/utils/eventApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// Helpers
const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d);
};

const formatTimestamp = (ts) => {
  if (!ts || !isValidDate(ts)) return "Unknown time";
  return dayjs(ts).fromNow();
};

const AlertsMenu = ({ onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch alerts when the component mounts
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return setLoading(false);

      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;

      setAlerts(data || []);
      setUnreadCount((data || []).filter((a) => !a.is_read).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;

      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const toMark = alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (!toMark.length) return;
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .in("id", toMark);
      if (error) throw error;

      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAlert = async (id) => {
    try {
      const old = alerts.find((a) => a.id === id);
      const { error } = await supabase.from("alerts").delete().eq("id", id);
      if (error) throw error;

      setAlerts((prev) => prev.filter((a) => a.id !== id));
      if (old && !old.is_read) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case "upcoming_favorite":
        return { color: "#CC0000", background: "#FFEBEB" };
      case "low_capacity":
        return { color: "#FF8800", background: "#FFF8E6" };
      default:
        return { color: "#888", background: "#F5F5F5" };
    }
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <BellOutlined style={{ marginRight: 8 }} />
            Alerts
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: 8, backgroundColor: "#CC0000" }} />
            )}
          </div>
          {unreadCount > 0 && (
            <Button type="text" size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      }
      extra={<Button type="text" size="small" onClick={onClose}>×</Button>}
      style={{
        width: 320,
        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
        borderRadius: 8,
        maxHeight: "calc(100vh - 100px)",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 0, maxHeight: "calc(100vh - 180px)", overflowY: "auto" } }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}><Spin /></div>
      ) : alerts.length === 0 ? (
        <Empty description="No alerts yet" style={{ margin: 24 }} />
      ) : (
        alerts.map((alert, idx) => (
          <React.Fragment key={alert.id}>
            <div
              onClick={() => {
                if (!alert.is_read) markAsRead(alert.id);
                window.location.href = `/event/${alert.event_id}`;
                onClose();
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: !alert.is_read ? "#e6f7ff" : undefined,
                cursor: "pointer",
              }}
            >
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    marginBottom: 8,
                    ...getStyle(alert.type),
                  }}
                >
                  {alert.type === "upcoming_favorite"
                    ? "Upcoming"
                    : alert.type === "low_capacity"
                    ? "Low Capacity"
                    : "Alert"}
                </span>
                <div style={{ fontWeight: alert.is_read ? 400 : 600 }}>{alert.message}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  {formatTimestamp(alert.created_at)}
                </div>
              </div>
              <div style={{ marginLeft: 16, display: "flex", gap: 4 }}>
                {!alert.is_read && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(alert.id);
                    }}
                  />
                )}
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAlert(alert.id);
                  }}
                />
              </div>
            </div>
            {idx < alerts.length - 1 && <Divider style={{ margin: 0 }} />}
          </React.Fragment>
        ))
      )}
    </Card>
  );
};

export default AlertsMenu;