"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber, Button, message } from "antd";
import { getEventById } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const dietaryOptions = ["Vegan", "Vegetarian", "Gluten Free", "Dairy Free", "Nut Free", "Other", "None"];
const locationOptions = ["East", "Central", "West", "South", "Fenway"];

export default function EditEventModal({ isOpen, onClose, eventId, onEventUpdated }: {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  onEventUpdated: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    getEventById(eventId).then((data) => {
      form.setFieldsValue({
        title: data.title,
        date: dayjs(data.date, "MMMM D, YYYY"),
        time: dayjs(data.time, "h:mm a"),
        location: data.location,
        address: data.address,
        food: data.food,
        dietary: data.dietary,
        dietaryComment: data.dietary_comment,
        portions: data.portions,
      });
      setLoading(false);
    });
  }, [eventId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { error } = await supabase
        .from("events")
        .update({
          title: values.title,
          date: dayjs(values.date).format("MMMM D, YYYY"),
          time: dayjs(values.time).format("h:mm a"),
          location: values.location,
          address: values.address,
          food: values.food,
          dietary: values.dietary,
          dietary_comment: values.dietaryComment || null,
          portions: values.portions,
        })
        .eq("id", eventId);

      if (error) throw error;

      message.success("Event updated");
      onClose();
      onEventUpdated(); // trigger refresh
    } catch (err: any) {
      console.error(err);
      message.error("Failed to update event");
    }
  };

  return (
    <Modal
      title="Edit Event"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Save"
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <div className="flex gap-4">
          <Form.Item name="date" label="Date" className="flex-1" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="time" label="Time" className="flex-1" rules={[{ required: true }]}>
            <TimePicker format="h:mm a" style={{ width: "100%" }} />
          </Form.Item>
        </div>
        <Form.Item name="location" label="Location" rules={[{ required: true }]}>
          <Select>
            {locationOptions.map((loc) => (
              <Option key={loc} value={loc}>
                {loc}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="dietary" label="Dietary Options" rules={[{ required: true }]}>
          <Select mode="multiple">
            {dietaryOptions.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dietaryComment" label="Other Dietary Comment">
          <TextArea rows={2} />
        </Form.Item>
        <Form.Item name="food" label="Food Description" rules={[{ required: true }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="portions" label="Number of Portions" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}