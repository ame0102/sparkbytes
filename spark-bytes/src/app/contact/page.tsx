// contact/page.tsx
"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Select, Card, Row, Col, Divider } from 'antd';
import { SendOutlined, MessageOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import NavBar from "@/components/NavBar";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ContactFormValues {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}

export default function ContactPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inquiryType, setInquiryType] = useState<string>('general');
  const [messageSubmitted, setMessageSubmitted] = useState(false);

  const handleInquiryTypeChange = (value: string) => {
    setInquiryType(value);
  };

  const onFinish = async (values: ContactFormValues) => {
    setLoading(true);
    try {
      // Simulate sending the message
      console.log('Contact message:', values);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success and reset
      message.success('Your message has been sent!');
      setMessageSubmitted(true);
    } catch (error) {
      message.error('There was a problem sending your message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (messageSubmitted) {
    return (
      <>
        <NavBar />
        <main style={{ margin: "0 1.25in", paddingBottom: "2rem", maxWidth: "calc(100% - 2.5in)" }}>
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              margin: "0 auto 2rem", 
              background: "#F0F0F0", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center"
            }}>
              <SendOutlined style={{ fontSize: 36, color: "#CC0000" }} />
            </div>
            <Title level={2}>Message Sent!</Title>
            <Paragraph style={{ fontSize: 18, maxWidth: 600, margin: "0 auto 2rem" }}>
              Thank you for reaching out. We've received your message and will respond as soon as possible.
            </Paragraph>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/">
                <Button size="large">Return to Events</Button>
              </Link>
              <Button 
                type="primary" 
                size="large"
                style={{ background: "#CC0000" }}
                onClick={() => {
                  setMessageSubmitted(false);
                  form.resetFields();
                }}
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main style={{ margin: "0 1.25in", paddingBottom: "2rem", maxWidth: "calc(100% - 2.5in)" }}>
        <div style={{ margin: "2rem 0 1rem" }}>
          <h2 style={{ fontSize: 28, fontWeight: "bold" }}>Contact Us</h2>
        </div>
      
        <Row gutter={48}>
          <Col xs={24} lg={14}>
            <Card 
              bordered={false} 
              style={{ 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                borderRadius: 12
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                initialValues={{ inquiryType: 'general' }}
              >
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item
                  name="inquiryType"
                  label="What can we help you with?"
                  rules={[{ required: true, message: 'Please select an inquiry type' }]}
                >
                  <Select 
                    size="large" 
                    onChange={handleInquiryTypeChange}
                    style={{ borderRadius: 8 }}
                  >
                    <Option value="general">General Question</Option>
                    <Option value="event">Event Help</Option>
                    <Option value="account">Account Issue</Option>
                    <Option value="food">Food Donations</Option>
                    <Option value="bug">Report a Bug</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[
                    { required: true, message: 'Please enter your message' },
                    { min: 20, message: 'Please provide at least 20 characters' }
                  ]}
                >
                  <TextArea 
                    rows={5} 
                    size="large" 
                    showCount
                    maxLength={1000}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={loading}
                    icon={<SendOutlined />}
                    style={{ 
                      width: "100%",
                      background: "#CC0000",
                      borderRadius: 8
                    }}
                  >
                    Send Message
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          
          <Col xs={24} lg={10}>
            <Card 
              className="mb-6" 
              style={{ 
                marginBottom: 24, 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                borderRadius: 12 
              }}
            >
              <Title level={4} style={{ display: "flex", alignItems: "center" }}>
                <QuestionCircleOutlined style={{ marginRight: 8 }} />
                FAQs
              </Title>
              <div style={{ marginTop: 16 }}>
                <Paragraph strong>How do I create an event?</Paragraph>
                <Paragraph>Click the "+ Create Event" button on the Events page and fill out the form with your event details.</Paragraph>
                
                <Divider style={{ margin: "12px 0" }} />
                
                <Paragraph strong>Can I edit my event after posting it?</Paragraph>
                <Paragraph>Yes, you can edit your event details by navigating to the event page and clicking the "Edit" button.</Paragraph>
                
                <Divider style={{ margin: "12px 0" }} />
                
                <Paragraph strong>How do I mark food as claimed?</Paragraph>
                <Paragraph>On your event page, you can update the portions remaining as food is claimed.</Paragraph>
              </div>
              <div style={{ marginTop: 16 }}>
                <Link href="/faq">
                  <Button type="link" style={{ color: "#CC0000", padding: 0 }}>
                    View all FAQs
                  </Button>
                </Link>
              </div>
            </Card>
            
            <Card 
              style={{ 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                borderRadius: 12 
              }}
            >
              <Title level={4} style={{ display: "flex", alignItems: "center" }}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                About Spark Bytes
              </Title>
              <Paragraph>
                Spark Bytes is a platform dedicated to reducing food waste by connecting event organizers with people who can put surplus food to good use.
              </Paragraph>
              <Paragraph>
                Our mission is to create a community where no good food goes to waste while bringing people together through shared meals and resources.
              </Paragraph>
              <div style={{ marginTop: 16 }}>
                <Link href="/about">
                  <Button type="link" style={{ color: "#CC0000", padding: 0 }}>
                    Learn more about us
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </main>
    </>
  );
}