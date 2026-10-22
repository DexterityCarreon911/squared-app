import { useEffect, useState, type FormEvent } from "react"
import { UserPlus, UserRound, UserX } from "lucide-react"
import { Card, getPortal, LoadingState, Notice, PageHeading, PortalFrame, postPortal, useRequireInstructor } from "./portal"

type ScannerRecord = { id: number; student_id: string; first_name: string; last_name: string; program: string | null; status: string }

export default function InstructorScanners() {
  const portal = useRequireInstructor()
  const [scanners, setScanners] = useState<ScannerRecord[]>([])
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!portal.instructor) return
    let active = true
    setLoading(true)
    getPortal<{ scanners: ScannerRecord[] }>("scanners")
      .then((data) => { if (active) setScanners(data.scanners) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load scanner permissions.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [portal.instructor, reload])

  const addScanner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)
    try {
      const result = await postPortal<{ message?: string }>("add_scanner", portal.csrfToken, { student_id: studentId.trim() })
      setStudentId("")
      setSuccess(result.message || "Student authorized as an NSTP scanner.")
      setReload((value) => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not authorize student.")
    } finally {
      setSaving(false)
    }
  }

  const removeScanner = async (scanner: ScannerRecord) => {
    if (!window.confirm(`Remove NSTP scanning permission for ${scanner.first_name} ${scanner.last_name} (${scanner.student_id})?`)) return
    setError("")
    setSuccess("")
    setRemoving(scanner.id)
    try {
      const result = await postPortal<{ message?: string }>("remove_scanner", portal.csrfToken, { id: scanner.id })
      setSuccess(result.message || "NSTP scanner permission removed.")
      setReload((value) => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove scanner permission.")
    } finally {
      setRemoving(null)
    }
  }

  return <PortalFrame instructor={portal.instructor} csrfToken={portal.csrfToken}>
    {portal.loading ? <LoadingState /> : <>
      {portal.error && <Notice>{portal.error}</Notice>}
      {error && <Notice>{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}
      <PageHeading title="Student scanners" description="Authorize students to help scan NSTP attendance. This controls scanner access only; student attendance remains scoped to each instructor’s assigned subjects." />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.7fr)]">
        <Card title="Authorize a student">
          <p className="mb-4 text-sm text-gray-500">Enter the student’s existing ID. The student must already have an account.</p>
          <form onSubmit={addScanner} className="space-y-3">
            <label className="block space-y-1.5 text-sm font-semibold">Student ID
              <input required value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="Student ID" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-[#187C19] focus:ring-2 focus:ring-green-100" />
            </label>
            <button disabled={saving || !portal.csrfToken} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#187C19] px-4 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"><UserPlus className="h-4 w-4" />{saving ? "Authorizing…" : "Authorize scanner"}</button>
          </form>
        </Card>
        <Card title={`Authorized NSTP scanners · ${scanners.length}`}>
          {loading ? <LoadingState message="Loading scanner permissions…" /> : !scanners.length ? <div className="py-8 text-center">
            <UserRound className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-2 font-semibold">No student scanners</p><p className="mt-1 text-sm text-gray-500">No students currently have NSTP scanning permission.</p>
          </div> : <div className="divide-y divide-gray-100">
            {scanners.map((scanner) => <div key={scanner.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div><p className="font-bold">{scanner.first_name} {scanner.last_name}</p><p className="mt-0.5 text-xs text-gray-500">{scanner.student_id}{scanner.program ? ` · ${scanner.program}` : ""}</p></div>
              <button type="button" onClick={() => void removeScanner(scanner)} disabled={removing !== null} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><UserX className="h-4 w-4" />{removing === scanner.id ? "Removing…" : "Remove"}</button>
            </div>)}
          </div>}
        </Card>
      </div>
    </>}
  </PortalFrame>
}
