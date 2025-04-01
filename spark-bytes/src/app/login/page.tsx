"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function LoginPage() {
  // State management for authentication and UI
  const [formMode, setFormMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  /**
   * Handles form submission for login and signup
   * Validates BU email domain for signup process
   */const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (formMode === 'signup' && !email.endsWith('@bu.edu')) {
    setError('Please use a valid BU email address (@bu.edu)');
    setLoading(false);
    return;
  }

  try {
    let result;
    if (formMode === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    const { error: authError } = result;
    if (authError) throw authError;

    setIsLoggedIn(true);
  } catch (err: any) {
    setError(err.message || 'Authentication failed.');
  } finally {
    setLoading(false);
  }
};

  /**
   * Handles Boston University Single Sign-On authentication
   */const handleBUAuth = async () => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    setError("Check your BU email for a login link.");
  } catch (err: any) {
    setError(err.message || 'BU authentication failed.');
  } finally {
    setLoading(false);
  }
};

  /**
   * Enables guest mode with limited access
   */
  const handleGuestAccess = () => {
    setIsGuestMode(true);
  };

  /**
   * Handles user logout and guest mode exit
   * Resets all auth-related state variables
   */const handleLogout = async () => {
  await supabase.auth.signOut();
  setIsLoggedIn(false);
  setIsGuestMode(false);
  setEmail('');
  setPassword('');
  setName('');
};

  /**
   * Renders the main application content for authenticated and guest users
   * Displays different UI and data based on authentication status
   */
  const renderMainContent = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-white border-b border-gray-100 py-4 px-6">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#CC0000] rounded-full"></div>
              <h1 className="text-xl font-semibold text-gray-800">Spark! Bytes</h1>
            </div>
            <div className="flex items-center gap-4">
              {isGuestMode && (
                <button 
                  className="text-gray-600 hover:text-[#CC0000] font-medium transition-colors bg-gray-100 px-4 py-1.5 rounded-full text-sm"
                >
                  Sign Up
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="text-[#CC0000] hover:text-[#A00000] font-medium transition-colors"
              >
                {isGuestMode ? "Exit Guest Mode" : "Sign Out"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            {isGuestMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-amber-500 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800 text-sm">You're browsing as a guest</h3>
                    <p className="text-amber-700 text-xs mt-1">Some features are limited. Sign in with your BU account for full access.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
              
              {isGuestMode ? (
                <div className="space-y-4">
                  {/* Limited event listings for guest mode */}
                  <EventCard 
                    title="Tech Talk with Free Pizza" 
                    date="Tomorrow, 5:30 PM"
                    location="Photonics Center, Room 206"
                    food="Pizza & Soda"
                    limited={true}
                  />
                  <EventCard 
                    title="Engineering Mixer" 
                    date="March 28, 6:00 PM"
                    location="EMA Building, Floor 3"
                    food="Catered Buffet"
                    limited={true}
                  />
                  <EventCard 
                    title="Community Service Day" 
                    date="April 2, 10:00 AM"
                    location="GSU Plaza"
                    food="Bagels & Coffee"
                    limited={true}
                  />
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-3">Sign in to see more events and RSVP</p>
                      <button 
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center bg-[#CC0000] hover:bg-[#A00000] text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
                      >
                        Sign In for Full Access
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Full event listings for logged in users */}
                  <EventCard 
                    title="Tech Talk with Free Pizza" 
                    date="Tomorrow, 5:30 PM"
                    location="Photonics Center, Room 206"
                    food="Pizza & Soda"
                  />
                  <EventCard 
                    title="Engineering Mixer" 
                    date="March 28, 6:00 PM"
                    location="EMA Building, Floor 3"
                    food="Catered Buffet"
                  />
                  <EventCard 
                    title="Community Service Day" 
                    date="April 2, 10:00 AM"
                    location="GSU Plaza"
                    food="Bagels & Coffee"
                  />
                  <EventCard 
                    title="Research Symposium" 
                    date="April 5, 3:00 PM"
                    location="Life Sciences Building"
                    food="Assorted Sandwiches"
                  />
                  <EventCard 
                    title="Startup Competition Finals" 
                    date="April 10, 4:00 PM"
                    location="Questrom Auditorium"
                    food="Full Catering"
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  };

  /**
   * Renders an individual event card with optional limited functionality for guest users
   * @param title - Event title
   * @param date - Event date and time
   * @param location - Event location
   * @param food - Food being offered
   * @param limited - Whether to show limited version (for guests)
   */

  type EventCardProps = {
    title: string;
    date: string;
    location: string;
    food: string;
    limited?: boolean;
  };

  const EventCard = ({ title, date, location, food, limited = false }: EventCardProps) => {
    return (
      <div className={`p-4 rounded-lg border ${limited ? 'border-gray-100' : 'border-gray-200'} hover:border-gray-300 transition-colors`}>
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{date} • {location}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                {food}
              </span>
            </div>
          </div>
          {!limited && (
            <button className="flex-shrink-0 text-[#CC0000] hover:text-[#A00000] text-sm font-medium">
              RSVP
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoggedIn || isGuestMode) {
    return renderMainContent();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#CC0000] text-white p-3 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Spark! Bytes</h1>
          <p className="text-gray-500">Find free food events at Boston University</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              className={`flex-1 py-3 text-center font-medium text-sm ${
                formMode === 'login' 
                  ? 'text-[#CC0000] border-b-2 border-[#CC0000]' 
                  : 'text-gray-500'
              }`}
              onClick={() => setFormMode('login')}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium text-sm ${
                formMode === 'signup' 
                  ? 'text-[#CC0000] border-b-2 border-[#CC0000]' 
                  : 'text-gray-500'
              }`}
              onClick={() => setFormMode('signup')}
            >
              Create Account
            </button>
          </div>

          <div className="p-6">
            <button 
              className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#A00000] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors mb-6"
              onClick={handleBUAuth}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Continue with BU Email
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-gray-500 tracking-wider">or continue with email</span>
              </div>
            </div>

            {error && (
              <div className="bg-[#FFF5F5] border border-[#FFDFDF] p-3 mb-4 rounded-md">
                <p className="text-[#CC0000] text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {formMode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CC0000] text-sm text-black"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={formMode === 'signup' ? "youremail@bu.edu" : "Email address"}
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CC0000] text-sm text-black"
                />
                {formMode === 'signup' && (
                  <p className="mt-1 text-xs text-gray-500">Please use your BU email address</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700">Password</label>
                  {formMode === 'login' && (
                    <a href="#" className="text-xs text-gray-500 hover:text-[#CC0000] transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CC0000] text-sm text-black"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#CC0000] hover:bg-[#A00000] text-white py-2.5 rounded-lg font-medium text-sm transition-colors mt-2 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  formMode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <button 
                onClick={handleGuestAccess}
                className="text-[#CC0000] hover:text-[#A00000] text-sm font-medium"
              >
                Continue as Guest
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Limited access to view upcoming events
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Spark! Bytes. A student project for Boston University.
          </p>
        </div>
      </div>
    </div>
  );
}