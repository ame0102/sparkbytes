"use client";

import React, { useState, useEffect } from "react";
import { message } from "antd";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import DatePicker from "antd/lib/date-picker";
import TimePicker from "antd/lib/time-picker";
import InputNumber from "antd/lib/input-number";
import Button from "antd/lib/button";
import { createEvent, getCurrentUser } from "@/utils/eventApi";
import { Event } from "@/utils/supabaseClient";
import dayjs from 'dayjs';

const { Option } = Select;
const TextArea = Input.TextArea;
const FormItem = Form.Item;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

// These match your homepage component
const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten free",
  "Dairy free",
  "Nut free",
];

const categoryOptions = ["Social", "Academic", "Tech", "Professional"];

// Custom button component that doesn't use children prop
const CustomButton = (props: {
  onClick?: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  loading?: boolean;
  style?: React.CSSProperties;
  text: string;
}) => {
  return (
    <Button
      onClick={props.onClick}
      type={props.type}
      loading={props.loading}
      style={props.style}
    >
      {props.text}
    </Button>
  );
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Set default values for the form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        date: dayjs(),
        time: dayjs().hour(17).minute(0), // Default to 5:00 PM
        spotsLeft: 20,
        dietary: []
      });
    }
  }, [form, isOpen]);
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      console.log('Starting event creation process...');
      
      // First check if user is logged in
      try {
        console.log('Checking user authentication...');
        const user = await getCurrentUser();
        console.log('User authentication result:', user ? 'Authenticated' : 'Not authenticated');
        
        if (!user) {
          console.log('Authentication failed - no user found');
          message.error('You must be logged in to create an event');
          return;
        }
        console.log('User authenticated successfully:', user.id);
      } catch (authError) {
        console.error('Authentication error details:', authError);
        message.error('Authentication error. Please log in again.');
        return;
      }
      
      // Validate form fields
      console.log('Validating form fields...');
      let values;
      try {
        values = await form.validateFields();
        console.log('Form validation successful, values:', values);
      } catch (validationError) {
        console.error('Form validation failed:', validationError);
        message.error('Please check your form inputs and try again.');
        return;
      }
      
      // Format the data for the database
      console.log('Formatting event data...');
      const eventData = {
        title: values.title,
        date: values.date ? dayjs(values.date).format('MMMM D, YYYY') : undefined,
        time: values.time ? dayjs(values.time).format('h:mm a') : undefined,
        location: values.location,
        description: values.description,
        dietary: values.dietary || [], // Ensure it's always an array
        category: values.category,
        spotsLeft: values.spotsLeft || 20,
        image: values.image || `${values.category || 'HTC'}.jpg`, // Default image based on category
      };
      
      console.log('Prepared event data for submission:', JSON.stringify(eventData, null, 2));
      
      // Create the event
      console.log('Submitting event to the database...');
      try {
        const createdEvent = await createEvent(eventData);
        console.log('Event created successfully, response:', createdEvent);
        
        message.success('Event created successfully!');
        form.resetFields();
        onEventCreated();
        onClose();
      } catch (createError) {
        console.error('Error creating event - full details:', createError);
        
        // Try to extract more information about the error
        let errorMessage = 'Failed to create event. Please try again.';
        
        if (typeof createError === 'object' && createError !== null) {
          console.error('Error properties:', Object.keys(createError));
          if ('message' in createError) {
            console.error('Error message:', (createError as any).message);
            errorMessage = (createError as any).message;
          }
          if ('code' in createError) {
            console.error('Error code:', (createError as any).code);
          }
          if ('stack' in createError) {
            console.error('Error stack:', (createError as any).stack);
          }
        }
        
        if (createError && (createError as any).code === '42501') {
          message.error('Permission denied: Make sure you are logged in and have the right permissions.');
        } else if (createError && (createError as any).code === '23502') {
          message.error('Missing required fields in the database.');
        } else {
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Unexpected error in event creation process:', error);
      
      // Display appropriate error message
      let errorMessage = 'Failed to create event. Please try again.';
      
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
        
        if (errorMessage.includes('auth')) {
          message.error('Authentication error. Please log in again.');
        } else if (errorMessage.includes('validation')) {
          message.error('Please check your form inputs and try again.');
        } else {
          message.error(errorMessage);
        }
      } else {
        message.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('Event creation process completed.');
    }
  };
  // Render the modal content separately
  const modalContent = (
    <Form
      form={form}
      layout="vertical"
    >
      <FormItem
        name="title"
        label="Event Title"
        rules={[{ required: true, message: 'Please enter the event title' }]}
      >
        <Input id="title" placeholder="Enter event title" />
      </FormItem>

      <div style={{ display: 'flex', gap: '20px' }}>
        <FormItem
          name="date"
          label="Date"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </FormItem>

        <FormItem
          name="time"
          label="Time"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please select a time' }]}
        >
          <TimePicker
            format="h:mm a"
            style={{ width: '100%' }}
          />
        </FormItem>
      </div>

      <FormItem
        name="location"
        label="Location"
        rules={[{ required: true, message: 'Please enter the location' }]}
      >
        <Input id="location" placeholder="Enter event location" />
      </FormItem>

      <div style={{ display: 'flex', gap: '20px' }}>
        <FormItem
          name="category"
          label="Category"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select placeholder="Select category">
            {categoryOptions.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </FormItem>

        <FormItem
          name="spotsLeft"
          label="Available Spots"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please enter available spots' }]}
        >
          <InputNumber min={1} />
        </FormItem>
      </div>

      <FormItem
        name="dietary"
        label="Dietary Options"
        rules={[{ required: true, message: 'Please select at least one dietary option' }]}
      >
        <Select
          mode="multiple"
          placeholder="Select dietary options"
          style={{ width: '100%' }}
        >
          {dietaryOptions.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FormItem>

      <FormItem
        name="description"
        label="Description"
      >
        <TextArea
          rows={4}
          id="description"
          placeholder="Enter event description"
        />
      </FormItem>

      <FormItem
        name="image"
        label="Image (optional)"
        help="Leave blank to use default image for the category"
      >
        <Input id="image" placeholder="Image filename (e.g., 'event.jpg')" />
      </FormItem>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <CustomButton 
          onClick={onClose} 
          text="Cancel"
        />
        <CustomButton 
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{ backgroundColor: '#CC0000', borderColor: '#CC0000' }}
          text="Create Event"
        />
      </div>
    </Form>
  );

  // Render the modal
  if (isOpen) {
    return (
      <Modal
        title="Create New Event"
        visible={isOpen}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        {modalContent}
      </Modal>
    );
  }

  return null;
};

export default CreateEventModal;