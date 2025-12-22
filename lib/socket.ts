"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    })

    socketRef.current.on("connect", () => {
      console.log("[v0] Socket connected")
      setConnected(true)
    })

    socketRef.current.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
      setConnected(false)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return { socket: socketRef.current, connected }
}

export function useRoomSocket(roomCode: string, userId: number, fullname: string) {
  const { socket, connected } = useSocket()
  const [participants, setParticipants] = useState<any[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!socket || !connected) return

    // Join room
    socket.emit("join-room", { roomCode, userId, fullname })

    // Listen for participant updates
    socket.on("participant-joined", (data) => {
      console.log("[v0] Participant joined:", data)
    })

    socket.on("participant-left", (data) => {
      console.log("[v0] Participant left:", data)
    })

    socket.on("player-ready-update", (data) => {
      console.log("[v0] Player ready update:", data)
    })

    socket.on("game-start", () => {
      setGameStarted(true)
    })

    socket.on("new-chat-message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.emit("leave-room", { roomCode, userId })
      socket.off("participant-joined")
      socket.off("participant-left")
      socket.off("player-ready-update")
      socket.off("game-start")
      socket.off("new-chat-message")
    }
  }, [socket, connected, roomCode, userId, fullname])

  const sendMessage = (message: string) => {
    if (socket && connected) {
      socket.emit("chat-message", { roomCode, userId, fullname, message })
    }
  }

  const updateReadyStatus = (isReady: boolean) => {
    if (socket && connected) {
      socket.emit("player-ready", { roomCode, userId, isReady })
    }
  }

  return {
    socket,
    connected,
    participants,
    gameStarted,
    messages,
    sendMessage,
    updateReadyStatus,
  }
}

export function useGameSocket(roomCode: string, gameId: number, userId: number, fullname: string) {
  const { socket, connected } = useSocket()
  const [scores, setScores] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    if (!socket || !connected) return

    socket.emit("join-room", { roomCode, userId, fullname })

    socket.on("submission-received", (data) => {
      setSubmissions((prev) => [...prev, data])
    })

    socket.on("scores-updated", (data) => {
      setScores(data.scores)
    })

    socket.on("new-round", (data) => {
      console.log("[v0] New round:", data)
    })

    socket.on("game-end", (data) => {
      console.log("[v0] Game ended:", data)
    })

    return () => {
      socket.off("submission-received")
      socket.off("scores-updated")
      socket.off("new-round")
      socket.off("game-end")
    }
  }, [socket, connected, roomCode, userId, fullname])

  const notifySubmission = (isCorrect: boolean, points: number) => {
    if (socket && connected) {
      socket.emit("code-submitted", { roomCode, userId, fullname, isCorrect, points })
    }
  }

  const updateScores = (updatedScores: any[]) => {
    if (socket && connected) {
      socket.emit("score-update", { roomCode, scores: updatedScores })
    }
  }

  return {
    socket,
    connected,
    scores,
    submissions,
    notifySubmission,
    updateScores,
  }
}
