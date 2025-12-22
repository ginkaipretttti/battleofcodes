import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CertificatesPage() {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const certificates = await sql`
    SELECT *
    FROM certificates
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `

  const certificateStats = {
    total: certificates.length,
    winners: certificates.filter((c: any) => c.certificate_type === "winner").length,
    placings: certificates.filter((c: any) => c.certificate_type === "second").length,
    thirds: certificates.filter((c: any) => c.certificate_type === "third").length,
    participations: certificates.filter((c: any) => c.certificate_type === "participation").length,
  }

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case "winner":
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case "second":
        return <Medal className="w-6 h-6 text-gray-400" />
      case "third":
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return <Award className="w-6 h-6 text-blue-500" />
    }
  }

  const getCertificateLabel = (type: string) => {
    switch (type) {
      case "winner":
        return "1st Place"
      case "second":
        return "2nd Place"
      case "third":
        return "3rd Place"
      default:
        return "Participation"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">My Certificates</h1>
              <p className="text-muted-foreground mt-2">A collection of your achievements and placements</p>
            </div>
            <Button asChild variant="outline" className="gap-2 bg-transparent">
              <Link href="/profile">
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{certificateStats.total}</p>
                <p className="text-sm text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-yellow-500">{certificateStats.winners}</p>
                <p className="text-sm text-muted-foreground mt-1">1st Place</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-gray-400">{certificateStats.placings}</p>
                <p className="text-sm text-muted-foreground mt-1">2nd Place</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-orange-600">{certificateStats.thirds}</p>
                <p className="text-sm text-muted-foreground mt-1">3rd Place</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-blue-500">{certificateStats.participations}</p>
                <p className="text-sm text-muted-foreground mt-1">Participation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="container mx-auto px-4 py-8">
        {certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Certificates Yet</h2>
            <p className="text-muted-foreground mb-6">Complete games and place in competitions to earn certificates</p>
            <Button asChild>
              <Link href="/dashboard">Play a Game</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert: any) => (
              <Link key={cert.id} href={`/certificate/${cert.game_id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    {/* Top Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getCertificateIcon(cert.certificate_type)}
                          <span className="font-semibold">{getCertificateLabel(cert.certificate_type)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {cert.total_players} players
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {cert.player_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(cert.game_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Points Earned</span>
                        <span className="font-bold text-primary">{cert.points_earned}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Placement</span>
                        <span className="font-bold">
                          {cert.placement} of {cert.total_players}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-4 gap-2 bg-transparent group-hover:bg-primary/10 transition-colors"
                      asChild
                    >
                      <div>
                        <Download className="w-4 h-4" />
                        View Certificate
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
