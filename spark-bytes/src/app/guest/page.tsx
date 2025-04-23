"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import NavBar from "@/components/NavBar";

export default function GuestPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  // Use the same events data that's in the homepage
  const events = [
    {
      id: "1",
      title: "HTC Coffee & Conversation",
      date: "February 17th, 2025",
      time: "7:00pm EST",
      location: "Howard Thurman Center",
      food: "Coffee & Pastries",
      dietary: ["Gluten free", "Vegetarian"],
      spotsLeft: 20,
      category: "Social",
      image: "/images/htc.jpg"
    },
    {
      id: "2",
      title: "CAS Pizza Night",
      date: "February 20th, 2025",
      time: "6:30pm EST",
      location: "College of Arts and Sciences",
      food: "Pizza",
      dietary: ["Vegetarian", "Vegan options"],
      spotsLeft: 15,
      category: "Academic",
      image: "/images/cas.jpg"
    },
    {
      id: "3",
      title: "ENG Tech Talk & Tacos",
      date: "February 22nd, 2025",
      time: "5:00pm EST",
      location: "Engineering Building",
      food: "Tacos",
      dietary: ["Gluten free", "Dairy free"],
      spotsLeft: 10,
      category: "Tech",
      image: "/images/eng.jpg"
    },
    {
      id: "4",
      title: "SHA Networking Dinner",
      date: "February 25th, 2025",
      time: "7:30pm EST",
      location: "School of Hospitality",
      food: "Full Dinner",
      dietary: ["Vegetarian", "Gluten free", "Nut free"],
      spotsLeft: 8,
      category: "Professional",
      image: "/images/sha.jpg"
    }
  ];

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data, error } = await supabase.auth.getUser();
  
      // If a user is logged in, redirect them
      if (data.user) {
        router.push('/');
      }
    };
  
    checkAuthStatus();
  }, []);  
  
  // Simulate loading events
  useEffect(() => {
    const timer = setTimeout(() => {
      setEventsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter options
  const dietaryOptions = [
    "Vegetarian",
    "Vegan options",
    "Gluten free",
    "Dairy free",
    "Nut free"
  ];

  const categoryOptions = ["All", "Social", "Academic", "Tech", "Professional"];
  
  // State for filters
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Filter events based on selected filters
  const filteredEvents = events.filter((event) => {
    // Dietary filter
    const matchesDietary =
      selectedDietary.length === 0 ||
      selectedDietary.every((option) => event.dietary.includes(option));

    // Category filter
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;

    return matchesDietary && matchesCategory;
  });

  /**
   * Handle reserving spots for selected events
   */
  const handleReserveSpots = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (selectedEvents.length === 0) {
      setError('Please select at least one event');
      return;
    }
    
    if (!email || !email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      // For each selected event, create a reservation in the database
      const reservations = selectedEvents.map(eventId => ({
        email,
        event_id: eventId,
        created_at: new Date().toISOString(),
        status: 'reserved',
      }));
      
      // Store reservations in Supabase database

      const { error: insertError } = await supabase
        .from('guest_reservations')
        .insert(reservations);
      
      if (insertError) throw insertError;
      
      setSuccess('Your spots have been reserved! Check your email for confirmation.');
      setSelectedEvents([]);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to reserve spots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle event selection
   */
  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  /**
   * Navigate to event details page
   */
  const viewEventDetails = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  /**
   * Opens filter modal
   */
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  /**
   * Closes filter modal
   */
  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  /**
   * Resets all filters
   */
  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedDietary([]);
  };

  /**
   * Toggle dietary option selection
   */
  const toggleDietaryOption = (option: string) => {
    if (selectedDietary.includes(option)) {
      setSelectedDietary(selectedDietary.filter(item => item !== option));
    } else {
      setSelectedDietary([...selectedDietary, option]);
    }
  };
  /*
   * Render an individual event card with selection functionality
   */
  const EventCard = ({ event }: { event: typeof events[0] }) => {
    const isSelected = selectedEvents.includes(event.id);
    
    return (
      <div 
        className={`p-4 rounded-lg border ${isSelected ? 'border-[#CC0000] bg-[#FFF5F5]' : 'border-gray-200'} hover:border-gray-300 transition-colors cursor-pointer shadow-sm hover:shadow-md`}
        onClick={() => toggleEventSelection(event.id)}
      >
        <div className="flex justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 text-lg">{event.title}</h3>
            <p className="text-gray-500 text-sm mt-1">
              {event.date} • {event.time}
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Location:</strong> {event.location}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {event.dietary.map(option => (
                <span key={option} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {option}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                {event.food}
              </span>
              <span className="text-[#CC0000] font-medium text-sm">{event.spotsLeft} spots left</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className={`w-5 h-5 border ${isSelected ? 'bg-[#CC0000] border-[#CC0000]' : 'border-gray-300'} rounded-sm flex items-center justify-center`}>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-amber-500 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-amber-800 text-sm">Guest Mode</h3>
                <p className="text-amber-700 text-xs mt-1">For full access please sign in with your BU account.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'result' : 'results'} shown
                </span>
                
                <button 
                  onClick={openFilterModal}
                  className="text-sm text-gray-600 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
              </div>
            </div>
            
            {/* Active filters */}
            {(selectedCategory !== "All" || selectedDietary.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4 justify-end">
                {selectedCategory !== "All" && (
                  <div className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory("All")}
                      className="ml-1 text-red-800 hover:text-red-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {selectedDietary.map(option => (
                  <div key={option} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    {option}
                    <button 
                      onClick={() => toggleDietaryOption(option)}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={resetFilters}
                  className="text-gray-500 hover:text-gray-700 text-xs underline"
                >
                  Clear all
                </button>
              </div>
            )}
            
            {error && (
              <div className="bg-[#FFF5F5] border border-[#FFDFDF] p-3 mb-4 rounded-md">
                <p className="text-[#CC0000] text-xs">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-[#F0FFF4] border border-[#C6F6D5] p-3 mb-4 rounded-md">
                <p className="text-green-700 text-xs">{success}</p>
              </div>
            )}
            
            <form onSubmit={handleReserveSpots}>
              {eventsLoading ? (
                <div className="py-8 flex justify-center">
                  <svg className="animate-spin h-5 w-5 text-[#CC0000]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg mb-6">
                  <h3 className="text-gray-600 mb-3">No events match your filters</h3>
                  <button 
                    type="button"
                    onClick={resetFilters}
                    className="bg-[#CC0000] hover:bg-[#A00000] text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
              
              {filteredEvents.length > 0 && !eventsLoading && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email to reserve your spot"
                      required
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CC0000] text-sm text-black"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs">
                      {selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'} selected
                    </p>
                    <button 
                      type="submit"
                      disabled={loading || selectedEvents.length === 0}
                      className={`inline-flex items-center justify-center ${selectedEvents.length > 0 ? 'bg-[#CC0000] hover:bg-[#A00000]' : 'bg-gray-300 cursor-not-allowed'} text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors`}
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Reserve My Spot'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
            
            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600 mb-2">Want to see more events?</p>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center bg-[#CC0000] hover:bg-[#A00000] text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
              >
                Sign In for Full Access
              </Link>
            </div>
          </div>
          
          {/* Filter modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-black">Filter Events</h3>
                  <button onClick={closeFilterModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-black"
                    >
                      {categoryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Dietary Options</label>
                    <div className="space-y-2">
                      {dietaryOptions.map(option => (
                        <div key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            id={option}
                            checked={selectedDietary.includes(option)}
                            onChange={() => toggleDietaryOption(option)}
                            className="h-4 w-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
                          />
                          <label htmlFor={option} className="ml-2 text-sm text-black">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={closeFilterModal}
                    className="px-4 py-2 bg-[#CC0000] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#A00000]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What is Guest Mode?</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <p className="text-gray-600 mb-4">
                Guest Mode allows you to browse upcoming events at Boston University that offer free food and reserve your spot without creating an account.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Guest Mode Features:</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Browse upcoming events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>View event details and dietary information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Reserve spots with your email</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Create an Account to:</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#CC0000] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Access additional exclusive events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#CC0000] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Save your event preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#CC0000] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Receive event reminders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#CC0000] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Track your event history</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Spark! Bytes. A student project for Boston University.
          </p>
        </div>
      </footer>
    </div>
  );
}