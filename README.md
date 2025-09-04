
EventX Studio is a comprehensive event management platform built with React, TypeScript, and Supabase. The platform enables event organizers to create, manage, and grow their events while providing attendees with a seamless booking experience.

## ✨ Features

### For Event Organizers
- **Event Creation & Management**: Create, edit, and manage events with ease
- **Advanced Analytics**: Track ticket sales, attendance, and revenue metrics
- **Attendee Management**: View and manage attendee lists and information
- **Seat Allocation System**: Set up customized seating arrangements for events

### For Attendees
- **Event Discovery**: Browse and search for upcoming events
- **Seamless Booking**: Book tickets with an interactive seat selection interface
- **QR Code Tickets**: Access digital tickets with unique QR codes
- **Account Management**: Track booked events and manage personal information

## 🚀 Technologies

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Maps Integration**: Google Maps API
- **Deployment**: Vercel

## 📦 Project Structure

```
vivaparty-manage/
├── src/                      # Source files
│   ├── assets/               # Static assets
│   ├── components/           # Reusable React components
│   │   └── ui/               # UI component library (Shadcn)
│   ├── hooks/                # Custom React hooks
│   ├── integrations/         # Third-party integrations
│   │   └── supabase/         # Supabase client and types
│   ├── lib/                  # Utility functions
│   ├── pages/                # Page components
│   └── services/             # API services
├── supabase/                 # Supabase configuration
│   └── migrations/           # Database migrations
├── public/                   # Public assets
├── email-templates/          # Email templates
└── ...config files           # Configuration files
```

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Maps API key (optional, for location features)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YassinSalah100/vivaparty-manage.git
   cd vivaparty-manage
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials and other required variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Apply database migrations**
   ```bash
   npm run supabase:migrations
   # or
   npx supabase sql < fix_trigger_updated.sql
   ```

### Production Deployment

1. **Configure Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in the Vercel dashboard
   - Configure build settings (build command: `npm run build`, output directory: `dist`)

2. **Deploy on Vercel**
   ```bash
   npm run build
   npm run deploy
   # or use Vercel CLI/GitHub integration
   ```

3. **Apply database migrations to production**
   - Use Supabase dashboard SQL editor to run migrations
   - Or use the Supabase CLI to push migrations

## 📊 Database Structure

The platform uses the following main tables:

- **users**: Authentication and user information
- **profiles**: Extended user profile data
- **events**: Event details and metadata
- **tickets**: Booking information with seat assignments
- **reviews**: Event ratings and feedback

Custom PostgreSQL triggers ensure:
- Accurate seat availability tracking
- Prevention of double-booking seats
- Automatic synchronization between tickets and event availability

## 🔐 Authentication

The platform uses Supabase Authentication with:
- Email/password authentication
- Role-based access control (admin/organizer vs. attendee)
- Profile management and customization
- Secure session handling

## 📱 Responsive Design

EventX Studio is designed to be fully responsive across:
- Desktop browsers
- Tablets
- Mobile devices

The UI adapts seamlessly to different screen sizes using TailwindCSS breakpoints and flex/grid layouts.

## 🧪 Testing

Run the test suite with:
```bash
npm test
# or
yarn test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See `LICENSE` for more information.

---

© 2025 EventX Studio. All rights reserved.
EOL