"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>([]);

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
        
        addDebug(`Auth callback for user: ${user.id}`);
        addDebug(`Using name from metadata: ${name}`);
        
        // First, try to update the name in both user metadata and profile
        // This ensures that even if the profile exists, we update the name
        
        // 1. Ensure user metadata has the latest name
        if (userMetadataName) {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { name: userMetadataName }
          });
          
          if (metadataError) {
            addDebug(`Error updating user metadata: ${metadataError.message}`);
          } else {
            addDebug(`Updated user metadata with name: ${userMetadataName}`);
          }
        }
        
        // 2. Always update or create the profile record with an upsert
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: name,
            email: user.email,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'id'
          });
        
        if (upsertError) {
          addDebug(`Profile upsert error: ${upsertError.message}`);
          console.error('Profile upsert error:', upsertError);
        } else {
          addDebug(`Successfully upserted profile with name: ${name}`);
        }
        
        // 3. Verify the profile was updated correctly by reading it back
        const { data: updatedProfile, error: readError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (readError) {
          addDebug(`Error reading back profile: ${readError.message}`);
        } else {
          addDebug(`Profile in database has name: ${updatedProfile.name}`);
        }
        
        // Force a delay to ensure all database operations complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to home page
        router.push('/');
      } catch (err) {
        console.error('Auth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Authentication failed: ${errorMessage}`);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  // Helper function to add debug messages
  const addDebug = (message: string) => {
    console.log(message);
    setDebug(prev => [...prev, message]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-lg">
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
            
            {debug.length > 0 && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="font-semibold text-sm mb-2">Debug Information:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {debug.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}