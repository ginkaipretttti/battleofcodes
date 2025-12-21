# Battle of Codes - Real-Time Coding Battle Platform

A modern, full-stack competitive coding platform where developers battle in real-time C# coding challenges.

## Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **Room System**: Create or join rooms with customizable difficulty and round settings
- **Real-Time Gameplay**: Socket.io powered real-time updates for participants and game events
- **Multi-Round Matches**: Dynamic challenge selection across multiple rounds
- **C# Code Execution**: Secure compilation and execution of C# code with test validation
- **Global Leaderboard**: Track rankings, stats, and compete globally
- **User Profiles**: Detailed stats, game history, and achievement badges
- **Chat System**: Real-time chat in waiting rooms

## Tech Stack

### Frontend (Vercel)
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **shadcn/ui** - Beautiful UI components
- **Socket.io Client** - Real-time communication

### Backend
- **Neon PostgreSQL** - Primary database
- **Next.js API Routes** - REST endpoints
- **Node.js** - Microservices
- **Socket.io Server** - Real-time server (Render)
- **C# Executor Service** - Code compilation/execution (Render)

## Architecture

```
┌─────────────────┐
│   Next.js App   │ (Vercel)
│   - UI/Pages    │
│   - API Routes  │
└────────┬────────┘
         │
         ├─────────────┬──────────────┬─────────────┐
         │             │              │             │
    ┌────▼────┐   ┌───▼────┐   ┌────▼─────┐  ┌───▼────┐
    │  Neon   │   │Socket  │   │C# Exec   │  │ User   │
    │   DB    │   │Server  │   │ Service  │  │Browser │
    └─────────┘   └────────┘   └──────────┘  └────────┘
```

## Project Structure

```
/app                    # Next.js app directory
  /api                  # API routes
  /dashboard            # Main dashboard
  /game                 # Game interface
  /room                 # Waiting room
  /leaderboard          # Global rankings
  /profile              # User profile
/components             # React components
/lib                    # Utilities, database, auth
/socket-server          # Socket.io server (deploy to Render)
/csharp-executor        # C# execution service (deploy to Render)
/scripts                # Database migration scripts
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- .NET SDK 8.0+ (for C# executor)
- Neon PostgreSQL account
- Vercel account
- Render account (for microservices)

### 1. Database Setup

1. Create a Neon PostgreSQL database
2. Add connection string to environment variables
3. Run migration scripts from `/scripts` folder

### 2. Next.js App (Vercel)

```bash
# Install dependencies
npm install

# Environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
CSHARP_EXECUTOR_URL=https://your-csharp-executor.onrender.com

# Run development server
npm run dev
```

### 3. Socket.io Server (Render)

```bash
cd socket-server
npm install

# Deploy to Render as Web Service
# Add environment variable:
CLIENT_URL=https://your-vercel-app.vercel.app
```

### 4. C# Executor Service (Render)

```bash
cd csharp-executor

# Deploy to Render using Dockerfile
# Ensure .NET SDK is installed in the container
```

## Deployment

### Vercel (Next.js App)
1. Connect GitHub repository
2. Add environment variables
3. Deploy

### Render (Microservices)
1. Create two Web Services
2. Socket Server: Node.js runtime
3. C# Executor: Docker with .NET SDK
4. Update Next.js environment variables with service URLs

## Environment Variables

### Next.js App
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_SOCKET_URL=https://socket-server.onrender.com
CSHARP_EXECUTOR_URL=https://csharp-executor.onrender.com
```

### Socket Server
```
PORT=3001
CLIENT_URL=https://your-app.vercel.app
```

### C# Executor
```
PORT=3002
```

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- HTTP-only secure cookies
- Sandboxed code execution
- SQL injection prevention with parameterized queries
- CORS protection
- Execution timeouts

## Game Flow

1. **Authentication**: User registers/logs in
2. **Dashboard**: View stats, create/join rooms
3. **Waiting Room**: Real-time participant updates, ready system
4. **Game Start**: Creator initiates when all ready
5. **Multi-Round Gameplay**: Solve challenges, submit code
6. **Real-Time Updates**: See opponent progress
7. **Game End**: View final scores, update stats
8. **Leaderboard**: Global rankings updated

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Rooms
- `POST /api/rooms/create` - Create room
- `POST /api/rooms/join` - Join room
- `GET /api/rooms/[code]/participants` - Get participants
- `POST /api/rooms/[code]/ready` - Toggle ready
- `POST /api/rooms/[code]/start` - Start game

### Game
- `GET /api/game/[gameId]/current-round` - Get current round
- `POST /api/game/submit` - Submit code solution

### Stats
- `GET /api/stats` - Platform statistics

## Contributing

This is a complete implementation ready for deployment. Feel free to extend with additional features like:
- More programming languages
- Practice mode
- Tournament system
- Friend system
- Custom challenges

## License

MIT License
