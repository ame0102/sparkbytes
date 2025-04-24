"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Avatar, Dropdown, Menu, Button } from "antd";
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

  // component state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // check auth and add a resize listener on mount
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setUserName(data?.full_name ?? user.email?.split("@")[0] ?? "User");
      }
    };
    init();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // replace the URL search param every time the input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const term = value.trim();
    router.replace(term ? `/?search=${encodeURIComponent(term)}` : "/");
  };

  const handleSearchEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = searchQuery.trim();
      router.replace(term ? `/?search=${encodeURIComponent(term)}` : "/");
    }
  };

  // auth helpers
  const handleLogin = () => router.push("/login");
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/login");
  };

  // dropdown for logged-in users
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => router.push("/profile")}>
        My Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const isDesktop = windowWidth >= 768;

  return (
    <header className="bg-[#CC0000] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* top row */}
        <div className="flex justify-between items-center h-16">
          {/* brand */}
          <div
            className="flex items-center cursor-pointer text-white text-xl font-bold"
            onClick={() => router.push("/")}
          >
            {windowWidth < 640 ? (
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full" />
            ) : (
              <>
                <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full mr-3" />
                <span className="text-2xl">Spark! Bytes</span>
              </>
            )}
          </div>

          {/* desktop nav */}
          {isDesktop && (
            <div className="flex items-center space-x-6">
              {/* static links */}
              <div className="flex space-x-4">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About" },
                ].map(({ href, label }) => (
                  <span
                    key={href}
                    onClick={() => router.push(href)}
                    className={`cursor-pointer text-white ${
                      pathname === href ? "font-bold" : "font-medium"
                    } hover:text-gray-200 transition-colors`}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* search + user */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    onClick={() =>
                      router.replace(
                        searchQuery.trim()
                          ? `/?search=${encodeURIComponent(searchQuery.trim())}`
                          : "/"
                      )
                    }
                  >
                    <SearchOutlined className="text-gray-400" />
                  </button>
                  <input
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchEnter}
                    placeholder="Search"
                    className="bg-white text-gray-900 rounded-full pl-10 pr-4 py-1.5 w-64 focus:outline-none focus:ring"
                  />
                </div>

                {isLoggedIn ? (
                  <Dropdown overlay={userMenu} placement="bottomRight">
                    <div className="flex items-center cursor-pointer space-x-2">
                      <Avatar style={{ backgroundColor: "#f56a00" }} icon={<UserOutlined />} />
                      <span className="text-white">{userName}</span>
                    </div>
                  </Dropdown>
                ) : (
                  <Button
                    onClick={handleLogin}
                    icon={<UserOutlined />}
                    className="bg-white text-[#CC0000]"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* mobile controls */}
          {!isDesktop && (
            <div className="flex items-center space-x-2">
              {windowWidth > 480 && (
                <div className="relative mr-1">
                  <button
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    onClick={() =>
                      router.replace(
                        searchQuery.trim()
                          ? `/?search=${encodeURIComponent(searchQuery.trim())}`
                          : "/"
                      )
                    }
                  >
                    <SearchOutlined className="text-gray-400" />
                  </button>
                  <input
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchEnter}
                    placeholder="Search"
                    className="bg-white text-gray-900 rounded-full pl-10 pr-4 py-1.5 w-40 focus:outline-none focus:ring"
                  />
                </div>
              )}

              {isLoggedIn ? (
                <Dropdown overlay={userMenu} placement="bottomRight">
                  <Avatar style={{ backgroundColor: "#f56a00" }} icon={<UserOutlined />} />
                </Dropdown>
              ) : (
                <Button
                  onClick={handleLogin}
                  icon={<UserOutlined />}
                  className="bg-white text-[#CC0000] text-sm px-3 py-1"
                >
                  {windowWidth > 380 ? "Login" : ""}
                </Button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-1"
              >
                <MenuOutlined style={{ fontSize: 20 }} />
              </button>
            </div>
          )}
        </div>

        {/* mobile drawer */}
        {!isDesktop && isMobileMenuOpen && (
          <div className="border-t border-[#A00000] py-3">
            <div className="space-y-2 px-2">
              {windowWidth <= 480 && (
                <div className="relative mb-3 px-3">
                  <button
                    className="absolute inset-y-0 left-0 pl-6 flex items-center"
                    onClick={() =>
                      router.replace(
                        searchQuery.trim()
                          ? `/?search=${encodeURIComponent(searchQuery.trim())}`
                          : "/"
                      )
                    }
                  >
                    <SearchOutlined className="text-gray-400" />
                  </button>
                  <input
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchEnter}
                    placeholder="Search"
                    className="bg-white text-gray-900 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring"
                  />
                </div>
              )}

              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-white ${
                    pathname === href ? "font-bold bg-[#A00000]" : "font-medium"
                  } hover:bg-[#A00000]`}
                >
                  {label}
                </a>
              ))}

              {!isLoggedIn ? (
                <a
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-white font-medium hover:bg-[#A00000]"
                >
                  Login
                </a>
              ) : (
                <>
                  <a
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-white font-medium hover:bg-[#A00000]"
                  >
                    My Profile
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
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
