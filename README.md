# Comfee - Cafe Discovery & Review Platform

A cross-platform mobile application built with React Native and Expo that connects cafe enthusiasts with cafe owners. Discover, review, and share your favorite cafes.

## Overview

Comfee is a comprehensive cafe discovery and review platform that allows users to:

- **Browse & Discover** cafes with detailed information
- **Write & Read Reviews** to share experiences
- **Filter & Search** cafes based on preferences
- **Manage Profiles** and personal information
- **Secure Authentication** with email/password

## Tech Stack

### Frontend

- **React Native 0.83.4** - Cross-platform mobile development
- **Expo 55.0.14** - Development platform and build system
- **React 19.2.0** - UI component library
- **TypeScript 5.9.2** - Type-safe development
- **React Navigation** - Navigation stack and tab navigation

### Key Libraries

- **@supabase/supabase-js** - Backend & database services
- **expo-router** - File-based routing
- **react-native-gesture-handler** - Gesture management
- **expo-image-picker** - Image selection
- **expo-location** - Location services
- **date-fns** - Date utilities
- **@react-native-picker/picker** - Picker component

### Development Tools

- **ESLint** - Code linting
- **Jest** - Testing framework
- **TypeScript** - Static type checking

## Project Structure

```
comfee/
├── app/                          # Main app directory (file-based routing)
│   ├── features/
│   │   ├── auth/                 # Authentication
│   │   │   ├── screens/          # Login, signup, password recovery
│   │   │   ├── services/         # Auth logic
│   │   │   └── utils/            # Validation helpers
│   │   ├── cafe/                 # Cafe discovery & reviews
│   │   │   ├── screens/          # Cafe profile, search, filter, review
│   │   │   ├── services/         # Cafe & filtering logic
│   │   │   └── components/
│   │   ├── business/             # Business owner features
│   │   │   ├── screens/          # Business profile, posts
│   │   │   └── components/
│   │   ├── profile/              # User profiles
│   │   ├── settings/             # Settings & preferences
│   │   │   └── services/         # Cafe submission logic
│   │   └── index.tsx             # App entry point
│   ├── shared/
│   │   ├── lib/                  # Supabase client config
│   │   ├── modals/               # Reusable modals (report, review)
│   │   └── utils/                # Shared utilities
│   └── hooks/                    # Custom React hooks
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   └── TopBar.tsx               # App header
├── constants/                    # App constants & theme
├── assets/                       # Images, fonts, icons
└── scripts/                      # Build scripts

```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio or Xcode (for native development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Comfee
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the App

**Development Server**

```bash
npm start
```

**Android**

```bash
npm run android
```

Opens the app in the Android emulator.

**iOS**

```bash
npm run ios
```

Opens the app in the iOS simulator (macOS only).

**Web**

```bash
npm run web
```

Runs the app in a web browser.

## Available Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm start`             | Start Expo development server |
| `npm run android`       | Run on Android emulator       |
| `npm run ios`           | Run on iOS simulator          |
| `npm run web`           | Run in web browser            |
| `npm run lint`          | Run ESLint for code quality   |
| `npm test`              | Run Jest tests                |
| `npm run reset-project` | Reset project to fresh state  |

## Features

### User Features

- **Secure Authentication** - Sign up, login, password recovery
- **Cafe Discovery** - Browse cafe listings with detailed information
- **Reviews** - Write, read, and upvote cafe reviews
- **Search & Filter** - Find cafes by location, amenities, or preferences
- **User Profile** - Manage personal information and preferences
- **Settings** - Change password, notification settings
- **Report Content** - Report inappropriate reviews or content
- **Submit Cafes** - Add new cafes or edit existing cafe information

## Architecture

### State Management

- React Hooks for local state
- Custom hooks for feature-specific logic

### Navigation

- File-based routing with Expo Router
- Bottom tab navigation for main features
- Native Stack navigation for screens

### Backend Integration

- Supabase for authentication, database, and storage
- Supabase client initialized in `app/shared/lib/supabaseClient.ts`

### Code Organization

- Feature-based folder structure
- Separation of concerns (screens, services, utilities)
- Reusable components in `/components` and `/app/shared`

## Key Screens

| Screen            | Purpose                             |
| ----------------- | ----------------------------------- |
| `Login`           | User authentication                 |
| `CreateAccount`   | New user registration               |
| `CafeCard`        | Cafe listing view                   |
| `cafeProfile`     | Detailed cafe information & reviews |
| `Search`          | Search cafes                        |
| `Filter`          | Filter cafes by criteria            |
| `Profile`         | User profile management             |
| `Settings`        | App settings                        |
| `BusinessProfile` | Business owner dashboard            |

## Styling & Theme

- Custom theme configuration in `constants/theme.ts`
- Responsive design for multiple screen sizes
- Dark mode support via `use-color-scheme` hook
- Styled components using React Native `StyleSheet`

## Database Schema (Supabase)

The app uses Supabase for:

- **Authentication** - User sign up and login
- **Database** - Storing cafe information, reviews, posts, profiles
- **Storage** - Images for cafe profiles, posts, and user avatars

## Troubleshooting

### Port Already in Use

If port 8081 is already in use:

```bash
npm start -- --port 8082
```

### Cache Issues

Clear cache and reinstall:

```bash
npm start -- --clear
```

### Dependencies Issues

Try reinstalling dependencies:

```bash
rm -rf node_modules
npm install
```

## Future Enhancements

- [ ] Business Owner Side

## Support

For issues or questions, please contact the development team.
comfee.team@gmail.com

---

**Version:** 1.0.0  
**Last Updated:** May 2026
