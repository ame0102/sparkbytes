"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session from URL hash/query params
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          throw new Error('No session found');
        }
        
        // Get user information
        const user = session.user;
        if (!user || !user.email) {
          throw new Error('User information incomplete');
        }
        
        // Get name from metadata or fallback to email
        const userMetadataName = user.user_metadata?.name as string | undefined;
        const emailPrefix = user.email.split('@')[0];
        const name = userMetadataName || emailPrefix;
        
        console.log('Auth callback with name:', name);
        
        // Try to get existing profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          // Profile doesn't exist, create it using upsert
          console.log('Creating new profile with name:', name);
          
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              name: name,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'id' 
            });
          
          if (upsertError) {
            console.error('Profile creation error:', upsertError);
          }
        } else if (userMetadataName && (!existingProfile.name || existingProfile.name !== userMetadataName)) {
          // Profile exists but name has changed, update it
          console.log('Updating profile name from', existingProfile.name, 'to', userMetadataName);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              name: userMetadataName,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error updating profile name:', updateError);
          }
        }
        
        // Redirect to home page
        router.push('/');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        {error ? (
          <div className="text-red-600 mb-4">
            <p>{error}</p>
            <p className="text-sm mt-2">Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <div className="inline-block bg-[#CC0000] text-white p-3 rounded-full mb-4">
              {loading ? (
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {loading ? "Signing you in..." : "Sign in successful!"}
            </h2>
            <p className="text-gray-500">
              {loading 
                ? "Please wait while we complete the authentication process." 
                : "You are now being redirected to the home page."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}