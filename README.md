# Viral Prompt Discovery App 🚀

A premium mobile application for discovering, analyzing, and saving trending AI image and video prompts from across the internet.

![App Preview](https://picsum.photos/800/400)

## Features ✨

### Core Features
- **Prompt Discovery** - Browse viral AI prompts from Reddit, Twitter, YouTube, Pinterest, and more
- **Viral Score System** - Each prompt ranked by viral potential (0-100)
- **Multi-Platform Support** - Prompts from Midjourney, DALL-E, Stable Diffusion, Runway, etc.
- **Offline Mode** - Save prompts for offline access with SQLite caching
- **Premium UI** - Glassmorphism design with smooth animations

### User Features
- **Google Sign-In** - Quick authentication with Google OAuth
- **Guest Mode** - Try the app without creating an account
- **Save & Organize** - Build your collection of favorite prompts
- **Reactions** - Like, love, and react to prompts
- **Trending Charts** - See what's popular with beautiful visualizations

### Fun Section
- **Viral Chat** - Discover fun and creative AI chat prompts
- **Categories** - Funny, Creative, Professional, Art, Writing, Coding
- **One-Tap Copy** - Quickly copy prompts to use in your favorite AI tool

## Tech Stack 🛠️

### Mobile App
- **React Native** with Expo SDK 50
- **TypeScript** for type safety
- **Zustand** for state management
- **React Navigation** for navigation
- **expo-blur** & **expo-linear-gradient** for glassmorphism
- **react-native-reanimated** for premium animations
- **expo-sqlite** for offline storage
- **expo-secure-store** for secure data

### Backend
- **Node.js** with Express
- **MongoDB** for database
- **JWT** for authentication
- **Google OAuth** integration
- **Firebase Cloud Messaging** for push notifications

### Admin Dashboard
- **Next.js 14**
- **TailwindCSS**
- **Chart.js** for analytics

## Project Structure 📁

```
viral-prompt/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel config
│
├── src/
│   ├── theme/             # Design system & colors
│   │   └── index.ts       # Theme configuration
│   │
│   ├── types/             # TypeScript definitions
│   │   └── index.ts       # All type definitions
│   │
│   ├── store/             # State management
│   │   └── index.ts       # Zustand store
│   │
│   ├── components/        # Reusable UI components
│   │   ├── index.ts       # Barrel export
│   │   ├── GlassCard.tsx  # Glassmorphic card
│   │   ├── Button.tsx     # Button variants
│   │   ├── PromptCard.tsx # Prompt display card
│   │   ├── Header.tsx     # Navigation header
│   │   └── ...
│   │
│   ├── screens/           # App screens
│   │   ├── index.ts       # Barrel export
│   │   ├── SplashScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TrendingScreen.tsx
│   │   ├── ViralChatScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ...
│   │
│   ├── navigation/        # Navigation setup
│   │   ├── index.ts
│   │   ├── RootNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   └── services/          # API & services
│       ├── index.ts
│       ├── api.ts         # Backend API
│       ├── database.ts    # SQLite offline storage
│       ├── notifications.ts
│       └── auth.ts
│
├── backend/               # Node.js backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts       # Express server
│       ├── config/
│       ├── models/        # MongoDB models
│       ├── routes/        # API routes
│       ├── middleware/    # Auth & error handling
│       └── scripts/       # Seed data
│
└── admin/                 # Admin dashboard (Next.js)
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── src/
        ├── pages/
        ├── lib/
        └── styles/
```

## Getting Started 🚀

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (local or Atlas)
- Google Cloud Console project (for OAuth)
- Firebase project (for push notifications)

### Mobile App Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Google OAuth**
   - See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions
   - Copy `.env.example` to `.env.local` and add your credentials:
     ```bash
     cp .env.example .env.local
     # Edit .env.local with your Google OAuth client IDs
     ```

3. **Start Expo**
   ```bash
   npx expo start --tunnel
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Seed database**
   ```bash
   npm run seed
   ```

5. **Start server**
   ```bash
   npm run dev
   ```

### Admin Dashboard Setup

1. **Navigate to admin**
   ```bash
   cd admin
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open** http://localhost:3001

## Environment Variables 🔐

### Mobile App (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

### Backend (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/viral_prompt
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-email
```

## API Endpoints 📡

### Auth
- `POST /api/auth/google` - Google sign in
- `POST /api/auth/guest` - Guest sign in
- `GET /api/auth/profile` - Get user profile

### Prompts
- `GET /api/prompts` - List prompts (paginated)
- `GET /api/prompts/trending` - Get trending prompts
- `GET /api/prompts/search` - Search prompts
- `GET /api/prompts/:id` - Get single prompt
- `POST /api/prompts/:id/save` - Save prompt
- `POST /api/prompts/:id/react` - React to prompt

### Viral Chats
- `GET /api/viral-chats` - List viral chats
- `GET /api/viral-chats/trending` - Trending chats
- `POST /api/viral-chats/:id/copy` - Track copy

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/prompts` - Create prompt
- `POST /api/admin/prompts/bulk` - Bulk import
- `POST /api/admin/notifications/broadcast` - Send to all

## Design System 🎨

### Colors
- **Primary**: Purple (#A855F7)
- **Accent**: Orange (#F97316)
- **Background Dark**: #0F0F14
- **Background Light**: #F8FAFC

### Glassmorphism
- Background: `rgba(255, 255, 255, 0.05)`
- Blur: `10-20px`
- Border: `1px solid rgba(255, 255, 255, 0.1)`

### Typography
- Font: System default (SF Pro on iOS, Roboto on Android)
- Sizes: xs (10), sm (12), md (14), lg (16), xl (18), 2xl (24), 3xl (32)

## Troubleshooting 🔧

### "Access blocked: Authorization Error" on Google Login
**Solution**: Google OAuth credentials are not configured.
1. Follow the setup in [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
2. Create `.env.local` with your OAuth credentials
3. Restart the app with `npx expo start --tunnel`

### "Network request failed" / API errors
1. Ensure backend is running: `cd backend && npm run dev`
2. Check backend is accessible at `https://dev-api-test.x1.stage.hostnmeet.com/api`
3. Verify environment variable `EXPO_PUBLIC_API_URL` is correct

### Expo build fails
1. Clear cache: `expo start --clear`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: `node --version` (should be 18+)

### Offline mode not working
1. Prompts are cached locally in SQLite after first fetch
2. Close and reopen app to test offline access
3. Check device storage permissions

## Screenshots 📱

| Home | Trending | Viral Chat | Profile |
|------|----------|------------|---------|
| ![Home](https://picsum.photos/200/400?random=1) | ![Trending](https://picsum.photos/200/400?random=2) | ![Chat](https://picsum.photos/200/400?random=3) | ![Profile](https://picsum.photos/200/400?random=4) |

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Support 💬

- Email: support@viralprompt.app
- Discord: [Join our community](https://discord.gg/viralprompt)
- Twitter: [@viralpromptapp](https://twitter.com/viralpromptapp)

---

Built with ❤️ for the AI creative community
