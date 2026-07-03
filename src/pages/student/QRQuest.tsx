import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, MapPin, QrCode, Sparkles, CheckCircle, ChevronRight } from "lucide-react"

interface Quest {
  id: number
  title: string
  description: string
  points: number
  completed: boolean
}

interface LeaderboardEntry {
  name: string
  points: number
  avatar: string
}

export default function QRQuest() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, lRes] = await Promise.all([
          fetch("/php/get_quests.php", { credentials: "include" }),
          fetch("/php/get_leaderboard.php", { credentials: "include" }),
        ])
        const qData = await qRes.json()
        const lData = await lRes.json()
        if (qData.status === "success") setQuests(qData.quests || [])
        if (lData.status === "success") setLeaderboard(lData.leaderboard || [])
      } catch (err) {
        console.error("Failed to fetch quest data", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const totalPoints = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Quest</h1>
        <p className="text-gray-500">Scan QR codes around campus to earn points and compete!</p>
      </div>

      {/* Score Card */}
      <Card className="bg-gradient-to-r from-[#187C19] to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Your Points</p>
              <p className="text-4xl font-bold">{totalPoints}</p>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Scan Button */}
      <Button size="xl" className="w-full" onClick={() => setScanning(!scanning)}>
        <QrCode className="w-5 h-5 mr-2" />
        {scanning ? "Close Scanner" : "Scan QR Code"}
      </Button>

      {scanning && (
        <Card>
          <CardContent className="p-8 text-center border-2 border-dashed rounded-lg">
            <QrCode className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Camera access would be requested here.</p>
            <p className="text-xs text-gray-400 mt-1">Point your camera at a quest QR code.</p>
          </CardContent>
        </Card>
      )}

      {/* Active Quests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Quests</CardTitle>
          <CardDescription>Scan QR codes around campus to complete quests.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading quests...</div>
          ) : quests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No quests available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    quest.completed ? "bg-green-50 border-green-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      quest.completed ? "bg-green-200" : "bg-gray-100"
                    }`}>
                      {quest.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <MapPin className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{quest.title}</p>
                      <p className="text-xs text-gray-500">{quest.description}</p>
                    </div>
                  </div>
                  <Badge variant={quest.completed ? "success" : "outline"}>
                    {quest.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">No leaderboard data yet.</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-200 text-gray-700" :
                      i === 2 ? "bg-orange-100 text-orange-700" : "text-gray-500"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold">{entry.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
