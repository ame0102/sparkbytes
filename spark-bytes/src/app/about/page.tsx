"use client";

import { Layout } from "antd";
import NavBar from "@/components/NavBar";

const { Content } = Layout;

export default function AboutPage() {
  return (
    <Layout style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <NavBar />
      <Content style={{ padding: "60px 20px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "960px", width: "100%" }}>
          <header style={{ marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "40px",
                fontWeight: 700,
                borderLeft: "6px solid #CC0000",
                paddingLeft: "16px",
                marginBottom: "8px",
                color: "#222",
              }}
            >
              About Spark! Bytes
            </h1>
            <p style={{ fontSize: "18px", color: "#666", marginTop: "8px" }}>
              Built by BU students. Powered by innovation. Designed to reduce waste and build community.
            </p>
          </header>

          <section style={{ fontSize: "17px", lineHeight: "1.8", color: "#444", paddingLeft: "6px" }}>
            <p>
              <strong>Spark! Bytes</strong> is a web application developed to help the Boston University (BU) community discover events across campus that offer free food or snacks. These events often have excess quantities of food, and our platform helps redirect that surplus to students, faculty, and staff who can make use of it.
            </p>

            <p style={{ marginTop: "24px" }}>
              By improving visibility and turnout for food-inclusive events, Spark! Bytes contributes to reducing unnecessary food waste on campus. At the same time, it supports student wellness and fosters community engagement.
            </p>

            <p style={{ marginTop: "24px" }}>
              This project was developed through the <strong>Spark!</strong> initiative at BU — a collaborative, student-driven program focused on applying technology to real-world social and environmental challenges.
            </p>
          </section>
        </div>
      </Content>
    </Layout>
  );
}