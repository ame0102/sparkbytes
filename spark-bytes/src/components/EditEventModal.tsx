"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber, Button, message, Spin } from "antd";
import { getEventById } from "@/utils/eventApi";
import { supabase } from "@/utils/supabaseClient";
import dayjs from "dayjs";
import { EnvironmentOutlined } from "@ant-design/icons";

const { Option } = Select;
const TextArea = Input.TextArea;
const FormItem = Form.Item;

const dietaryOptions = ["Vegan", "Vegetarian", "Gluten Free", "Dairy Free", "Nut Free", "Other", "None"];
const locationOptions = ["East", "Central", "West", "South", "Fenway"];
const buAddresses = [
  // Main Administrative Buildings
  "1 Silber Way, Boston, MA 02215", // Boston University Admissions Building
  "881 Commonwealth Avenue, Boston, MA 02215", // George Sherman Union
  "775 Commonwealth Avenue, Boston, MA 02215", // George Sherman Union
  "233 Bay State Road, Boston, MA 02215", // Marsh Plaza
  "735 Commonwealth Avenue, Boston, MA 02215", // Marsh Chapel
  
  // Charles River Campus - Academic Buildings
  "725 Commonwealth Avenue, Boston, MA 02215", // College of Arts & Sciences (CAS)
  "675 Commonwealth Avenue, Boston, MA 02215", // Stone Science Building
  "685 Commonwealth Avenue, Boston, MA 02215", // College of Fine Arts
  "595 Commonwealth Avenue, Boston, MA 02215", // Questrom School of Business 
  "635 Commonwealth Avenue, Boston, MA 02215", // College of Engineering
  "640 Commonwealth Avenue, Boston, MA 02215", // College of Communication
  "704 Commonwealth Avenue, Boston, MA 02215", // Pardee School of Global Studies
  "765 Commonwealth Avenue, Boston, MA 02215", // School of Law
  "871 Commonwealth Avenue, Boston, MA 02215", // College of General Studies
  "635 Commonwealth Avenue, Boston, MA 02215", // Photonics Center
  "8 St. Mary's Street, Boston, MA 02215", // Engineering Research Building
  "750 Commonwealth Avenue, Boston, MA 02215", // Engineering Product Innovation Center
  "44 Cummington Mall, Boston, MA 02215", // Life Sciences & Engineering Building
  "24 Cummington Mall, Boston, MA 02215", // Physics Research Building
  "590 Commonwealth Avenue, Boston, MA 02215", // Fitness & Recreation Center
  "915 Commonwealth Avenue, Boston, MA 02215", // School of Theology
  "855 Commonwealth Avenue, Boston, MA 02215", // College of Fine Arts (additional space)
  "32 Harry Agganis Way, Boston, MA 02215", // Agganis Arena
  "2 Silber Way, Boston, MA 02215", // School of Education
  "677 Beacon Street, Boston, MA 02215", // College of Health & Rehabilitation Sciences: Sargent College
  "635 Albany Street, Boston, MA 02118", // School of Public Health
  "72 East Concord Street, Boston, MA 02118", // School of Medicine
  "100 East Newton Street, Boston, MA 02118", // Goldman School of Dental Medicine
  "121 Bay State Road, Boston, MA 02215", // Wheelock College of Education & Human Development
  "4 Cummington Mall, Boston, MA 02215", // Mathematics Building
  "20 Cummington Mall, Boston, MA 02215", // Biology Research Building
  "580 Commonwealth Avenue, Boston, MA 02215", // Joan & Edgar Booth Theatre 
  "610 Commonwealth Avenue, Boston, MA 02215", // Center for Computing & Data Sciences
  "745 Commonwealth Avenue, Boston, MA 02215", // Kilachand Center for Integrated Life Sciences & Engineering

  // Libraries
  "771 Commonwealth Avenue, Boston, MA 02215", // Mugar Memorial Library
  "665 Commonwealth Avenue, Boston, MA 02215", // Pardee Management Library
  "765 Commonwealth Avenue, Boston, MA 02215", // Pappas Law Library
  "38 Cummington Mall, Boston, MA 02215", // Science & Engineering Library
  "595 Commonwealth Avenue, Boston, MA 02215", // Questrom Library
  
  // Student Services
  "100 Bay State Road, Boston, MA 02215", // Educational Resource Center
  "881 Commonwealth Avenue, Boston, MA 02215", // Student Health Services
  "19 Deerfield Street, Boston, MA 02215", // Disability Services
  "233 Bay State Road, Boston, MA 02215", // Howard Thurman Center for Common Ground
  "595 Commonwealth Avenue, Boston, MA 02215", // Center for Career Development
  "871 Commonwealth Avenue, Boston, MA 02215", // BU Bookstore
  "985 Commonwealth Avenue, Boston, MA 02215", // BU Police Department
  "152 Bay State Road, Boston, MA 02215", // LGBTQ Student Resource Center
  "775 Commonwealth Avenue, Boston, MA 02215", // Yawkey Center for Student Services
  
  // East Campus - Residence Halls
  "140 Bay State Road, Boston, MA 02215", // Myles Standish Hall
  "150 Bay State Road, Boston, MA 02215", // Myles Annex
  "10 Buick Street, Boston, MA 02215", // Student Village I
  "33 Harry Agganis Way, Boston, MA 02215", // Student Village II
  "180 Bay State Road, Boston, MA 02215", // Kilachand Hall
  "270 Bay State Road, Boston, MA 02215", // Shelton Hall
  "135 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "117 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "125 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "141 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "143 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "153 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "155 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "161 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "163 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "165 Bay State Road, Boston, MA 02215", // Bay State Road Brownstone
  "515 Park Drive, Boston, MA 02215", // Park Drive Residence
  
  // South Campus - Residence Halls
  "273 Babcock Street, Boston, MA 02215", // South Campus Residence
  "275 Babcock Street, Boston, MA 02215", // South Campus Residence
  "277 Babcock Street, Boston, MA 02215", // South Campus Residence
  "279 Babcock Street, Boston, MA 02215", // South Campus Residence
  "283 Babcock Street, Boston, MA 02215", // South Campus Residence
  "285 Babcock Street, Boston, MA 02215", // South Campus Residence
  "518 Park Drive, Boston, MA 02215", // Park Drive Residence
  "520 Park Drive, Boston, MA 02215", // Park Drive Residence
  "522 Park Drive, Boston, MA 02215", // Park Drive Residence
  "530 Park Drive, Boston, MA 02215", // Park Drive Residence
  "532 Park Drive, Boston, MA 02215", // Park Drive Residence
  "534 Park Drive, Boston, MA 02215", // Park Drive Residence
  
  // Warren Towers and West Campus
  "575 Commonwealth Avenue, Boston, MA 02215", // Warren Towers
  "700 Commonwealth Avenue, Boston, MA 02215", // West Campus - Rich Hall
  "708 Commonwealth Avenue, Boston, MA 02215", // West Campus - Claflin Hall
  "710 Commonwealth Avenue, Boston, MA 02215", // West Campus - Sleeper Hall
  
  // Dining Halls
  "100 Bay State Road, Boston, MA 02215", // Marciano Commons
  "575 Commonwealth Avenue, Boston, MA 02215", // Warren Towers Dining
  "700 Commonwealth Avenue, Boston, MA 02215", // West Campus Dining
  "10 Buick Street, Boston, MA 02215", // Student Village Dining
  "273 Babcock Street, Boston, MA 02215", // South Campus Dining
  
  // Athletic Facilities
  "285 Babcock Street, Boston, MA 02215", // FitRec Center
  "100 Ashford Street, Boston, MA 02215", // New Balance Field
  "930 Commonwealth Avenue, Boston, MA 02215", // Track & Tennis Center
  "270 Babcock Street, Boston, MA 02215", // Nickerson Field
  "925 Commonwealth Avenue, Boston, MA 02215", // Walter Brown Arena
  "300 Babcock Street, Boston, MA 02215", // Sailing Pavilion
  
  // Medical Campus
  "72 East Concord Street, Boston, MA 02118", // School of Medicine
  "635 Albany Street, Boston, MA 02118", // School of Public Health
  "100 East Newton Street, Boston, MA 02118", // Goldman School of Dental Medicine
  "815 Albany Street, Boston, MA 02118", // Medical Campus Research Building
  "700 Albany Street, Boston, MA 02118", // BioSquare Research Buildings
  "710 Albany Street, Boston, MA 02118", // Evans Biomedical Research Center
  "670 Albany Street, Boston, MA 02118", // Center for Advanced Biomedical Research
  
  // Fenway Campus (formerly Wheelock College)
  "200 Riverway, Boston, MA 02215", // Fenway Campus Main Building
  "210 Riverway, Boston, MA 02215", // Fenway Campus Residence Hall
  
  // Other Campus Buildings and Facilities
  "808 Commonwealth Avenue, Boston, MA 02215", // BU Central
  "839 Beacon Street, Boston, MA 02215", // WBUR Radio Station
  "1010 Commonwealth Avenue, Boston, MA 02215", // Administrative Offices
  "928 Commonwealth Avenue, Boston, MA 02215", // Dance Theater
  "730 Commonwealth Avenue, Boston, MA 02215", // The Castle
  "225 Bay State Road, Boston, MA 02215", // Institute for the Study of Muslim Societies and Civilizations
  "154 Bay State Road, Boston, MA 02215", // Frederick S. Pardee School of Global Studies
  "595 Commonwealth Avenue, Boston, MA 02215", // Rafik B. Hariri Building
];

