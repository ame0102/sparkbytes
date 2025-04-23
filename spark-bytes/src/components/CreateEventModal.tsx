"use client";

import React, { useState, useEffect } from "react";
import { message } from "antd";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import DatePicker from "antd/lib/date-picker";
import TimePicker from "antd/lib/time-picker";
import Button from "antd/lib/button";
import { createEvent, getCurrentUser } from "@/utils/eventApi";
import dayjs from "dayjs";

const { Option } = Select;
const TextArea = Input.TextArea;
const FormItem = Form.Item;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const dietaryOptions = [
  "Vegan",
  "Vegetarian",
  "Gluten Free",
  "Dairy Free",
  "Nut Free",
  "Other",
  "None",
];

const locationOptions = ["East", "Central", "West", "South", "Fenway"];

const CustomButton = (props: {
  onClick?: () => void;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  loading?: boolean;
  style?: React.CSSProperties;
  text: string;
}) => (
  <Button
    onClick={props.onClick}
    type={props.type}
    loading={props.loading}
    style={props.style}
  >
    {props.text}
  </Button>
);

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        date: dayjs(),
        time: dayjs().hour(17).minute(0),
        dietary: [],
      });
    }
  }, [form, isOpen]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        message.error("You must be logged in to create an event");
        return;
      }

      const values = await form.validateFields();

      const eventData = {
        title: values.title,
        date: values.date ? dayjs(values.date).format("MMMM D, YYYY") : undefined,
        time: values.time ? dayjs(values.time).format("h:mm a") : undefined,
        location: values.location,
        address: values.address,
        food: values.food,
        dietary: values.dietary || [],
        dietaryComment: values.dietaryComment || null,
      };

      await createEvent(eventData);
      message.success("Event created successfully!");
      form.resetFields();
      onEventCreated();
      onClose();
    } catch (err: any) {
      console.error("Error creating event:", err);
      if (err?.message) {
        message.error(err.message);
      } else {
        message.error("Failed to create event. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <Form form={form} layout="vertical">
      <FormItem
        name="title"
        label="Event Title"
        rules={[{ required: true, message: "Please enter the event title" }]}
      >
        <Input placeholder="Enter event title" />
      </FormItem>

      <div style={{ display: "flex", gap: "20px" }}>
        <FormItem
          name="date"
          label="Date"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </FormItem>

        <FormItem
          name="time"
          label="Time"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Please select a time" }]}
        >
          <TimePicker format="h:mm a" style={{ width: "100%" }} />
        </FormItem>
      </div>

      <FormItem
        name="location"
        label="Location"
        rules={[{ required: true, message: "Please select a location" }]}
      >
        <Select placeholder="Select a location">
          {locationOptions.map((loc) => (
            <Option key={loc} value={loc}>
              {loc}
            </Option>
          ))}
        </Select>
      </FormItem>

      <FormItem
        name="address"
        label="Address"
        rules={[{ required: true, message: "Please enter an address" }]}
      >
        <Input placeholder="Enter event address" />
      </FormItem>

      <FormItem
        name="dietary"
        label="Dietary Options"
        rules={[{ required: true, message: "Please select at least one option" }]}
      >
        <Select
          mode="multiple"
          placeholder="Select dietary options"
          value={selectedDietary}
          onChange={(value) => {
            // If "None" is selected, override all other selections
            if (value.includes("None")) {
              setSelectedDietary(["None"]);
              form.setFieldsValue({ dietary: ["None"] });
            } else {
              // Prevent "None" from being selected with others
              const filtered = value.filter((v) => v !== "None");
              setSelectedDietary(filtered);
              form.setFieldsValue({ dietary: filtered });
            }
          }}
        >
          {dietaryOptions.map((option) => (
            <Option
              key={option}
              value={option}
              disabled={
                (selectedDietary.includes("None") && option !== "None") ||
                (option === "None" && selectedDietary.length > 0 && !selectedDietary.includes("None"))
              }
            >
              {option}
            </Option>
          ))}
        </Select>
      </FormItem>


      {selectedDietary.includes("Other") && (
        <FormItem
          name="dietaryComment"
          label="Describe the 'Other' dietary restrictions"
          rules={[{ required: true, message: "Please enter your dietary comments" }]}
        >
          <TextArea rows={2} placeholder="Describe your dietary restrictions" />
        </FormItem>
      )}

      <FormItem
        name="food"
        label="Food Availability"
        rules={[{ required: true, message: "Please enter all food availability" }]}
      >
        <TextArea rows={4} placeholder="Enter all food availability" />
      </FormItem>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <CustomButton onClick={onClose} text="Cancel" />
        <CustomButton
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
          text="Create Event"
        />
      </div>
    </Form>
  );

  return isOpen ? (
    <Modal
      title="Create New Event"
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {modalContent}
    </Modal>
  ) : null;
};

export default CreateEventModal;