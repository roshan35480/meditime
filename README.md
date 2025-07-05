# MediTime - Medication Reminder App

A React-based medication reminder application that helps users manage their medication schedules. The app stores all data locally in the browser's localStorage, ensuring privacy and offline functionality.

## Features

- **Multi-user Support**: Create and manage multiple user profiles
- **Flexible Scheduling**: Set up medication schedules with various options:
  - Days per week scheduling
  - Gap-based scheduling
  - Multiple dose times per day
- **Local Storage**: All data is stored locally in the browser
- **Real-time Reminders**: Browser notifications and audio alerts
- **Schedule Management**: Save, view, and delete medication schedules
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meditime
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

### Creating Users
1. Click on the user management icon in the header
2. Enter a username and click "Create User"
3. Switch between users using the dropdown

### Setting Up Medication Schedules
1. Enter the patient's name
2. Add medications with their details:
   - Medicine name
   - Scheduling method (days per week or gap-based)
   - Selected days or gap interval
   - Number of times per day
   - Dose times
3. Click "Generate Schedule" to create the schedule
4. Save the schedule to your user's profile

### Managing Schedules
- View all saved schedules in the "Overview" tab
- Delete individual schedules or clear all schedules
- Schedules are automatically saved per user

## Data Storage

All data is stored locally in the browser's localStorage:
- User profiles
- Medication schedules
- Form data for each user

**Note**: Data is stored per browser/device and will not sync across devices.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- React 19
- Tailwind CSS
- Lucide React (icons)
- Browser Notifications API
- Web Speech API (text-to-speech)

## Browser Compatibility

The app works in modern browsers that support:
- localStorage
- Notifications API
- Speech Synthesis API
- ES6+ features

## Privacy

Since all data is stored locally in the browser:
- No data is sent to external servers
- No internet connection required after initial load
- Data persists until browser data is cleared
- Each user's data is isolated

## Troubleshooting

If you encounter issues:

1. **Notifications not working**: Ensure you've granted notification permissions
2. **Data not persisting**: Check if localStorage is enabled in your browser
3. **Audio not playing**: Verify your browser supports speech synthesis

## Development

The app uses a modular architecture:
- `src/meditime.js` - Main application component
- `src/services/storageService.js` - Data storage service
- `src/components/` - Reusable UI components

## License

This project is licensed under the MIT License.
