import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Sparkles } from "lucide-react"

interface Candidate {
  id: number
  name: string
  position: string
  party: string
  photo: string
  votes: number
}

interface Election {
  id: number
  title: string
  description: string
  status: string
  candidates: Candidate[]
}

export default function Voting() {
  const [elections, setElections] = useState<Election[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch("/php/get_elections.php", {
          credentials: "include",
        })
        const data = await res.json()
        if (data.status === "success") {
          setElections(data.elections || [])
        }
      } catch (err) {
        console.error("Failed to fetch elections", err)
      }
      setLoading(false)
    }
    fetchElections()
  }, [])

  const handleVote = async (electionId: number) => {
    const candidateId = selectedCandidates[electionId]
    if (!candidateId) return

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/php/submit_vote.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({
          election_id: String(electionId),
          candidate_id: String(candidateId),
          csrf_token: "",
        }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setSuccess("Vote cast successfully!")
        setSelectedCandidates((prev) => ({ ...prev, [electionId]: undefined }))
        // Refresh
        const refresh = await fetch("/php/get_elections.php", { credentials: "include" })
        const refreshData = await refresh.json()
        if (refreshData.status === "success") setElections(refreshData.elections || [])
      } else {
        setError(data.message || "Failed to cast vote.")
      }
    } catch {
      setError("Connection error.")
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voting</h1>
        <p className="text-gray-500">Cast your votes for upcoming elections.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading elections...</div>
      ) : elections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No active elections at this time.</p>
          </CardContent>
        </Card>
      ) : (
        elections.map((election) => (
          <Card key={election.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{election.title}</CardTitle>
                  <CardDescription>{election.description}</CardDescription>
                </div>
                <Badge variant={election.status === "active" ? "success" : "secondary"}>
                  {election.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {election.candidates.map((candidate) => (
                  <label
                    key={candidate.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCandidates[election.id] === candidate.id
                        ? "border-[#187C19] bg-green-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`election-${election.id}`}
                      value={candidate.id}
                      checked={selectedCandidates[election.id] === candidate.id}
                      onChange={() =>
                        setSelectedCandidates((prev) => ({ ...prev, [election.id]: candidate.id }))
                      }
                      className="text-[#187C19]"
                    />
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.party || candidate.position}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button
                className="mt-4 w-full"
                disabled={!selectedCandidates[election.id] || submitting}
                onClick={() => handleVote(election.id)}
              >
                {submitting ? "Casting Vote..." : "Submit Vote"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
