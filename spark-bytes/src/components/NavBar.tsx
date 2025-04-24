"use client";

import { useState, useEffect } from "react";
import { Avatar, Dropdown, Menu, Button } from "antd";
import {
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
  const [userName, setUserName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  /* auth + resize */
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
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
      }
    })();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => router.push("/login");
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/login");
  };

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

  const avatarEl = (
    <Avatar
      size={28}
      style={{ backgroundColor: "#fff", border: "1px solid #CC0000" }}
      icon={<UserOutlined style={{ color: "#CC0000" }} />}
    />
  );

  return (
    <header
      className="bg-[#CC0000] w-full"
      style={{ paddingLeft: "1in", paddingRight: "1in" }}
    >
      <div className="flex justify-between items-center h-16">
        {/* brand: plain anchor for full reload */}
        <a
          href="/"
          className="flex items-center text-white text-xl font-bold"
        >
          {windowWidth < 640 ? (
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full" />
          ) : (
            <>
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-12 rounded-full mr-3"
              />
              <span className="text-2xl">Spark! Bytes</span>
            </>
          )}
        </a>

        {/* desktop nav */}
        {isDesktop && (
          <div className="flex items-center space-x-6">
            {/* links */}
            <div className="flex space-x-4">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`cursor-pointer text-white ${
                    pathname === href ? "font-bold" : "font-medium"
                  } hover:text-gray-200`}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* user */}
            {isLoggedIn ? (
              <Dropdown overlay={userMenu} placement="bottomRight">
                <div className="flex items-center cursor-pointer bg-white rounded-full px-3 py-1 shadow-sm space-x-2">
                  {avatarEl}
                  <span className="text-[#CC0000] font-medium whitespace-nowrap max-w-[120px] truncate">
                    {userName}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <Button
                onClick={handleLogin}
                icon={<UserOutlined style={{ color: "#CC0000" }} />}
                className="bg-white text-[#CC0000]"
              >
                Login
              </Button>
            )}
          </div>
        )}

        {/* mobile controls */}
        {!isDesktop && (
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <Dropdown overlay={userMenu} placement="bottomRight">
                {avatarEl}
              </Dropdown>
            ) : (
              <Button
                onClick={handleLogin}
                icon={<UserOutlined style={{ color: "#CC0000" }} />}
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
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-white ${
                  pathname === href
                    ? "font-bold bg-[#A00000]"
                    : "font-medium"
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
    </header>
  );
};

export default NavBar;
