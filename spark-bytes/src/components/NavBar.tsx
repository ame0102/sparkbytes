"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { Avatar, Button, Drawer, Dropdown, Menu } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  StarOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  MailOutlined
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [width, setWidth] = useState(
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

  const navigateToProfile = () => {
    router.push("/profile");
    setDrawerOpen(false);
  };

  const drawerMenu = (
    <div className="py-3">
      <div 
        className="px-6 pb-3 mb-2 border-b border-gray-100"
        onClick={navigateToProfile}
        style={{ cursor: "pointer" }}
      >
        <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
          <Avatar 
            size={40}
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: "#f5f5f5", 
              color: "#CC0000",
              border: "1px solid #e0e0e0"
            }}
          />
          <div>
            <div className="font-semibold text-gray-800">{userName}</div>
            <div className="text-xs text-gray-500">BU Student</div>
          </div>
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        onClick={({ key }) => {
          if (key === "logout") return handleLogout();
          router.push(key);
          setDrawerOpen(false);
        }}
        style={{ 
          borderRight: 0,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        <Menu.Item key="/" icon={<HomeOutlined style={{ color: "#CC0000" }} />}>
          <span style={{ fontWeight: pathname === "/" ? "600" : "normal", color: "#333" }}>Home</span>
        </Menu.Item>
        <Menu.Item key="/favorites" icon={<StarOutlined style={{ color: "#CC0000" }} />}>
          <span style={{ fontWeight: pathname === "/favorites" ? "600" : "normal", color: "#333" }}>Favorites</span>
        </Menu.Item>
        <Menu.Item key="/profile" icon={<UserOutlined style={{ color: "#CC0000" }} />}>
          <span style={{ fontWeight: pathname === "/profile" ? "600" : "normal", color: "#333" }}>Profile</span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout" icon={<LogoutOutlined style={{ color: "#d83232" }} />} danger>
          <span style={{ fontWeight: 500 }}>Logout</span>
        </Menu.Item>
      </Menu>
    </div>
  );

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
        <span style={{ fontWeight: 500, color: "#333" }}>Profile</span>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined style={{ color: "#d83232" }} />} danger>
        <span style={{ fontWeight: 500 }}>Logout</span>
      </Menu.Item>
    </Menu>
  );

  const topLinks = [
    { href: "/faq",     label: "FAQ",    icon: <QuestionCircleOutlined /> },
    { href: "/about",   label: "About",  icon: <InfoCircleOutlined /> },
    { href: "/contact", label: "Contact", icon: <MailOutlined /> },
  ];

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
              {width >= 640 && <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>Spark! Bytes</span>}
            </div>
          </div>

          {/* right: desktop nav or avatar/login */}
          {isDesktop ? (
            <div className="flex items-center space-x-8">
              <nav className="flex space-x-6">
                {topLinks.map(({ href, label, icon }) => (
                  <div
                    key={href}
                    onClick={() => router.push(href)}
                    className="text-white text-md hover:text-gray-200 transition-colors duration-200"
                    style={{ 
                      textDecoration: "none",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: pathname === href ? 700 : 600,
                      position: "relative",
                      paddingBottom: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {React.cloneElement(icon, { 
                      style: { fontSize: 18 } 
                    })}
                    {label}
                    {pathname === href && (
                      <span style={{
                        position: "absolute",
                        bottom: 0,
                        left: "0",
                        width: "100%",
                        height: "3px",
                        background: "white",
                        borderRadius: "3px"
                      }}></span>
                    )}
                  </div>
                ))}
              </nav>
              
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
                    fontWeight: 600, 
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    height: "36px",
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  {width > 380 ? "Login" : ""}
                </Button>
              )}
            </div>
          ) : (
            /* mobile avatar/login */
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
                    fontWeight: 600, 
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    height: "36px",
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  {width > 380 ? "Login" : ""}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer panel */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
        contentWrapperStyle={{ 
          borderRadius: "0 12px 12px 0",
          height: "auto",
          maxHeight: "400px",
          width: isDesktop ? 280 : '80%',
          maxWidth: 280,
          marginTop: "70px"
        }}
        closable={false}
      >
        {drawerMenu}
      </Drawer>
    </>
  );
};

export default NavBar;