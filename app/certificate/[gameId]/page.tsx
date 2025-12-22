"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, ArrowLeft, Trophy, Medal, Award } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface CertificateData {
  id: number
  player_name: string
  certificate_type: "winner" | "second" | "third" | "participation"
  placement: number
  total_players: number
  points_earned: number
  game_date: string
}

export default function CertificatePage({ params }: { params: Promise<{ gameId: string }> }) {
  const router = useRouter()
  const [gameId, setGameId] = useState<string>("")
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { gameId: id } = await params
      setGameId(id)
      await fetchCertificate(id)
    }
    getParams()
  }, [params])

  const fetchCertificate = async (id: string) => {
    try {
      const response = await fetch(`/api/certificate/${id}`)
      const data = await response.json()

      if (response.ok) {
        setCertificate(data)
      } else {
        setError(data.error || "Certificate not found")
      }
    } catch (err) {
      setError("Failed to load certificate")
      console.error("[v0] Certificate fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async () => {
    const element = document.getElementById("certificate")
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0f0f0f",
        scale: 2,
      })
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210)
      pdf.save(`${certificate?.player_name}-certificate.pdf`)
    } catch (err) {
      console.error("[v0] PDF generation error:", err)
    }
  }

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Certificate",
          text: `I earned a ${certificate?.certificate_type} certificate!`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("[v0] Share error:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const getCertificateStyle = () => {
    switch (certificate.certificate_type) {
      case "winner":
        return { bg: "from-yellow-900 to-amber-900", accent: "text-yellow-400" }
      case "second":
        return { bg: "from-gray-700 to-gray-900", accent: "text-gray-300" }
      case "third":
        return { bg: "from-orange-900 to-amber-900", accent: "text-orange-300" }
      default:
        return { bg: "from-blue-900 to-blue-950", accent: "text-blue-300" }
    }
  }

  const getPlacementIcon = () => {
    switch (certificate.placement) {
      case 1:
        return <Trophy className="w-16 h-16" />
      case 2:
        return <Medal className="w-16 h-16" />
      case 3:
        return <Award className="w-16 h-16" />
      default:
        return <Award className="w-16 h-16" />
    }
  }

  const style = getCertificateStyle()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCertificate} className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button variant="outline" onClick={shareCertificate} className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        <div
          id="certificate"
          className={`bg-gradient-to-br ${style.bg} rounded-2xl p-12 text-center border-4 border-primary/30 shadow-2xl`}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${style.accent} mb-2`}>Certificate of Achievement</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </div>

          {/* Icon */}
          <div className={`flex justify-center mb-8 ${style.accent}`}>{getPlacementIcon()}</div>

          {/* Placement and Name */}
          <div className="mb-8">
            <p className={`text-xl ${style.accent} mb-2`}>
              {certificate.placement === 1
                ? "1st Place Winner"
                : certificate.placement === 2
                  ? "2nd Place"
                  : certificate.placement === 3
                    ? "3rd Place"
                    : `${certificate.placement}th Place`}
            </p>
            <h2 className="text-5xl font-bold text-white mb-4">{certificate.player_name}</h2>
            <p className="text-gray-300 text-lg">has successfully completed the coding challenge</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-8 py-8 border-t border-b border-white/20">
            <div>
              <p className="text-gray-300 mb-2">Points Earned</p>
              <p className={`text-3xl font-bold ${style.accent}`}>{certificate.points_earned}</p>
            </div>
            <div>
              <p className="text-gray-300 mb-2">Total Participants</p>
              <p className={`text-3xl font-bold ${style.accent}`}>{certificate.total_players}</p>
            </div>
            <div>
              <p className="text-gray-300 mb-2">Date</p>
              <p className={`text-lg font-bold ${style.accent}`}>
                {new Date(certificate.game_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-400 text-sm">
            <p>This certificate is awarded for outstanding performance in the Battle of Codes competition</p>
            <p className="mt-2 text-xs">Certificate ID: {gameId}</p>
          </div>
        </div>

        {/* Share Prompt */}
        <Card className="mt-8 p-6 bg-card/50 border-primary/20 text-center">
          <h3 className="text-lg font-semibold mb-2">Share Your Achievement</h3>
          <p className="text-muted-foreground mb-4">Show off your certificate to friends and colleagues</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={shareCertificate} className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share Certificate
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
