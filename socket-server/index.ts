import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
})

interface RoomData {
  roomCode: string
  participants: Set<string>
  gameStarted: boolean
}

const rooms = new Map<string, RoomData>()
const userRooms = new Map<string, string>() // socketId -> roomCode

io.on("connection", (socket) => {
  console.log("[Socket.io] User connected:", socket.id)

  // Join room
  socket.on("join-room", ({ roomCode, userId, fullname }) => {
    console.log("[Socket.io] User joining room:", roomCode, userId)

    socket.join(roomCode)
    userRooms.set(socket.id, roomCode)

    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, {
        roomCode,
        participants: new Set(),
        gameStarted: false,
      })
    }

    const room = rooms.get(roomCode)!
    room.participants.add(userId)

    // Notify room about new participant
    io.to(roomCode).emit("participant-joined", {
      userId,
      fullname,
      participantCount: room.participants.size,
    })

    // Send current room state to the new user
    socket.emit("room-state", {
      participantCount: room.participants.size,
      gameStarted: room.gameStarted,
    })
  })

  // Player ready status
  socket.on("player-ready", ({ roomCode, userId, isReady }) => {
    io.to(roomCode).emit("player-ready-update", { userId, isReady })
  })

  // Game start
  socket.on("game-started", ({ roomCode }) => {
    const room = rooms.get(roomCode)
    if (room) {
      room.gameStarted = true
      io.to(roomCode).emit("game-start", { roomCode })
    }
  })

  // Round update
  socket.on("round-update", ({ roomCode, roundNumber, challenge }) => {
    io.to(roomCode).emit("new-round", { roundNumber, challenge })
  })

  // Code submission notification
  socket.on("code-submitted", ({ roomCode, userId, fullname, isCorrect, points }) => {
    io.to(roomCode).emit("submission-received", {
      userId,
      fullname,
      isCorrect,
      points,
      timestamp: Date.now(),
    })
  })

  // Score update
  socket.on("score-update", ({ roomCode, scores }) => {
    io.to(roomCode).emit("scores-updated", { scores })
  })

  // Game end
  socket.on("game-ended", ({ roomCode, finalScores, winner }) => {
    io.to(roomCode).emit("game-end", { finalScores, winner })
    const room = rooms.get(roomCode)
    if (room) {
      room.gameStarted = false
    }
  })

  // Chat message
  socket.on("chat-message", ({ roomCode, userId, fullname, message }) => {
    io.to(roomCode).emit("new-chat-message", {
      userId,
      fullname,
      message,
      timestamp: Date.now(),
    })
  })

  // Leave room
  socket.on("leave-room", ({ roomCode, userId }) => {
    socket.leave(roomCode)
    userRooms.delete(socket.id)

    const room = rooms.get(roomCode)
    if (room) {
      room.participants.delete(userId)

      io.to(roomCode).emit("participant-left", {
        userId,
        participantCount: room.participants.size,
      })

      // Clean up empty rooms
      if (room.participants.size === 0) {
        rooms.delete(roomCode)
      }
    }
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("[Socket.io] User disconnected:", socket.id)

    const roomCode = userRooms.get(socket.id)
    if (roomCode) {
      const room = rooms.get(roomCode)
      if (room) {
        io.to(roomCode).emit("participant-disconnected", {
          participantCount: room.participants.size,
        })
      }
      userRooms.delete(socket.id)
    }
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`[Socket.io] Server running on port ${PORT}`)
})
