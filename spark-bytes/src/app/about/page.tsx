"use client";

import { Layout, Button, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Header, Content } = Layout;

export default function AboutPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/login");
  };

  const userMenu = (
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
    <Layout style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Header
        style={{
          backgroundColor: "#CC0000",
          padding: "0 50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
                fontWeight: "500",
                fontSize: "16px",
              }}
              onClick={() => router.push("/")}
            >
              Home
            </span>
            <span
              style={{
                color: "#ffff",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "16px",
              }}
            >
              About
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {isLoggedIn ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
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
                <span style={{ color: "#fff" }}>{userName || "User"}</span>
              </div>
            </Dropdown>
          ) : (
            <Button
              type="text"
              style={{
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              icon={<UserOutlined />}
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </div>
      </Header>

      <Content style={{ padding: "50px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            About Us.
          </h1>
          <div
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                marginBottom: "16px",
              }}
            >
              <strong>Spark! Bytes</strong> was created for students at Boston
              University to find free food events on campus. Developed by a team
              of Spark! students passionate about solving real-world problems
              through technology.
            </p>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
