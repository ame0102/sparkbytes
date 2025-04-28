"use client";

import { useState, useEffect } from "react";
import React from 'react';

import { Avatar, Button, Dropdown, Menu } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  StarOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [width, setWidth]           = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const isDesktop = width >= 768;

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const fallback = user.email?.split("@")[0] || "User";
      let displayName = fallback;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) displayName = data.full_name;

      setUserName(displayName);
      setIsLoggedIn(true);
    })();

    const onResize = () => {
      setWidth(window.innerWidth);
      if (window.innerWidth >= 768) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/login");
  };

  const avatarMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "logout") return handleLogout();
        router.push("/profile");
      }}
      style={{
        borderRadius: "12px", 
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}
    >
      <Menu.Item key="profile" icon={<UserOutlined style={{ color: "#CC0000" }} />}>
        <span style={{ fontWeight: "600", fontSize: "15px" }}>My Profile</span>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined style={{ color: "#CC0000" }} />} danger>
        <span style={{ fontWeight: "600", fontSize: "15px" }}>Logout</span>
      </Menu.Item>
    </Menu>
  );

  const avatarEl = (
    <Avatar
      size={36}
      style={{ 
        backgroundColor: "#fff", 
        border: "2px solid #fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        cursor: "pointer"
      }}
      icon={<UserOutlined style={{ color: "#CC0000" }} />}
    />
  );

  return (
    <>
      <div className="bg-[#CC0000] w-full" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div
          className="flex justify-between items-center"
          style={{ 
            height: 70, 
            paddingLeft: "1.5rem", 
            paddingRight: "2.5rem",
            maxWidth: "calc(100% - 2.5in)",
            margin: "0 auto",
            width: "100%"
          }}
        >
          {/* left: burger + logo */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <button
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
                className="text-white p-2 hover:bg-[#aa0000] rounded-full transition-colors duration-200"
                style={{ lineHeight: 0 }}
              >
                <MenuOutlined style={{ fontSize: 22 }} />
              </button>
            )}

            <div
              onClick={() => router.push("/")}
              className="flex items-center font-bold text-white text-xl"
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-12 rounded-full mr-3"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              />
              {width >= 640 && <span style={{ 
                fontFamily: "'Nunito', sans-serif", 
                fontWeight: 800,
                fontSize: "22px",
                letterSpacing: "0.3px",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}>Spark! Bytes</span>}
            </div>
          </div>

          {/* right: avatar/login */}
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <Dropdown overlay={avatarMenu} placement="bottomRight">
                {avatarEl}
              </Dropdown>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                icon={<UserOutlined style={{ color: "#CC0000" }} />}
                style={{ 
                  background: "#fff", 
                  color: "#CC0000", 
                  borderRadius: "8px", 
                  fontWeight: 700, 
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  height: "36px",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "15px"
                }}
              >
                {width > 380 ? "Login" : ""}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
          {/* Menu panel */}
          <div 
            className="bg-white rounded-r-2xl shadow-lg relative"
            style={{ 
              width: isDesktop ? 320 : '75%', 
              maxWidth: 320,
              height: 'auto',
              maxHeight: '75vh',
              marginTop: '80px',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <CloseOutlined style={{ fontSize: 18, color: "#666" }} />
            </button>
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => {
                  router.push("/profile");
                  setDrawerOpen(false);
                }}
              >
                <Avatar 
                  size={42} 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: "#CC0000", 
                    color: "white",
                    flexShrink: 0
                  }}
                />
                <div className="overflow-hidden">
                  <div 
                    style={{ 
                      fontWeight: 700, 
                      fontSize: '18px', 
                      color: '#333',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span>{userName}</span>
                    <span 
                      className="ml-1.5 text-gray-500 hover:text-[#CC0000]" 
                      style={{ fontSize: '14px', transition: 'color 0.2s' }}
                    >
                      (View Profile)
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    BU Student
                  </div>
                </div>
              </div>
            </div>
            
            {/* Menu items */}
            <div className="py-4">
              <div 
                className={`flex items-center px-6 py-3 ${pathname === '/' ? 'bg-red-50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                onClick={() => {
                  router.push('/');
                  setDrawerOpen(false);
                }}
              >
                <HomeOutlined style={{ fontSize: 18, color: "#CC0000", marginRight: 12 }} />
                <span style={{ 
                  fontWeight: pathname === '/' ? 700 : 600,
                  fontSize: '16px',
                  color: '#333'
                }}>
                  Home
                </span>
              </div>
              
              <div 
                className={`flex items-center px-6 py-3 ${pathname === '/favorites' ? 'bg-red-50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                onClick={() => {
                  router.push('/favorites');
                  setDrawerOpen(false);
                }}
              >
                <StarOutlined style={{ fontSize: 18, color: "#CC0000", marginRight: 12 }} />
                <span style={{ 
                  fontWeight: pathname === '/favorites' ? 700 : 600,
                  fontSize: '16px',
                  color: '#333'
                }}>
                  Favorites
                </span>
              </div>
              
              <div 
                className={`flex items-center px-6 py-3 ${pathname === '/profile' ? 'bg-red-50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                onClick={() => {
                  router.push('/profile');
                  setDrawerOpen(false);
                }}
              >
                <UserOutlined style={{ fontSize: 18, color: "#CC0000", marginRight: 12 }} />
                <span style={{ 
                  fontWeight: pathname === '/profile' ? 700 : 600,
                  fontSize: '16px',
                  color: '#333'
                }}>
                  My Profile
                </span>
              </div>
              
              {/* Logout */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div 
                  className="flex items-center px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    handleLogout();
                    setDrawerOpen(false);
                  }}
                >
                  <LogoutOutlined style={{ fontSize: 18, color: "#CC0000", marginRight: 12 }} />
                  <span style={{ 
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#CC0000'
                  }}>
                    Logout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;