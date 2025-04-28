"use client";

import { Layout, Collapse } from "antd";
import NavBar from "@/components/NavBar";

const { Content } = Layout;
const { Panel } = Collapse;

export default function FAQPage() {
  const faqItems = [
    {
      question: "What is Spark! Bytes?",
      answer: "Spark! Bytes is a platform designed for the Boston University community to discover and share events with free food. Our goal is to reduce food waste on campus while helping students find free meals and snacks."
    },
    {
      question: "How do I find events with free food?",
      answer: "You can browse all events on our homepage. Use the search bar to find specific food items or event titles. You can also filter events by location, time, and dietary preferences using the Filters button."
    },
    {
      question: "How do I create an event?",
      answer: "Click the '+ Create Event' button on the homepage. Fill out the event details including title, location, date, time, and food available. You can also specify dietary options and the number of portions available."
    },
    {
      question: "Can I save events I'm interested in?",
      answer: "Yes! Click the star icon on any event card to add it to your favorites. You can view all your favorite events by clicking on 'Favorites' in the menu."
    },
    {
      question: "What dietary options can I specify for my event?",
      answer: "When creating an event, you can select from options including Vegan, Vegetarian, Gluten Free, Dairy Free, Nut Free, and Other. This helps users with specific dietary needs find suitable events."
    },
    {
      question: "How do I update an event I've posted?",
      answer: "Navigate to the event page and click the 'Edit' button if you're the creator of the event. From there, you can update any event details including food availability and portions left."
    },
    {
      question: "Can I use Spark! Bytes if I'm not at Boston University?",
      answer: "Currently, Spark! Bytes is exclusively for the Boston University community. You need a BU login to access the platform."
    },
    {
      question: "How does Spark! Bytes help reduce food waste?",
      answer: "By connecting people with excess food from events to those who can consume it, we help redirect food that might otherwise be thrown away. This helps reduce overall food waste on campus."
    }
  ];

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
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: "18px", color: "#666", marginTop: "8px" }}>
              Find answers to common questions about using Spark! Bytes
            </p>
          </header>

          <Collapse 
            defaultActiveKey={['0']} 
            expandIconPosition="end"
            style={{ 
              background: "white", 
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            {faqItems.map((item, index) => (
              <Panel 
                key={index.toString()} 
                header={
                  <span style={{ 
                    fontSize: "17px", 
                    fontWeight: 600,
                    fontFamily: "'Nunito', sans-serif",
                    color: "#333"
                  }}>
                    {item.question}
                  </span>
                }
                style={{ 
                  borderBottom: index < faqItems.length - 1 ? "1px solid #f0f0f0" : "none",
                  padding: "8px 0",
                }}
              >
                <div style={{ 
                  padding: "8px 16px 16px", 
                  fontSize: "16px", 
                  lineHeight: 1.6,
                  color: "#555",
                  fontFamily: "'Nunito', sans-serif"
                }}>
                  {item.answer}
                </div>
              </Panel>
            ))}
          </Collapse>

          <div style={{ 
            marginTop: "40px", 
            padding: "24px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontSize: "22px", 
              fontWeight: 600, 
              marginBottom: "16px",
              color: "#333",
              fontFamily: "'Nunito', sans-serif"
            }}>
              Still have questions?
            </h2>
            <p style={{ 
              fontSize: "16px", 
              color: "#555",
              marginBottom: "20px",
              fontFamily: "'Nunito', sans-serif"
            }}>
              If you couldn't find the answer to your question, feel free to reach out to our team.
            </p>
            <a 
              href="/contact" 
              style={{ 
                display: "inline-block",
                background: "#CC0000",
                color: "white",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(204,0,0,0.3)",
                fontFamily: "'Nunito', sans-serif"
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </Content>
    </Layout>
  );
}