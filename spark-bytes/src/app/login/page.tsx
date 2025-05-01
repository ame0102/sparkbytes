"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // State management for authentication and UI
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUnauthorized(true);
      }
      setAuthChecked(true);
    };
    checkIfLoggedIn();
  }, []);

  /**
   * Handles BU Email authentication with name
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Validate BU email
    if (!email.endsWith('@bu.edu')) {
      setError('Please use a valid BU email address (@bu.edu)');
      return;
    }

    setLoading(true);
    try {
      // Always include name in metadata (use provided name or email prefix)
      const finalName = name.trim() || email.split('@')[0];
      
      // Send magic link with name in metadata
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          data: { 
            name: finalName
          }
        }
      });
      
      if (error) throw error;
      
      // Show success message within the page
      setMessage("Check your BU email for a login link. After clicking the link, you'll be signed in automatically.");
      
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authChecked && unauthorized) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-2">It looks like you're already logged in!</h2>
          <p className="text-red-700 mb-4">Please return to the home page to view all events</p>
          <button 
            onClick={() => router.push('/')} 
            className="bg-[#CC0000] hover:bg-[#A00000] text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
          >
            Back to Home Page
          </button>
        </div>
      </div>
    );
  }  

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center p-6">
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
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Sign In</h2>

              {error && (
                <div className="bg-[#FFF5F5] border border-[#FFDFDF] p-3 mb-4 rounded-md">
                  <p className="text-[#CC0000] text-xs">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-[#F0FFF4] border border-[#C6F6D5] p-3 mb-4 rounded-md">
                  <p className="text-green-600 text-xs">{message}</p>
                </div>
              )}
  
              <form onSubmit={handleEmailLogin}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Your Name (Optional)</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CC0000] text-sm text-black"
                  />
                </div>
  
                <div className="mb-6">
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">BU Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@bu.edu"
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#CC0000] text-sm text-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">Please use your BU email address</p>
                </div>
  
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#A00000] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Continue with BU Email'
                  )}
                </button>
              </form>
            </div>
          </div>
  
          <div className="border-t border-gray-100 mt-8 pt-4 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Spark! Bytes. A student project for Boston University.
            </p>
          </div>
        </div>
      </div>
    </div>
  );  
}