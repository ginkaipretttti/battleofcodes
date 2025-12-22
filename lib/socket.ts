"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

class MessageQueue {
  private queue: Array<{ event: string; data: any }> = []

  push(event: string, data: any) {
    this.queue.push({ event, data })
  }

  flush(socket: Socket) {
    while (this.queue.length > 0) {
      const { event, data } = this.queue.shift()!
      socket.emit(event, data)
    }
  }

  clear() {
    this.queue = []
  }
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const queueRef = useRef(new MessageQueue())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      reconnectInterval: 1000,
    })

    socketRef.current.on("connect", () => {
      console.log("[v0] Socket connected")
      queueRef.current.flush(socketRef.current!)
      setConnected(true)
    })

    socketRef.current.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
      setConnected(false)
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("[v0] Socket connection error:", error)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return { socket: socketRef.current, connected, messageQueue: queueRef.current }
}

export function useRoomSocket(roomCode: string, userId: number, fullname: string) {
  const { socket, connected, messageQueue } = useSocket()
  const [participants, setParticipants] = useState<any[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!socket) return

    const joinData = { roomCode, userId, fullname }
    if (connected) {
      socket.emit("join-room", joinData)
    } else {
      messageQueue.push("join-room", joinData)
    }

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
  }, [socket, connected, roomCode, userId, fullname, messageQueue])

  const sendMessage = (message: string) => {
    const msgData = { roomCode, userId, fullname, message }
    if (socket && connected) {
      socket.emit("chat-message", msgData)
    } else {
      messageQueue.push("chat-message", msgData)
      console.log("[v0] Message queued (socket disconnected)")
    }
  }

  const updateReadyStatus = (isReady: boolean) => {
    const readyData = { roomCode, userId, isReady }
    if (socket && connected) {
      socket.emit("player-ready", readyData)
    } else {
      messageQueue.push("player-ready", readyData)
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
  const { socket, connected, messageQueue } = useSocket()
  const [scores, setScores] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    if (!socket) return

    const joinData = { roomCode, userId, fullname }
    if (connected) {
      socket.emit("join-room", joinData)
    } else {
      messageQueue.push("join-room", joinData)
    }

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
  }, [socket, connected, roomCode, userId, fullname, messageQueue])

  const notifySubmission = (isCorrect: boolean, points: number) => {
    const subData = { roomCode, userId, fullname, isCorrect, points }
    if (socket && connected) {
      socket.emit("code-submitted", subData)
    } else {
      messageQueue.push("code-submitted", subData)
    }
  }

  const updateScores = (updatedScores: any[]) => {
    const scoreData = { roomCode, scores: updatedScores }
    if (socket && connected) {
      socket.emit("score-update", scoreData)
    } else {
      messageQueue.push("score-update", scoreData)
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