// Address Autocomplete Component with local BU campus data
interface BUAddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const BUAddressAutocomplete: React.FC<BUAddressAutocompleteProps> = ({ 
  value = "", 
  onChange, 
  placeholder, 
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
    }
  }, [value, inputValue]);

  const findMatches = (text: string) => {
    if (!text || text.length < 2) {
      return [];
    }
    
    const regex = new RegExp(text, 'gi');
    return buAddresses.filter(address => address.match(regex));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    const matches = findMatches(newValue);
    setSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (address: string) => {
    setInputValue(address);
    onChange?.(address);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="bu-autocomplete" style={{ position: 'relative' }}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`${className} rounded-input`}
        prefix={<EnvironmentOutlined style={{ color: "#CC0000" }} />}
        style={{ width: "100%" }}
        onFocus={() => inputValue && setShowSuggestions(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow for clicks
          setTimeout(() => setShowSuggestions(false), 200);
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((address, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(address)}
              className="autocomplete-item"
            >
              {address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface CustomButtonProps {
  onClick?: () => void;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  loading?: boolean;
  style?: React.CSSProperties;
  text: string;
  icon?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = (props) => (
  <Button
    onClick={props.onClick}
    type={props.type}
    loading={props.loading}
    style={props.style}
    icon={props.icon}
  >
    {props.text}
  </Button>
);

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  onEventUpdated: () => void;
}

export default function EditEventModal({ isOpen, onClose, eventId, onEventUpdated }: EditEventModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [addressValue, setAddressValue] = useState<string>("");

  useEffect(() => {
    // only run when opened with a valid ID
    if (!eventId || !isOpen) return;
    setFetchingData(true);
  
    getEventById(eventId)
      .then((data) => {
        // Parse date correctly
        const parsedDate = data.date ? dayjs(data.date) : null;
        
        // Parse time correctly - IMPORTANT for fixing format issues
        // Strip any AM/PM notation and ensure it's in 24-hour format
        let timeValue = null;
        if (data.time) {
          // Try to parse the time safely
          timeValue = dayjs(`2023-01-01 ${data.time}`, "YYYY-MM-DD HH:mm:ss");
          if (!timeValue.isValid()) {
            // Alternative parsing for 12-hour format
            const matches = data.time.match(/(\d+):(\d+)(?::(\d+))?\s*(am|pm)?/i);
            if (matches) {
              let [_, hours, minutes, seconds, period] = matches;
              if (period && period.toLowerCase() === "pm" && hours !== "12") {
                hours = String(parseInt(hours, 10) + 12);
              }
              timeValue = dayjs(`2023-01-01 ${hours}:${minutes}:${seconds || "00"}`, "YYYY-MM-DD HH:mm:ss");
            }
          }
        }
  
        form.setFieldsValue({
          title: data.title,
          date: parsedDate,
          time: timeValue,
          location: data.location,
          address: data.address,
          food: data.food,
          dietary: data.dietary,
          dietaryComment: data.dietary_comment,
          portions: data.portions,
        });
  
        // Update state values
        setSelectedDietary(data.dietary || []);
        setAddressValue(data.address || "");
      })
      .catch((err) => {
        console.error("Error fetching event data:", err);
        message.error("Failed to load event data");
      })
      .finally(() => {
        setFetchingData(false);
      });
  }, [eventId, isOpen, form]);
  
  // Update address value separately to avoid circular refs
  const handleAddressChange = (value: string) => {
    setAddressValue(value);
    form.setFieldsValue({ address: value });
  };

  const handleSubmit = async () => {
    if (!eventId) {
      message.error("No event ID provided");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        throw new Error("Authentication error - please log in again");
      }
      
      const user = session.user;
      
      // Validate form fields
      const values = await form.validateFields();
      
      // Format date to YYYY-MM-DD
      const formattedDate = values.date ? dayjs(values.date).format("YYYY-MM-DD") : null;
      
      // Format time to 24-hour format (HH:mm:ss) - CRITICAL FIX
      let formattedTime = null;
      if (values.time) {
        formattedTime = dayjs(values.time).format("HH:mm:ss");
      }
      
      // Validate essential data
      if (!formattedDate) {
        message.error("Please select a valid date");
        setLoading(false);
        return;
      }
      
      if (!formattedTime) {
        message.error("Please select a valid time");
        setLoading(false);
        return;
      }

      // Create the update data
      const updateData = {
        id: eventId,
        title: values.title,
        date: formattedDate,
        time: formattedTime,
        location: values.location,
        address: values.address,
        food: values.food,
        dietary: values.dietary,
        dietary_comment: values.dietaryComment || null,
        portions: values.portions,
      };
      
      console.log("Updating event with data:", updateData);
      
      // Simple direct update using Supabase
      const { error } = await supabase
        .from("events")
        .update({
          title: updateData.title,
          date: updateData.date,
          time: updateData.time,
          location: updateData.location,
          address: updateData.address,
          food: updateData.food,
          dietary: updateData.dietary,
          dietary_comment: updateData.dietary_comment,
          portions: updateData.portions,
        })
        .eq("id", eventId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Update error:", error);
        throw new Error(error.message || "Failed to update event");
      }
      
      message.success("Event updated successfully");
      onEventUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error updating event:", err);
      message.error(err?.message || "Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<div style={{ fontSize: "18px", fontWeight: 600 }}>Edit Event</div>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      styles={{ body: { padding: "24px" } }}
      style={{ borderRadius: "8px", overflow: "hidden" }}
    >
      <Form form={form} layout="vertical" disabled={fetchingData}>
        {fetchingData && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px' }}>Loading event data...</div>
          </div>
        )}
        
        <FormItem 
          name="title" 
          label="Event Title" 
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Enter event title" className="rounded-input" />
        </FormItem>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <FormItem 
            name="date" 
            label="Date" 
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: "100%" }} className="rounded-input" />
          </FormItem>
          
          <FormItem 
            name="time" 
            label="Time" 
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Please select a time' }]}
          >
            <TimePicker format="h:mm a" style={{ width: "100%" }} className="rounded-input" />
          </FormItem>
        </div>
        
        <FormItem 
          name="location" 
          label="Location" 
          rules={[{ required: true, message: 'Please select a location' }]}
        >
          <Select placeholder="Select a location" className="rounded-select">
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
          rules={[{ required: true, message: 'Please enter an address' }]}
        >
          <BUAddressAutocomplete 
            placeholder="Start typing to search for a BU campus address"
            className="address-input"
            value={addressValue}
            onChange={handleAddressChange}
          />
        </FormItem>
        
        <FormItem 
          name="dietary" 
          label="Dietary Options" 
          rules={[{ required: true, message: 'Please select at least one dietary option' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select dietary options"
            value={selectedDietary}
            className="rounded-select"
            onChange={(value: string[]) => {
              // If "None" is selected, override all other selections
              if (value.includes("None")) {
                setSelectedDietary(["None"]);
                form.setFieldsValue({ dietary: ["None"] as string[] });
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
                } as boolean
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
            <TextArea rows={2} placeholder="Describe your dietary restrictions" className="rounded-textarea" />
          </FormItem>
        )}
        
        <FormItem 
          name="food" 
          label="Food Options" 
          rules={[{ required: true, message: 'Please describe the food available' }]}
        >
          <TextArea rows={4} placeholder="Enter all food options" className="rounded-textarea" />
        </FormItem>
        
        <FormItem 
          name="portions" 
          label="Number of Portions" 
          rules={[
            { required: true, message: 'Please enter the number of portions' },
            {
              type: "number",
              min: 1,
              message: "Portions must be at least 1",
            },
          ]}
        >
          <InputNumber
            min={1}
            placeholder="e.g. 50"
            style={{ width: "100%" }}
            className="rounded-input"
          />
        </FormItem>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <CustomButton 
            onClick={onClose} 
            text="Cancel" 
            style={{ borderRadius: "6px" }}
          />
          <CustomButton
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{ 
              backgroundColor: "#CC0000", 
              borderColor: "#CC0000", 
              borderRadius: "6px",
              boxShadow: "0 2px 0 rgba(0,0,0,0.045)" 
            }}
            text="Save Changes"
          />
        </div>
      </Form>

      <style jsx global>{`
        .autocomplete-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 200px;
          overflow-y: auto;
          background: white;
          border: 1px solid #eee;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          margin: 0;
          padding: 0;
          list-style: none;
          z-index: 1500;
        }
        
        .autocomplete-item {
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .autocomplete-item:hover {
          background-color: #f9f9f9;
        }
        
        .autocomplete-item:last-child {
          border-bottom: none;
        }
        
        .rounded-input, .rounded-select, .rounded-textarea {
          border-radius: 6px !important;
        }
        
        .rounded-input:focus, .rounded-select:focus, .rounded-textarea:focus {
          border-color: #CC0000 !important;
          box-shadow: 0 0 0 2px rgba(204, 0, 0, 0.2) !important;
        }
        
        .ant-select-selector {
          border-radius: 6px !important;
        }
        
        .ant-modal-content {
          border-radius: 8px !important;
          overflow: hidden;
        }
      `}</style>
    </Modal>
  );
}