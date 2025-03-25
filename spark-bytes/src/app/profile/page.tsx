"use client";

import { useState } from "react";

//used chat for eorror handling/logic check 
export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@bu.edu");
  const [bio, setBio] = useState("Boston University student, tech enthusiast.");
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/150");
  const [phone, setPhone] = useState("123-456-7890");
  const [location, setLocation] = useState("Boston, MA");
  const [website, setWebsite] = useState("https://johndoe.dev");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      console.error("error: name is empty");
      return;
    }
    if (!bio.trim()) {
      console.error("error: bio is empty");
      return;
    }
    if (!phone.match(/^\d{3}-\d{3}-\d{4}$/)) {
      console.error("error: phone format invalid");
      return;
    }

    console.log("saving changes...");
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("profile saved");
      setIsEditing(false);
    } catch (err) {
      console.error("error: failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("logging out user...");
    try {
      // simulate logout logic
      console.log("user logged out successfully");
    } catch (err) {
      console.error("error: logout failed");
    }
  };

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const newProfilePic = URL.createObjectURL(file);
        if (!file.type.toLowerCase().startsWith("image/")) {
          console.error("error: not an image");
          return;
        }
        setProfilePic(newProfilePic);
        console.log("profile picture updated");
      } else {
        console.error("error: no file selected");
      }
    } catch (err) {
      console.error("error: failed to change profile picture");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#808080] rounded-full"></div>
            <h1 className="text-xl font-semibold text-gray-800">Spark! Bytes</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[#808080] hover:text-[#A00000] font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 relative">
              <img src={profilePic} alt="Profile" className="w-full h-full rounded-full border border-gray-300 object-cover" />
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  rows={3}
                  placeholder="Write a short bio..."
                ></textarea>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  placeholder="Location"
                />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                  placeholder="Website"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
                <p className="text-gray-500">{email}</p>
                <p className="text-gray-600 text-sm mt-2">{bio}</p>
                <p className="text-gray-500 mt-2">{phone}</p>
                <p className="text-gray-500">{location}</p>
                <a href={website} target="_blank" className="text-blue-500 hover:underline text-sm">
                  {website}
                </a>
              </>
            )}
          </div>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="w-full bg-[#CC0000] hover:bg-[#A00000] text-white py-3 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
