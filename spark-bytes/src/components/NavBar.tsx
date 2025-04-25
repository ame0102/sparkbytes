"use client";

import { useState, useEffect } from "react";
import { Avatar, Button, Drawer, Dropdown, Menu } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  StarOutlined,
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

  const drawerMenu = (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      onClick={({ key }) => {
        if (key === "logout") return handleLogout();
        router.push(key);
        setDrawerOpen(false);
      }}
      style={{ borderRight: 0 }}
    >
      <Menu.Item key="/" icon={<HomeOutlined />}>
        Home
      </Menu.Item>
      <Menu.Item key="/favorites" icon={<StarOutlined />}>
        Favorites
      </Menu.Item>
      <Menu.Item key="/profile" icon={<UserOutlined />}>
        My Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  const avatarMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "logout") return handleLogout();
        router.push("/profile");
      }}
    >
      <Menu.Item key="profile">My Profile</Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  const topLinks = [
    { href: "/faq",     label: "FAQ"    },
    { href: "/about",   label: "About"  },
    { href: "/contact", label: "Contact"},
  ];

  const avatarEl = (
    <Avatar
      size={28}
      style={{ backgroundColor: "#fff", border: "1px solid #CC0000" }}
      icon={<UserOutlined style={{ color: "#CC0000" }} />}
    />
  );

  return (
    <>
      <header className="bg-[#CC0000] w-full">
        <div
          className="flex justify-between items-center"
          style={{ height: 64, paddingLeft: "1rem", paddingRight: "2rem" }}
        >
          {/* left: burger + logo */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && (
              <button
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
                className="text-white"
              >
                <MenuOutlined style={{ fontSize: 24 }} />
              </button>
            )}

            <a
              href="/"
              className="flex items-center font-bold text-white text-xl"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-10 rounded-full mr-2"
              />
              {width >= 640 && <span>Spark! Bytes</span>}
            </a>
          </div>

          {/* right: desktop nav or avatar/login */}
          {isDesktop ? (
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-4">
                {topLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className={`text-white ${
                      pathname === href ? "font-bold" : "font-medium"
                    } hover:text-gray-200`}
                  >
                    {label}
                  </a>
                ))}
              </nav>
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
                  className="bg-white text-[#CC0000] px-3 py-1 text-sm"
                >
                  {width > 380 ? "Login" : ""}
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Drawer panel */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
      >
        {drawerMenu}
      </Drawer>
    </>
  );
};

export default NavBar;
