export type NstpRecord = {
  id: number
  session_date: string
  student_id: string
  subject_code: string
  subject_name: string
  time_in: string | null
  time_out: string | null
  evaluation_status: "pending" | "confirmed" | string
  evaluated_at: string | null
  certificate_issued_at: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  course: string | null
  program: string | null
  is_owner: boolean
  is_staff: boolean
  evaluation_data: Record<string, number | string> | null
  evaluation_submitted_at: string | null
}

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")

export async function getNstpRecord(attendanceId: string) {
  const response = await fetch(`${apiBase}/php/api/nstp_record.php?att_id=${encodeURIComponent(attendanceId)}`, {
    credentials: "include",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
  const data = await response.json() as { success: boolean; message?: string; record?: NstpRecord }
  if (!response.ok || !data.success || !data.record) throw new Error(data.message || `Could not load NSTP attendance (${response.status}).`)
  return data.record
}

export async function getSharedCsrfToken() {
  const response = await fetch(`${apiBase}/php/api/csrf_token.php`, {
    credentials: "include",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
  const data = await response.json() as { success: boolean; message?: string; csrf_token?: string }
  if (!response.ok || !data.success || !data.csrf_token) throw new Error(data.message || "Could not initialize secure form submission.")
  return data.csrf_token
}

export async function submitNstpEvaluation(attendanceId: number, csrfToken: string, values: Record<string, string>) {
  const body = new URLSearchParams({ ...values, nstp_attendance_id: String(attendanceId), csrf_token: csrfToken })
  const response = await fetch(`${apiBase}/php/submit_nstp_evaluation.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
    body,
  })
  const data = await response.json() as { success: boolean; message?: string }
  if (!response.ok || !data.success) throw new Error(data.message || `Evaluation submission failed (${response.status}).`)
  return data
}

export async function markNstpCertificateIssued(attendanceId: number, csrfToken: string) {
  const response = await fetch(`${apiBase}/php/mark_nstp_certificate_issued.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
    body: new URLSearchParams({ nstp_attendance_id: String(attendanceId), csrf_token: csrfToken }),
  })
  const data = await response.json() as { success: boolean; message?: string }
  if (!response.ok || !data.success) throw new Error(data.message || `Certificate update failed (${response.status}).`)
  return data
}

export const evaluationSections = [
  {
    title: "Activity Assessment",
    description: "Rate each aspect of the activity on a scale of 1 (Poor) to 5 (Excellent).",
    fields: [
      ["clarity_of_objectives", "Clarity of Objectives", "The objectives of the activity were clear and well explained."],
      ["vmg_alignment", "VMG Alignment", "The activity reflected the school’s vision, mission, and goals."],
      ["time_management", "Time Management", "The activity followed the schedule and managed time effectively."],
      ["preparation_restoration", "Preparation and Restoration", "The activity is well prepared and properly restored after completion."],
      ["program_flow", "Program Flow", "The program flowed smoothly from start to finish."],
      ["facilities_equipment", "Facilities and Equipment", "The facilities and equipment were adequate and functional."],
      ["performance_key_personnel", "Performance of Key Personnel", "The organizers and facilitators performed their roles effectively."],
      ["cleanliness_orderliness", "Cleanliness and Orderliness", "The venue was clean, orderly, well-maintained, and unused of SUPs."],
      ["participation", "Participation of Personnel and Students", "Personnel and students actively participated in the activity."],
      ["overall_impact", "Overall Impact", "The activity had a positive impact on participants."],
    ],
  },
  {
    title: "Core Values",
    description: "Rate how well the activity reflected the school’s core values.",
    fields: [
      ["discipline", "Discipline", "The event demonstrates order and adherence to rules."],
      ["compassion", "Compassion", "The event shows respect, care, and inclusivity."],
      ["competence", "Competence", "The event executed with skill, preparedness, and professionalism."],
      ["integrity", "Integrity", "The event conducted fairly and transparently."],
    ],
  },
] as const

export const evaluationTextFields = [
  ["like_reason", "I like this activity because…", "Tell us what you enjoyed about the activity.", "Share your thoughts on what you enjoyed about the activity…"],
  ["significant_learning", "My most significant learning in this activity is…", "What was the most important thing you learned or gained from this activity?", "Describe the most important thing you learned…"],
  ["would_be_successful_if", "It would have been successful if…", "What could have made this activity even better? (Optional)", "Optional: What could have made this activity even better?"],
  ["other_comments", "Other Comments…", "Any other feedback or suggestions for the organizers.", "Any other feedback or suggestions…"],
] as const

export const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Satisfactory",
  4: "Very Satisfactory",
  5: "Excellent",
}

export function nstpDuration(record: NstpRecord) {
  if (!record.time_in || !record.time_out) return ""
  const start = new Date(record.time_in.replace(" ", "T")).getTime()
  const end = new Date(record.time_out.replace(" ", "T")).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return ""
  const minutes = Math.floor((end - start) / 60000)
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours) return `${hours} hour${hours > 1 ? "s" : ""}${remainder ? ` ${remainder} minute${remainder > 1 ? "s" : ""}` : ""}`
  return `${remainder} minute${remainder > 1 ? "s" : ""}`
}

export function nstpFullName(record: NstpRecord) {
  let name = record.first_name.trim()
  if (record.middle_name) name += ` ${record.middle_name.trim().slice(0, 1).toUpperCase()}.`
  name += ` ${record.last_name.trim()}`
  if (record.suffix) name += `, ${record.suffix.trim()}`
  return name
}

export function nstpDateTime(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—"
  const date = new Date(value.replace(" ", "T"))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, options || { dateStyle: "medium", timeStyle: "short" })
}
