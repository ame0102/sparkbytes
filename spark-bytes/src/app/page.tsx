"use client";

import React, { useState, useEffect } from "react";
import { message } from "antd";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import Input from "antd/lib/input";
import Card from "antd/lib/card";
import Button from "antd/lib/button";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Avatar from "antd/lib/avatar";
import Dropdown from "antd/lib/dropdown";
import Select from "antd/lib/select";
import Tag from "antd/lib/tag";
import Modal from "antd/lib/modal";
import {
  SearchOutlined,
  UserOutlined,
  FilterOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CreateEventModal from "../components/CreateEventModal";
import { getCurrentUser, getAllEvents } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";
import NavBar from "@/components/NavBar";

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
  "Vegan",
  "Vegetarian",
  "Gluten free",
  "Dairy free",
  "Nut free",
  "None",
  "Other"
];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [events, setEvents] = useState(allEvents); // Start with mock data, will be updated
  const [loading, setLoading] = useState(true);
  const locationOptions = ["East", "Central", "West", "South", "Fenway"];
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Check user authentication status on load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
  
          if (data?.full_name) {
            setUserName(data.full_name);
          } else {
            setUserName(user.email?.split('@')[0] || 'User');
          }
        } else {
          setUnauthorized(true);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUnauthorized(true);
      } finally {
        setAuthChecked(true);
      }
    };
  
    checkUser();
  }, []);  

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    //user's search
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    // dietary filter
    const matchesDietary =
      selectedDietary.length === 0 ||
      selectedDietary.every((option) => event.dietary.includes(option));

      const matchesLocation =
      !selectedLocation || event.location.toLowerCase().includes(selectedLocation.toLowerCase());
    

    return matchesSearch && matchesDietary;
  });

  const handleEventCreated = async () => {
    try {
      const data = await getAllEvents(); // Assuming this is how you fetch events
      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  };  

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/login");
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      onClick: () => router.push("/profile")
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  // If not authorized, show message and login link
  if (authChecked && unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full text-center border border-red-200 bg-red-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">Please log in to access the home page.</p>

          <div className="flex flex-col items-center gap-3">
            <Button 
              type="primary" 
              style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
              onClick={() => router.push('/login')}
            >
              Login
            </Button>

            <button 
              onClick={() => router.push('/guest')}
              className="text-[#CC0000] underline text-sm mt-1 hover:text-[#A00000] transition-colors"
            >
              Continue as Guest
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <NavBar />
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
            onClick={() => {
              if (isLoggedIn) {
                setIsCreateModalOpen(true);
              } else {
                message.info('Please log in to create an event');
                router.push("/login");
              }
            }}
          >
            + Create Event
          </Button>
          
          {/* Create Event Modal */}
          <CreateEventModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onEventCreated={handleEventCreated}
          />
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

          {(selectedDietary.length > 0) && (
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
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
        visible={isFilterModalOpen}
        onOk={() => setIsFilterModalOpen(false)}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={[
          <Button
            key="reset"
            onClick={() => {
              setSelectedDietary([]);
              setSelectedLocation(null);
            }}
          >
            Reset
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={() => setIsFilterModalOpen(false)}
            style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
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
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Location
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by location"
              value={selectedLocation}
              onChange={setSelectedLocation}
              allowClear
            >
              {locationOptions.map((option) => (
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