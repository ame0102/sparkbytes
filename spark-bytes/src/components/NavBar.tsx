"use client";

import { useState, useEffect } from "react";
import { Input, Avatar, Dropdown, Menu, Button } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

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

    // Add resize event listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

  const isDesktop = windowWidth >= 768;


  return (
    <header className="bg-[#CC0000] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div
              className="text-white text-xl font-bold cursor-pointer flex items-center"
              onClick={() => router.push("/")}
            >
              {windowWidth < 640 ? (
                // On smallest screens, just show the logo
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/logo.png" alt="Spark! Bytes Logo" className="h-10 w-10 rounded-full" />
                </div>
              ) : (
                // On larger screens, show the logo + text
                <div className="flex items-center">
                  <img src="/logo.png" alt="Spark! Bytes Logo" className="h-12 w-12 rounded-full mr-3" />
                  <span className="text-2xl">Spark! Bytes</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation - Desktop */}
          {isDesktop && (
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                <span
                  className={`text-white cursor-pointer ${
                    pathname === "/" ? "font-bold" : "font-medium"
                  } hover:text-gray-200 transition-colors duration-200`}
                  onClick={() => router.push("/")}
                >
                  Home
                </span>
                <span
                  className={`text-white cursor-pointer ${
                    pathname === "/about" ? "font-bold" : "font-medium"
                  } hover:text-gray-200 transition-colors duration-200`}
                  onClick={() => router.push("/about")}
                >
                  About
                </span>
              </div>

              {/* Search and user section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchOutlined className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-white text-gray-900 rounded-full pl-10 pr-4 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {isLoggedIn ? (
                  <Dropdown overlay={menu} placement="bottomRight">
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Avatar
                        style={{ backgroundColor: "#f56a00" }}
                        icon={<UserOutlined />}
                      />
                      <span className="text-white">{userName}</span>
                    </div>
                  </Dropdown>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="bg-white text-[#CC0000] font-medium px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  >
                    <UserOutlined className="mr-1" />
                    Login
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button and search */}
          {!isDesktop && (
            <div className="flex items-center space-x-2">
              {windowWidth > 480 && (
                <div className="relative mr-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchOutlined className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-white text-gray-900 rounded-full pl-10 pr-4 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              
              {isLoggedIn ? (
                <Dropdown overlay={menu} placement="bottomRight">
                  <Avatar
                    style={{ backgroundColor: "#f56a00" }}
                    icon={<UserOutlined />}
                  />
                </Dropdown>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-white text-[#CC0000] font-medium px-3 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center text-sm"
                >
                  <UserOutlined className="mr-1" />
                  {windowWidth > 380 ? "Login" : ""}
                </button>
              )}
              
              <button
                onClick={toggleMobileMenu}
                className="text-white p-1 focus:outline-none"
              >
                <MenuOutlined style={{ fontSize: '20px' }} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {!isDesktop && isMobileMenuOpen && (
          <div className="border-t border-[#A00000] py-3">
            <div className="space-y-2 px-2">
              {windowWidth <= 480 && (
                <div className="relative mb-3 px-3">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <SearchOutlined className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-white text-gray-900 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              
              <a
                href="/"
                className={`block px-3 py-2 rounded-md text-white ${
                  pathname === "/" ? "font-bold bg-[#A00000]" : "font-medium"
                } hover:bg-[#A00000]`}
              >
                Home
              </a>
              <a
                href="/about"
                className={`block px-3 py-2 rounded-md text-white ${
                  pathname === "/about" ? "font-bold bg-[#A00000]" : "font-medium"
                } hover:bg-[#A00000]`}
              >
                About
              </a>
              {!isLoggedIn && (
                <a
                  href="/login"
                  className="block px-3 py-2 rounded-md text-white font-medium hover:bg-[#A00000]"
                >
                  Login
                </a>
              )}
              {isLoggedIn && (
                <>
                  <a
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-white font-medium hover:bg-[#A00000]"
                  >
                    My Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-white font-medium hover:bg-[#A00000]"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;