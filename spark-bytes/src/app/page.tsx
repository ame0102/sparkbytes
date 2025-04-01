"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Input,
  Card,
  Button,
  Row,
  Col,
  Avatar,
  Dropdown,
  Select,
  Tag,
  Modal,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  FilterOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Header, Content } = Layout;
const { Meta } = Card;
const { Option } = Select;

// Mock data for now
const allEvents = [
  {
    id: 1,
    title: "HTC Coffee & Conversation",
    date: "February 17th, 2025",
    location: "Howard Thurman Center",
    time: "7:00pm EST",
    dietary: ["Gluten free", "Vegetarian"],
    image: "HTC.jpg",
    spotsLeft: 20,
    category: "Social",
  },
  {
    id: 2,
    title: "CAS Pizza Night",
    date: "February 20th, 2025",
    location: "College of Arts and Sciences",
    time: "6:30pm EST",
    dietary: ["Vegetarian", "Vegan options"],
    image: "CAS.jpg",
    spotsLeft: 15,
    category: "Academic",
  },
  {
    id: 3,
    title: "ENG Tech Talk & Tacos",
    date: "February 22nd, 2025",
    location: "Engineering Building",
    time: "5:00pm EST",
    dietary: ["Gluten free", "Dairy free"],
    image: "ENG.jpg",
    spotsLeft: 10,
    category: "Tech",
  },
  {
    id: 4,
    title: "SHA Networking Dinner",
    date: "February 25th, 2025",
    location: "School of Hospitality",
    time: "7:30pm EST",
    dietary: ["Vegetarian", "Gluten free", "Nut free"],
    image: "SHA.jpg",
    spotsLeft: 8,
    category: "Professional",
  },
];

// Filter options for now
const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten free",
  "Dairy free",
  "Nut free",
];

const categoryOptions = ["All", "Social", "Academic", "Tech", "Professional"];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");


  // Filter events based on search and filters
  const filteredEvents = allEvents.filter((event) => {
    //user's search
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    // dietary filter
    const matchesDietary =
      selectedDietary.length === 0 ||
      selectedDietary.every((option) => event.dietary.includes(option));

    // category filter
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;

    return matchesSearch && matchesDietary && matchesCategory;
  });

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
      {/* Header */}
      <Header
        style={{
          backgroundColor: "#CC0000",
          padding: "0 50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left side - Logo and navigation links */}
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
                fontWeight: "900",
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
                fontWeight: "500",
                fontSize: "16px",
              }}
              onClick={() => router.push("/about")}
            >
              About
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
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
            // onPressEnter={() => console.log("Search triggered:", searchQuery)}
          />

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

      {/* Body content */}
      <Content style={{ padding: "50px" }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Welcome to <span style={{ color: "#CC0000" }}>Spark! Bytes</span>
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "1.8", maxWidth: "800px" }}>
            Discover events offering free food around the Boston University
            campus with different dietary options.
          </p>
        </div>

        {/* Create Event Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <Button
            type="primary"
            style={{
              backgroundColor: "#CC0000",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
            onClick={() => router.push("/event")}
          >
            + Create Event
          </Button>
        </div>

        {/* Events Section */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Top Events</h2>
            
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#888" }}>
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "result" : "results"} shown
              </span>
              <div
                style={{
                  color: "#888",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginRight: "5px",
                }}
                onClick={() => setIsFilterModalOpen(true)}
              >
                •
                <FilterOutlined /> Filter
              </div>
            </div>
          </div>

          {(selectedCategory !== "All" || selectedDietary.length > 0) && (
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {selectedCategory !== "All" && (
                <Tag
                  closable
                  onClose={() => setSelectedCategory("All")}
                  color="red"
                >
                  {selectedCategory}
                </Tag>
              )}
              {selectedDietary.map((option) => (
                <Tag
                  key={option}
                  closable
                  onClose={() =>
                    setSelectedDietary(
                      selectedDietary.filter((item) => item !== option)
                    )
                  }
                  color="blue"
                >
                  {option}
                </Tag>
              ))}
            </div>
          )}

          {/* Events cards */}
          {filteredEvents.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredEvents.map((event) => (
                <Col key={event.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: "160px", overflow: "hidden" }}>
                        <img
                          alt="Event"
                          src={event.image}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        
                      </div>
                    }
                    style={{
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      transition: "transform 0.3s ease",
                    }}
                    // bodyStyle={{ padding: "16px" }}
                  >
                    <Meta
                      title={
                        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                          {event.title}
                        </span>
                      }
                      description={
                        <>
                          <p
                            style={{
                              margin: "8px 0",
                              color: "#888",
                              fontSize: "14px",
                            }}
                          >
                            {event.date} · {event.time}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Location:</strong> {event.location}
                          </p>
                          <div style={{ margin: "8px 0" }}>
                            <strong>Dietary:</strong>{" "}
                            {event.dietary.map((item) => (
                              <Tag
                                key={item}
                                color="blue"
                                style={{ margin: "2px" }}
                              >
                                {item}
                              </Tag>
                            ))}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "12px",
                            }}
                          >
                            <span
                              style={{ color: "#CC0000", fontWeight: "500" }}
                            >
                              {event.spotsLeft} spots left
                            </span>
                            <Button
                              type="primary"
                              style={{
                                backgroundColor: "#CC0000",
                                borderColor: "#CC0000",
                              }}
                              onClick={() => {
                                if (!isLoggedIn) {
                                  handleLogin();
                                } else {
                                  //add RSVP logic here
                                  console.log(`RSVP for ${event.title}`);
                                }
                              }}
                            >
                              {isLoggedIn ? "RSVP Now" : "Sign In to RSVP"}
                            </Button>
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                backgroundColor: "#fff",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ color: "#888", marginBottom: "16px" }}>
                Sorry, no events found.
              </h3>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#b22222",
                  borderColor: "#b22222",
                  color: "#fff",
                }}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDietary([]);
                  setSelectedCategory("All");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Content>
      <Modal
        title="Filter Events"
        open={isFilterModalOpen}
        onOk={() => setIsFilterModalOpen(false)}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={[
          <Button
            key="reset"
            onClick={() => {
              setSelectedDietary([]);
              setSelectedCategory("All");
            }}
          >
            Reset
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={() => setIsFilterModalOpen(false)}
            style={{
              backgroundColor: "#CC0000",
              borderColor: "#CC0000",
            }}
          >
            Apply Filters
          </Button>,
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Category
            </label>
            <Select
              style={{ width: "100%" }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {categoryOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Dietary Options
            </label>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Filter by dietary needs"
              value={selectedDietary}
              onChange={setSelectedDietary}
            >
              {dietaryOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
