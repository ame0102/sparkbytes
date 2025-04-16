"use client";

import { useState, useEffect } from "react";
import { Layout, Input, Avatar, Dropdown, Menu, Button } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";

const { Header } = Layout;

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);

        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data?.full_name) {
          setUserName(data.full_name);
        } else {
          setUserName(user.email?.split("@")[0] || "User");
        }
      }
    };

    checkUser();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => router.push("/profile")}>
        My Profile
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        backgroundColor: "#CC0000",
        padding: "0 50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left side - Logo and navigation */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            marginRight: "40px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/")}
        >
          Spark! Bytes
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <span
            style={{
              color: "#fff",
              cursor: "pointer",
              fontWeight: pathname === "/" ? "900" : "500",
              fontSize: "16px",
            }}
            onClick={() => router.push("/")}
          >
            Home
          </span>
          <span
            style={{
              color: "#fff",
              cursor: "pointer",
              fontWeight: pathname === "/about" ? "900" : "500",
              fontSize: "16px",
            }}
            onClick={() => router.push("/about")}
          >
            About
          </span>
        </div>
      </div>

      {/* Right side - Search and login */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Input
          id="search-input"
          placeholder="Search"
          prefix={<SearchOutlined />}
          style={{
            width: 200,
            marginRight: "20px",
            borderRadius: "20px",
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />

        {isLoggedIn ? (
          <Dropdown overlay={menu} placement="bottomRight">
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Avatar
                style={{ backgroundColor: "#f56a00" }}
                icon={<UserOutlined />}
              />
              <span style={{ color: "#fff" }}>{userName}</span>
            </div>
          </Dropdown>
        ) : (
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={handleLogin}
            style={{
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Login
          </Button>
        )}
      </div>
    </Header>
  );
};

export default NavBar;