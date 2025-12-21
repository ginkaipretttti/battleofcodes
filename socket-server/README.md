# Battle of Codes - Socket.io Server

Real-time communication server for Battle of Codes game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=3001
CLIENT_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT`: 3001
     - `CLIENT_URL`: Your Vercel app URL

4. Add the Render URL to your Next.js app as `NEXT_PUBLIC_SOCKET_URL`
