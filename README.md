# Spark Bytes

## Find free food events at Boston University

Spark Bytes is a web application that helps Boston University students discover and attend free food events on campus. Users can browse upcoming events, RSVP, and receive alerts about their favorite events.

## Features

### User Authentication
- BU email-based authentication (requires @bu.edu email)
- Magic link login (no passwords required)
- User profiles with customizable information

### Events
- Browse public events with food
- Create and manage your own events
- RSVP to events
- Filter events by date, location, and tags
- View event details including time, location, and remaining portions

### Profiles
- Customizable user profiles
- Add your name, bio, major, and graduation year
- Set interests and social links

### Alerts System
- Receive alerts when your favorite events are about to start (within 1 hour)
- Get notified when an event's available portions drop to 10 or fewer
- Real-time notification system

## Tech Stack

### Frontend
- Next.js with React
- TypeScript
- Ant Design for UI components

### Backend
- Supabase for authentication and database
- PostgreSQL database
- Row Level Security (RLS) for data protection

## Database Schema

The application uses the following main tables:

### Profiles
Stores user profile information linked to Supabase Auth.
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  major TEXT DEFAULT '',
  graduation_year INT,
  interests TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Events
Stores event information including food details.
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  capacity INT DEFAULT 0,
  image_url TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Guests
Tracks RSVPs for events.
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  rsvp_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Alerts
Stores notifications for users about events.
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'upcoming_favorite', 'low_capacity', etc.
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Key Components

### Login System
The application uses Supabase's magic link authentication, which sends a login link to the user's BU email. No passwords are required, enhancing security and user experience.

### Alerts System
The alerts system uses PostgreSQL triggers to automatically generate notifications when:
- A user's favorite event is about to start (within 1 hour)
- An event's available portions drops to 10 or fewer

### Profile Management
Users can customize their profiles, including:
- Name (can be updated during login or from profile page)
- Bio and major
- Graduation year
- Interests and social links

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Supabase account
- PostgreSQL knowledge (for database management)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Run the development server: `npm run dev`

### Database Setup
1. Create a new Supabase project
2. Run the SQL scripts provided in `schema.sql` to set up the database tables
3. Configure Row Level Security policies
4. Set up authentication providers (Email)

## Project Structure
```
spark-bytes/
├── public/
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── auth/                 # Authentication pages
│   │   ├── profile/              # Profile pages
│   │   ├── favorites/            # Favorites pages
│   │   └── ...
│   ├── components/               # Reusable components
│   │   ├── NavBar.tsx            # Navigation bar with alerts
│   │   ├── AlertsMenu.jsx        # Alerts dropdown menu
│   │   └── ...
│   ├── utils/                    # Utility functions
│   │   ├── supabaseClient.ts     # Supabase configuration
│   │   ├── eventApi.tsx          # Event-related API functions
│   │   └── ...
│   └── ...
└── ...
```

## Future Enhancements
- Mobile application
- Integration with BU calendar
- Social features for sharing and inviting friends
- Advanced filtering and search capabilities
- Event ratings and reviews

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- [Supabase](https://supabase.io/) for authentication and database
- [Next.js](https://nextjs.org/) for the React framework
- [Ant Design](https://ant.design/) for UI components
