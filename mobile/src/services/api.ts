import { File } from "expo-file-system"

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL || "https://squared-qr.online"
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "")

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
  ) {
    super(message)
    this.name = "ApiRequestError"
  }
}

export interface StudentUser {
  student_id: string
}

export interface StudentProfile extends StudentUser {
  first_name?: string
  middle_name?: string
  last_name?: string
  suffix?: string
  email?: string
  course?: string
  program?: string
  avatar?: string
  qr_code?: string | null
}

interface AuthSessionResponse {
  success: boolean
  student: StudentUser | null
  admin: { id: number; username: string } | null
  message?: string
}

interface CsrfResponse {
  success: boolean
  csrf_token?: string
  message?: string
}

interface StudentResponse {
  status?: string
  student?: StudentProfile
  student_id?: string
  message?: string
}

interface LoginResponse {
  status: string
  message?: string
}

interface AttendanceResponse {
  status: string
  message?: string
}

export interface StudentAttendanceRecord {
  event_name: string
  event_date: string
  time_in: string
  status: string
}

export interface StudentNstpAttendanceRecord {
  id: number
  session_date: string
  time_in: string | null
  time_out: string | null
  subject_code: string
  subject_name: string
  evaluation_status: string
  evaluated_at: string | null
  certificate_issued_at: string | null
}

export interface NstpRecord extends StudentNstpAttendanceRecord {
  student_id: string
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

export interface StudentNotification {
  id: number
  type: "event" | "announcement" | "payment" | "info"
  title: string
  message: string
  time_ago: string
  is_read: boolean
}

export interface StudentConfession {
  id: number
  content: string
  category: string
  likes: number
  comments: number
  created_at: string
  is_anonymous: boolean
  liked?: boolean
}

export interface StudentElectionCandidate {
  id: number
  name: string
  position: string
  party: string
  photo: string
}

export interface StudentElection {
  id: number
  title: string
  description: string
  status: string
  candidates: StudentElectionCandidate[]
}

export interface StudentPayment {
  payment_id: number
  amount: number
  status: string
  fee_type: string
  academic_year: string
  semester: string
  processed_at: string | null
  receipt: { receipt_number: string } | null
}

export interface StudentPurchaseLine {
  item_name: string
  unit_price: number
  quantity: number
  line_total: number
}

export interface StudentPurchase {
  sale_id: number
  receipt_number: string
  total_amount: number
  payment_method: string
  student_id: string | null
  created_at: string
  items: StudentPurchaseLine[]
  amount_tendered?: number
  change_amount?: number
}

export interface QRQuestEntry {
  name: string
  avatar: string
  program: string
  scanned_at: string
}

export interface QRQuestLeaderboardEntry {
  rank: number
  name: string
  avatar: string
  program: string
  score: number
}

export interface InstructorAccount {
  id: string
  name: string
}

export interface InstructorSubject {
  subject_code: string
  subject_name: string
  section: string | null
  student_count: number
}

export interface InstructorAttendanceRecord {
  id: number
  session_date: string
  student_id: string
  subject_code: string
  time_in: string | null
  time_out: string | null
  evaluation_status: string | null
  evaluated_at: string | null
  certificate_issued_at: string | null
  first_name: string
  last_name: string
  program: string | null
  course: string | null
  evaluation_data: Record<string, unknown> | null
  evaluation_submitted_at: string | null
}

export interface InstructorScanner {
  id: number
  student_id: string
  first_name: string
  last_name: string
  program: string | null
  status: string
}

export interface AdminAccount {
  id: number
  username: string
}

export interface AdminStudent {
  id: number
  student_id: string
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  sex: string
  program: string
  course: string
  email: string
  avatar: string
  is_pwd?: number
  status: string
  created_at: string
}

export interface AdminPaymentEvent {
  event_id: number
  slug: string
  event_name: string
  fee_amount: number
  is_active: number
  receipt_prefix: string
  sort_order: number
  payment_count: number
}

export interface AdminEventScanner {
  id: number
  student_id: string
  first_name: string
  last_name: string
  program: string | null
  course: string | null
  can_scan_events: number
  can_process_payments: number
  can_scan_qr_quest: number
  can_scan_nstp: number
  can_process_aurora: number
  status: "Allow" | "Deny"
}

export interface AdminNstpSubject {
  id: number
  subject_code: string
  subject_name: string
  section: string
  is_active: number
  created_at: string
}

export interface AdminEvaluationSubmission {
  id: number
  student_id: string
  student_name: string
  program: string
  course: string
  sex: string
  submitted_at: string
  scanned_at: string | null
  form_data: Record<string, unknown>
}

export interface AdminEvaluationEvent {
  event_id: number
  event_name: string
  event_date: string
  status: string
  response_count: number
}

export interface AdminAuroraReportRecord {
  ticket_id: string | null
  student_id: string
  student_name: string
  program: string | null
  course: string | null
  checked_in_at: string
  scanned_by: string | null
}

export interface AdminEvent {
  event_id: number
  event_name: string
  event_date: string
  start_time: string
  end_time: string
  status: "Active" | "Inactive"
  attendance_count: number
  evaluation_link: string | null
}

export interface AdminVotingAward {
  id: number
  slug: string
  title: string
  status: "on" | "off"
  opens_at: string | null
  closes_at: string | null
  nominee_count: number
  vote_count: number
}

export interface AdminVotingNominee {
  id: number
  award_id: number
  name: string
  description: string | null
  photo_url: string | null
  votes: number
}

export interface AdminPaymentSettings {
  membership_fee_amount: string
  current_academic_year: string
  current_semester: "1st" | "2nd" | "Summer"
  aurora_night_fee_amount: string
  aurora_night_event_name: string
  aurora_night_active: "0" | "1"
}

export interface AdminEvaluationField {
  field_id: number
  field_key: string
  field_label: string
  field_type: "text" | "textarea" | "radio" | "select" | "checkbox" | "rating"
  field_options: string | null
  field_placeholder: string | null
  field_help_text: string | null
  is_required: number
  active: number
  sort_order: number
}

export interface AdminSliderImage {
  id: number
  image_url: string
  public_url: string
  display_order: number
}

export interface AdminQRQuestRegistration {
  id: number
  student_id: string
  student_name: string
  first_name: string | null
  last_name: string | null
  avatar: string | null
  program: string | null
  fee_amount: number
  payment_status: "paid" | "pending" | "cancelled" | "free"
  payment_method: string | null
  payment_date: string | null
  created_at: string
}

export interface AdminQRQuestSettings {
  event_name: string
  active: boolean
}

export interface AdminEventScanRecord {
  student_id: string
  first_name: string
  last_name: string
  program: string | null
  scanned_at: string
  status: string
}

export interface AdminEventAttendanceRecord extends AdminEventScanRecord {
  middle_name: string | null
  suffix: string | null
  sex: string
  course: string
  evaluated_at: string | null
  student_name: string
}

export interface AdminEventAttendanceReport {
  event: { event_id: number; event_name: string; event_date: string }
  records: AdminEventAttendanceRecord[]
  page: number
  pages: number
  total: number
  summary: { total: number; confirmed: number; pending: number }
}

export interface PublicEvent {
  event_name: string
  event_date: string
  start_time: string
  end_time: string
  evaluation_link?: string
}

export interface PublicAnnouncement {
  id: number
  title: string
  content: string
  created_at: string
}

export interface PublicStudentCounts {
  total: number
  programs: Record<string, number>
}

export interface AdminAnnouncement {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  target: string
}

export interface AdminConfession {
  id: number
  content: string
  category: string
  student_id: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  likes: number
  comments: number
  reported: number
  is_anonymous: boolean
  author: string
}

export interface AdminConfessionReport {
  id: number
  confession_id: number
  student_id: string
  reason: string
  created_at: string
  content: string
  category: string
}

export interface AdminSupportTicket {
  id: number
  student_id: string
  student_name: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

export interface AdminMembershipPayment {
  payment_id: number
  student_id: string
  student_name: string
  description: string
  fee_type: string
  amount: number
  payment_status: "paid" | "pending" | "cancelled"
  payment_method: string | null
  academic_year: string
  semester: string
  processed_at: string | null
  created_at: string
  receipt_number: string | null
}

export interface AdminPaymentTransaction {
  payment_id: number
  student_id: string
  student_name: string
  program: string | null
  course: string | null
  amount: number
  payment_status: string
  payment_method: string | null
  fee_type: string
  event_name: string
  academic_year: string
  semester: string
  processed_by: string | null
  processed_at: string | null
  receipt_number: string | null
}

export interface AdminPosItem {
  item_id: number
  category_id: number
  name: string
  sku: string | null
  description: string | null
  price: number
  stock_quantity: number
  is_active: boolean
  category_name: string
}

export interface AdminPosSaleLine {
  item_name: string
  unit_price: number
  quantity: number
  line_total: number
}

export interface AdminPosSale {
  sale_id: number
  receipt_number: string
  subtotal?: number
  total_amount: number
  payment_method: string
  student_id: string | null
  student_name?: string | null
  created_at: string
  items: AdminPosSaleLine[]
  amount_tendered?: number
  change_amount?: number
}

export interface AdminAuroraStudent {
  id: string
  name: string
  program?: string
  course?: string
}

export interface AdminAuroraCheckin {
  student_id: string
  student_name: string
  checked_in_at: string
}

export interface AdminAuroraPayment {
  payment_id: number
  student_id: string
  student_name: string
  amount: number
  payment_method: string
  processed_at: string | null
  receipt_number?: string | null
}

export interface AdminAuroraReceipt {
  receipt?: { receipt_number: string; transaction_id: string; generated_at: string }
  student?: AdminAuroraStudent
  payment?: {
    amount: number
    method: string
    event_name: string
    status: string
    academic_year: string
    semester: string
    processed_by: string
    processed_at: string
  }
}

export interface PrefectUser {
  id: number
  name: string
}

export interface PrefectViolation {
  id: number
  name: string
  severity: string
  occurrences: number
  default_sanction: string
  is_active: number
  sort_order?: number
  case_count?: number
}

export interface PrefectStudentMatch {
  student_id: string
  first_name: string
  last_name: string
  program: string
  course?: string
  sex?: string
}

export interface PrefectIncident {
  id: number
  case_no: string
  student_id: string
  first_name: string
  last_name: string
  violation_id?: number
  violation_name: string
  severity: string
  status: string
  incident_at: string
  occurrences_applied: number
  description?: string
  program?: string
  course?: string
  reported_by?: string
  sanction_applied?: string
}

export interface PrefectIncidentAction {
  id: number
  action_type: string
  note: string
  display_name: string
  created_at: string
}

export interface PrefectDisciplineReport {
  summary: { total: number; open_cases: number; resolved: number; dismissed: number; occurrences: number }
  by_violation: { violation: string; cases: number; occurrences: number }[]
}

function toForm(values: Record<string, string | number | boolean>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) params.set(key, String(value))
  return params.toString()
}

async function request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/x-www-form-urlencoded")
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      credentials: "include",
      headers,
    })
  } catch (error) {
    throw new Error(error instanceof Error ? `Network request failed: ${error.message}` : "Network request failed.")
  }

  const raw = await response.text()
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    if (!response.ok) {
      const message = response.status === 404
        ? `API endpoint not found (${response.status}): ${endpoint}`
        : `Request failed (${response.status}): ${endpoint}`
      throw new ApiRequestError(message, response.status, endpoint)
    }
    throw new Error("The server returned an invalid response.")
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
        ? data.message
        : `Request failed (${response.status}): ${endpoint}`
    throw new ApiRequestError(message, response.status, endpoint)
  }
  return data as T
}

function uploadForm(fileUri: string, filename: string, fieldName: string, values: Record<string, string | number>) {
  const body = new FormData()
  for (const [key, value] of Object.entries(values)) body.append(key, String(value))
  body.append(fieldName, new File(fileUri), filename)
  return body
}

function instructorPortalPost<T extends { success?: boolean; message?: string }>(
  action: string,
  csrfToken: string,
  fields: Record<string, string | number> = {},
) {
  return request<T>("/instructor/php/api/portal.php", {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: toForm({ action, csrf_token: csrfToken, ...fields }),
  })
}

interface PrefectApiResult {
  status: "success" | "error"
  message?: string
}

async function prefectRequest<T extends object>(endpoint: string): Promise<T> {
  const result = await request<PrefectApiResult & T>(`/prefect_admin/php/api/${endpoint}`)
  if (result.status !== "success") throw new Error(result.message || "Prefect request failed.")
  return result
}

function prefectJsonPost<T extends object>(body: object, csrfToken: string) {
  return request<PrefectApiResult & T>("/prefect_admin/php/api/incidents.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(body),
  }).then((result) => {
    if (result.status !== "success") throw new Error(result.message || "Could not save incident.")
    return result
  })
}

function prefectCatalogPost<T extends object>(body: object, csrfToken: string) {
  return request<PrefectApiResult & T>("/prefect_admin/php/api/catalog.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(body),
  }).then((result) => {
    if (result.status !== "success") throw new Error(result.message || "Could not save violation.")
    return result
  })
}

export const api = {
  baseUrl: API_BASE_URL,

  async getPublicLandingContent() {
    const [eventsResult, announcementResult] = await Promise.all([
      request<{ events?: PublicEvent[]; message?: string }>("/api/events.php"),
      request<{ announcement?: PublicAnnouncement | null; message?: string }>("/api/announcements.php"),
    ])
    if (!Array.isArray(eventsResult.events)) {
      throw new Error(eventsResult.message || "Could not load upcoming events.")
    }
    return { events: eventsResult.events, announcement: announcementResult.announcement || null }
  },

  async getPublicStudentCounts() {
    const result = await request<Record<string, number>>("/student_counts_json.php")
    if (typeof result.total !== "number") throw new Error("Could not load student counts.")
    const { total, ...programs } = result
    return { total, programs } satisfies PublicStudentCounts
  },

  async prefectSession() {
    const [token, session] = await Promise.all([
      api.getCsrfToken(),
      request<{
        status: string
        message?: string
        authenticated?: boolean
        csrf_token?: string
        user?: PrefectUser | null
      }>("/prefect_admin/php/api/session.php"),
    ])
    if (session.status !== "success") throw new Error(session.message || "Could not verify Prefect session.")
    return { user: session.user || null, csrfToken: token }
  },

  async prefectLogin(username: string, password: string, csrfToken: string) {
    const result = await request<{
      status: string
      message?: string
      csrf_token?: string
      user?: PrefectUser
    }>("/prefect_admin/php/api/session.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body: toForm({ action: "login", username, password, csrf_token: csrfToken }),
    })
    if (result.status !== "success" || !result.user) {
      throw new Error(result.message || "Prefect sign-in failed.")
    }
    return { user: result.user, csrfToken: result.csrf_token || csrfToken }
  },

  async prefectLogout(csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/prefect_admin/php/api/session.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body: toForm({ action: "logout", csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not sign out.")
  },

  async getPrefectIncidents(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params)
    return prefectRequest<{ incidents: PrefectIncident[] }>(`incidents.php?${query}`)
  },

  getPrefectIncident(id: string) {
    return prefectRequest<{ incident: PrefectIncident; timeline: PrefectIncidentAction[] }>(
      `incidents.php?id=${encodeURIComponent(id)}`,
    )
  },

  getPrefectViolations() {
    return prefectRequest<{ violations: PrefectViolation[] }>("catalog.php?resource=violations")
  },

  searchPrefectStudents(query: string) {
    return prefectRequest<{ matches: PrefectStudentMatch[] }>(
      `catalog.php?resource=students&q=${encodeURIComponent(query)}`,
    )
  },

  getPrefectStudent(studentId: string) {
    return prefectRequest<{
      student: PrefectStudentMatch
      stats: { total_cases: number; open_cases: number; total_occurrences: number; tier: string }
      incidents: PrefectIncident[]
    }>(`catalog.php?resource=student&student_id=${encodeURIComponent(studentId)}`)
  },

  getPrefectReport(filters: Record<string, string>) {
    const query = new URLSearchParams(filters)
    return prefectRequest<PrefectDisciplineReport>(`catalog.php?resource=reports&${query}`)
  },

  createPrefectIncident(body: Record<string, string | number>, csrfToken: string) {
    return prefectJsonPost<{ incident_id: number }>(
      { action: "add", ...body },
      csrfToken,
    )
  },

  updatePrefectIncident(body: Record<string, string | number | null>, csrfToken: string) {
    return prefectJsonPost<{ message?: string }>(body, csrfToken)
  },

  savePrefectViolation(body: Record<string, string | number>, csrfToken: string) {
    return prefectCatalogPost<{ message?: string }>(body, csrfToken)
  },

  adminLogin(username: string, password: string, csrfToken: string) {
    return request<{ success: boolean; message?: string }>("/admin/php/login.php", {
      method: "POST",
      body: toForm({ username, password, csrf_token: csrfToken }),
    })
  },

  async adminLogout() {
    const response = await fetch(`${API_BASE_URL}/admin/php/logout.php`, {
      credentials: "include",
      headers: { Accept: "text/html, application/json" },
    })
    if (!response.ok) throw new Error(`Could not sign out (${response.status}).`)
  },

  async getAdminDashboard() {
    const dashboard = await request<{
      status: string
      message?: string
      stats?: {
        total_students?: number
        male_count?: number
        female_count?: number
        programs?: Record<string, { total: number; male: number; female: number }>
        courses?: Record<string, { total: number; male: number; female: number }>
      }
    }>("/admin/php/dashboard_stats.php")
    if (dashboard.status !== "success" || !dashboard.stats) {
      throw new Error(dashboard.message || "Could not load administrator dashboard.")
    }
    return dashboard.stats
  },

  async getAdminStudents() {
    const result = await request<{ status: string; message?: string; students?: AdminStudent[] }>(
      "/admin/php/get_students.php",
    )
    if (result.status !== "success" || !Array.isArray(result.students)) {
      throw new Error(result.message || "Could not load students.")
    }
    return result.students
  },

  async getAdminEvents() {
    const result = await request<{ status: string; message?: string; events?: AdminEvent[] }>(
      "/admin/php/mobile_events_api.php",
    )
    if (result.status !== "success" || !Array.isArray(result.events)) {
      throw new Error(result.message || "Could not load events.")
    }
    return result.events
  },

  async getAdminEventScanFeed(eventId: number) {
    const query = new URLSearchParams({ event_id: String(eventId) })
    const result = await request<{
      status: string
      message?: string
      events?: AdminEvent[]
      recent_scans?: AdminEventScanRecord[]
    }>(`/admin/php/mobile_events_api.php?${query}`)
    if (result.status !== "success" || !Array.isArray(result.recent_scans)) {
      throw new Error(result.message || "Could not load event scan records.")
    }
    return { events: result.events || [], recentScans: result.recent_scans }
  },

  async getAdminEventAttendanceReport(filters: {
    eventId: number
    status: "" | "confirmed" | "pending"
    search: string
    page: number
  }) {
    const query = new URLSearchParams({
      action: "attendance_report",
      event_id: String(filters.eventId),
      status: filters.status,
      search: filters.search,
      page: String(filters.page),
      limit: "30",
    })
    const result = await request<{
      status: string
      message?: string
      event?: AdminEventAttendanceReport["event"]
      records?: AdminEventAttendanceRecord[]
      page?: number
      pages?: number
      total?: number
      summary?: AdminEventAttendanceReport["summary"]
    }>(`/admin/php/mobile_events_api.php?${query}`)
    if (result.status !== "success" || !result.event || !Array.isArray(result.records) || !result.summary) {
      throw new Error(result.message || "Could not load event attendance report.")
    }
    return {
      event: result.event,
      records: result.records,
      page: result.page || filters.page,
      pages: result.pages || 1,
      total: result.total || 0,
      summary: result.summary,
    }
  },

  async exportAdminEventAttendance(eventId: number) {
    const query = new URLSearchParams({ action: "attendance_export", event_id: String(eventId) })
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/admin/php/mobile_events_api.php?${query}`, {
        credentials: "include",
        headers: { Accept: "text/csv" },
      })
    } catch (error) {
      throw new Error(error instanceof Error ? `Network request failed: ${error.message}` : "Network request failed.")
    }
    const content = await response.text()
    if (!response.ok) throw new Error(`Could not export event attendance (${response.status}).`)
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/csv")) {
      throw new Error(content.trim() || "The server did not return a CSV export.")
    }
    return content
  },

  async getAdminPaymentEvents() {
    const result = await request<{ status: string; message?: string; events?: AdminPaymentEvent[] }>(
      "/admin/php/mobile_admin_tools_api.php?resource=payment_events",
    )
    if (result.status !== "success" || !Array.isArray(result.events)) throw new Error(result.message || "Could not load payable events.")
    return result.events
  },

  async saveAdminPaymentEvent(
    action: "add" | "update" | "toggle" | "delete",
    fields: Record<string, string | number>,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_admin_tools_api.php", {
      method: "POST",
      body: toForm({ resource: "payment_events", action, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not save payable event.")
    return result
  },

  async getAdminEventScanners() {
    const result = await request<{ status: string; message?: string; scanners?: AdminEventScanner[] }>(
      "/admin/php/mobile_admin_tools_api.php?resource=event_scanners",
    )
    if (result.status !== "success" || !Array.isArray(result.scanners)) throw new Error(result.message || "Could not load scanner authorizations.")
    return result.scanners
  },

  async saveAdminEventScanner(action: "add" | "update" | "delete", fields: Record<string, string | number>, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_admin_tools_api.php", {
      method: "POST",
      body: toForm({ resource: "event_scanners", action, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update scanner authorization.")
    return result
  },

  async getAdminNstpSubjects() {
    const result = await request<{ status: string; message?: string; subjects?: AdminNstpSubject[] }>(
      "/admin/php/mobile_admin_tools_api.php?resource=nstp_subjects",
    )
    if (result.status !== "success" || !Array.isArray(result.subjects)) throw new Error(result.message || "Could not load NSTP subjects.")
    return result.subjects
  },

  async saveAdminNstpSubject(action: "create" | "update" | "delete", fields: Record<string, string | number>, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_admin_tools_api.php", {
      method: "POST",
      body: toForm({ resource: "nstp_subjects", action, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not save NSTP subject.")
    return result
  },

  async updateAdminStudent(fields: Record<string, string | number>, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_student_management_api.php", {
      method: "POST",
      body: toForm({ action: "update", ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update student.")
    return result
  },

  async deleteAdminStudent(studentId: string, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_student_management_api.php", {
      method: "POST",
      body: toForm({ action: "delete", student_id: studentId, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not delete student.")
    return result
  },

  async getAdminEvaluationResponses(eventId?: number) {
    const query = eventId ? `?event_id=${encodeURIComponent(String(eventId))}` : ""
    const result = await request<{
      status: string
      message?: string
      events?: AdminEvaluationEvent[]
      event?: AdminEvent
      fields?: Record<string, string>
      submissions?: AdminEvaluationSubmission[]
      rating_summary?: Record<string, { label: string; average: number; responses: number }>
      total?: number
    }>(`/admin/php/mobile_evaluation_responses_api.php${query}`)
    if (result.status !== "success") throw new Error(result.message || "Could not load evaluation responses.")
    return result
  },

  async getAdminAuroraReport(filters: { page: number; search: string; dateFrom: string; dateTo: string }) {
    const query = new URLSearchParams({
      page: String(filters.page),
      search: filters.search,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    })
    const result = await request<{
      status: string
      message?: string
      checkins?: AdminAuroraReportRecord[]
      page?: number
      pages?: number
      total?: number
      total_all?: number
      today?: number
    }>(`/admin/php/mobile_aurora_report_api.php?${query}`)
    if (result.status !== "success" || !Array.isArray(result.checkins)) throw new Error(result.message || "Could not load Aurora report.")
    return {
      checkins: result.checkins,
      page: result.page || filters.page,
      pages: result.pages || 1,
      total: result.total || 0,
      totalAll: result.total_all || 0,
      today: result.today || 0,
    }
  },

  async exportAdminAuroraReport(filters: { search: string; dateFrom: string; dateTo: string }) {
    const query = new URLSearchParams({
      action: "export",
      search: filters.search,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    })
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/admin/php/mobile_aurora_report_api.php?${query}`, {
        credentials: "include",
        headers: { Accept: "text/csv" },
      })
    } catch (error) {
      throw new Error(error instanceof Error ? `Network request failed: ${error.message}` : "Network request failed.")
    }
    const content = await response.text()
    if (!response.ok) throw new Error(`Could not export Aurora report (${response.status}).`)
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/csv")) {
      throw new Error(content.trim() || "The server did not return a CSV export.")
    }
    return content
  },

  async getPaymentLookup(studentId: string) {
    const query = new URLSearchParams({ student_id: studentId })
    const result = await request<{
      status: string
      message?: string
      student?: { id: string; name: string; program: string; course: string }
      current_period?: { academic_year: string; semester: string; fee_amount: number; is_paid: boolean }
      aurora_night?: { active: boolean; event_name: string; fee_amount: number; is_paid: boolean }
      events?: { slug: string; event_name: string; fee_amount: number; is_active: boolean; is_paid: boolean }[]
    }>(`/php/get_payment_status.php?${query}`)
    if (result.status !== "success" || !result.student) throw new Error(result.message || "Could not find that student.")
    return result
  },

  async processAdminStudentPayment(
    studentId: string,
    feeType: string,
    paymentMethod: string,
    csrfToken: string,
  ) {
    const result = await request<{
      status: string
      message?: string
      receipt_number?: string
      payment_id?: number
      payment?: { amount: string; event_name: string; method: string; academic_year: string; semester: string }
    }>("/php/process_payment.php", {
      method: "POST",
      body: toForm({ student_id: studentId, fee_type: feeType, payment_method: paymentMethod, amount: 0, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not process payment.")
    return result
  },

  async checkAdminQRQuestRegistration(studentId: string) {
    const query = new URLSearchParams({ student_id: studentId })
    const result = await request<{ status: string; message?: string; registered?: boolean; registration_id?: number | null; event_name?: string }>(
      `/php/qr_quest_check_registration.php?${query}`,
    )
    if (result.status !== "success") throw new Error(result.message || "Could not check QR Quest registration.")
    return result
  },

  async processAdminQRQuestPayment(studentId: string, paymentMethod: string, csrfToken: string) {
    const result = await request<{ status: string; message?: string; registration_id?: number; receipt_number?: string }>(
      "/php/process_qr_quest_payment.php",
      { method: "POST", body: toForm({ student_id: studentId, payment_method: paymentMethod, csrf_token: csrfToken }) },
    )
    if (result.status !== "success") throw new Error(result.message || "Could not process QR Quest payment.")
    return result
  },

  async scanAdminEvent(eventId: number, studentId: string, csrfToken: string) {
    const result = await request<{
      status: string
      message?: string
      student?: { student_id: string; name: string; program: string | null; course: string | null }
      event_name?: string
      attendance_status?: string
    }>("/admin/php/mobile_events_api.php", {
      method: "POST",
      body: toForm({ action: "admin_scan", event_id: eventId, student_id: studentId, csrf_token: csrfToken }),
    })
    if (result.status !== "success" || !result.student) {
      throw new Error(result.message || "Could not record event attendance.")
    }
    return result
  },

  async saveAdminEvent(
    action: "create" | "update",
    event: {
      event_id?: number
      event_name: string
      event_date: string
      start_time: string
      end_time: string
      evaluation_link: string
    },
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_events_api.php", {
      method: "POST",
      body: toForm({ action, ...event, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not save event.")
    return result
  },

  async updateAdminEventStatus(eventId: number, status: AdminEvent["status"], csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_events_api.php", {
      method: "POST",
      body: toForm({ action: "set_status", event_id: eventId, event_status: status, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update event status.")
    return result
  },

  async deleteAdminEvent(eventId: number, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_events_api.php", {
      method: "POST",
      body: toForm({ action: "delete", event_id: eventId, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not delete event.")
    return result
  },

  async getAdminVotingData() {
    const result = await request<{
      status: string
      message?: string
      awards?: AdminVotingAward[]
      nominees?: AdminVotingNominee[]
    }>("/admin/php/mobile_voting_api.php")
    if (result.status !== "success" || !Array.isArray(result.awards) || !Array.isArray(result.nominees)) {
      throw new Error(result.message || "Could not load voting management.")
    }
    return { awards: result.awards, nominees: result.nominees }
  },

  async updateAdminVoting(
    action: "create_award" | "add_nominee" | "toggle_award" | "delete_award" | "delete_nominee",
    fields: Record<string, string | number>,
    csrfToken: string,
    photo?: { uri: string; name: string },
  ) {
    const body = photo
      ? uploadForm(photo.uri, photo.name, "photo", { action, ...fields, csrf_token: csrfToken })
      : toForm({ action, ...fields, csrf_token: csrfToken })
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_voting_api.php", {
      method: "POST",
      body,
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update voting management.")
    return result
  },

  async getAdminSliderImages() {
    const result = await request<{
      status: string
      message?: string
      images?: AdminSliderImage[]
    }>("/admin/php/mobile_slider_api.php")
    if (result.status !== "success" || !Array.isArray(result.images)) {
      throw new Error(result.message || "Could not load slider images.")
    }
    return result.images
  },

  async uploadAdminSliderImage(uri: string, filename: string, displayOrder: number, csrfToken: string) {
    const result = await request<{ status: string; message?: string; image?: AdminSliderImage }>("/admin/php/mobile_slider_api.php", {
      method: "POST",
      body: uploadForm(uri, filename, "image", { action: "upload", display_order: displayOrder, csrf_token: csrfToken }),
    })
    if (result.status !== "success" || !result.image) throw new Error(result.message || "Could not upload slider image.")
    return result
  },

  async updateAdminSliderImage(
    action: "set_order" | "delete",
    fields: Record<string, string | number>,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_slider_api.php", {
      method: "POST",
      body: toForm({ action, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update slider image.")
    return result
  },

  async getAdminQRQuest(page: number, search: string) {
    const query = new URLSearchParams({ page: String(page), search })
    const result = await request<{
      status: string
      message?: string
      registrations?: AdminQRQuestRegistration[]
      page?: number
      pages?: number
      total?: number
      stats?: { registered: number; scans: number; players: number }
      settings?: AdminQRQuestSettings
    }>(`/admin/php/mobile_qr_quest_api.php?${query}`)
    if (result.status !== "success" || !Array.isArray(result.registrations) || !result.stats || !result.settings) {
      throw new Error(result.message || "Could not load QR Quest management.")
    }
    return {
      registrations: result.registrations,
      page: result.page || page,
      pages: result.pages || 1,
      total: result.total || 0,
      stats: result.stats,
      settings: result.settings,
    }
  },

  async updateAdminQRQuest(
    action: "register" | "cancel" | "save_settings",
    fields: Record<string, string | number>,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_qr_quest_api.php", {
      method: "POST",
      body: toForm({ action, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update QR Quest.")
    return result
  },

  async clearAdminQRQuest(csrfToken: string) {
    const result = await request<{
      status: string
      message?: string
      deleted_scans?: number
      deleted_registrations?: number
    }>("/admin/php/mobile_qr_quest_api.php", {
      method: "POST",
      body: toForm({ action: "clear_all", confirm_clear: "yes", csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not clear QR Quest data.")
    return result
  },

  async getAdminPaymentSettings() {
    const result = await request<{
      status: string
      message?: string
      settings?: AdminPaymentSettings
    }>("/admin/php/mobile_payment_settings_api.php")
    if (result.status !== "success" || !result.settings) {
      throw new Error(result.message || "Could not load payment configuration.")
    }
    return result.settings
  },

  async saveAdminPaymentSettings(
    section: "membership" | "aurora_night",
    fields: Record<string, string>,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_payment_settings_api.php", {
      method: "POST",
      body: toForm({ section, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not save payment configuration.")
    return result
  },

  async getAdminEvaluationFields() {
    const result = await request<{
      status: string
      message?: string
      fields?: AdminEvaluationField[]
    }>("/admin/php/mobile_evaluation_fields_api.php")
    if (result.status !== "success" || !Array.isArray(result.fields)) {
      throw new Error(result.message || "Could not load evaluation form fields.")
    }
    return result.fields
  },

  async saveAdminEvaluationField(
    action: "create" | "update" | "delete",
    fields: Record<string, string | number>,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/mobile_evaluation_fields_api.php", {
      method: "POST",
      body: toForm({ action, ...fields, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update evaluation form.")
    return result
  },

  async getAdminAnnouncements() {
    const result = await request<{ status: string; message?: string; announcements?: AdminAnnouncement[] }>(
      "/admin/php/get_announcements.php",
    )
    if (result.status !== "success" || !Array.isArray(result.announcements)) {
      throw new Error(result.message || "Could not load announcements.")
    }
    return result.announcements
  },

  async getAdminConfessions(filter: "all" | "pending" | "reported", page = 1) {
    const query = new URLSearchParams({ filter, page: String(page) })
    const result = await request<{
      success?: boolean
      message?: string
      confessions?: AdminConfession[]
      reports?: AdminConfessionReport[]
      page?: number
      pages?: number
      total?: number
      stats?: { total: number; pending: number; approved: number; rejected: number; open_reports: number }
    }>(`/confession/admin.php?${query}`)
    if (!result.success || !Array.isArray(result.confessions) || !Array.isArray(result.reports) || !result.stats) {
      throw new Error(result.message || "Could not load confession moderation.")
    }
    return {
      confessions: result.confessions,
      reports: result.reports,
      page: result.page || 1,
      pages: result.pages || 1,
      total: result.total || 0,
      stats: result.stats,
    }
  },

  async moderateAdminConfession(
    action: "approve" | "reject" | "delete" | "resolve_report",
    id: number,
    csrfToken: string,
  ) {
    const result = await request<{ success?: boolean; message?: string }>("/confession/admin.php", {
      method: "POST",
      body: toForm({
        action,
        ...(action === "resolve_report" ? { report_id: id } : { id }),
        csrf_token: csrfToken,
      }),
    })
    if (!result.success) throw new Error(result.message || "Could not update confession moderation.")
    return result
  },

  async getAdminSupportTickets(filters: {
    search: string
    page: number
    status: "open" | "in_progress" | "resolved" | "closed" | "all"
  }) {
    const query = new URLSearchParams({ action: "list", ...filters, page: String(filters.page) })
    const result = await request<{
      status: string
      message?: string
      tickets?: AdminSupportTicket[]
      page?: number
      pages?: number
      total?: number
      status_counts?: { open: number; in_progress: number; resolved: number; closed: number }
    }>(`/admin/php/support_api.php?${query}`)
    if (result.status !== "success" || !Array.isArray(result.tickets) || !result.status_counts) {
      throw new Error(result.message || "Could not load support requests.")
    }
    return {
      tickets: result.tickets,
      page: result.page || filters.page,
      pages: result.pages || 1,
      total: result.total || 0,
      statusCounts: result.status_counts,
    }
  },

  async replyToAdminSupportTicket(ticketId: number, message: string, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/support_api.php", {
      method: "POST",
      body: toForm({ action: "reply", ticket_id: ticketId, message, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not send the support reply.")
    return result
  },

  async updateAdminSupportTicketStatus(
    ticketId: number,
    status: AdminSupportTicket["status"],
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/support_api.php", {
      method: "POST",
      body: toForm({ action: "update_status", ticket_id: ticketId, status, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update support status.")
    return result
  },

  async getAdminMembershipPayments(filters: {
    status: "" | "paid" | "pending" | "cancelled"
    search: string
    page: number
  }) {
    const query = new URLSearchParams({
      status: filters.status,
      search: filters.search,
      page: String(filters.page),
    })
    const result = await request<{
      status: string
      message?: string
      payments?: AdminMembershipPayment[]
      page?: number
      pages?: number
      total?: number
      summary?: { total: number; total_collected: number }
    }>(`/admin/php/payments_api.php?${query}`)
    if (
      result.status !== "success" ||
      !Array.isArray(result.payments) ||
      !result.summary
    ) {
      throw new Error(result.message || "Could not load student payments.")
    }
    return {
      payments: result.payments,
      page: result.page || filters.page,
      pages: result.pages || 1,
      total: result.total || 0,
      summary: result.summary,
    }
  },

  async getAdminPaymentTransactions(filters: {
    search: string
    department: string
    feeType: string
    status: string
    dateFrom: string
    dateTo: string
    academicYear: string
    semester: string
    page: number
  }) {
    const query = new URLSearchParams({
      search: filters.search,
      department: filters.department,
      fee_type: filters.feeType,
      status: filters.status,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      academic_year: filters.academicYear,
      semester: filters.semester,
      page: String(filters.page),
      limit: "50",
    })
    const result = await request<{
      status: string
      message?: string
      transactions?: AdminPaymentTransaction[]
      pagination?: { current_page: number; total_pages: number; total_records: number; limit: number }
      analytics?: { total_transactions: number; paid_count: number; pending_count: number; total_collected: number; today_collected: number }
    }>(`/php/get_transactions.php?${query}`)
    if (result.status !== "success" || !Array.isArray(result.transactions) || !result.pagination || !result.analytics) {
      throw new Error(result.message || "Could not load payment transactions.")
    }
    return { transactions: result.transactions, pagination: result.pagination, analytics: result.analytics }
  },

  async exportAdminPaymentTransactions(filters: {
    search: string
    department: string
    feeType: string
    status: string
    dateFrom: string
    dateTo: string
    academicYear: string
    semester: string
  }) {
    const query = new URLSearchParams({
      search: filters.search,
      department: filters.department,
      fee_type: filters.feeType,
      status: filters.status,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      academic_year: filters.academicYear,
      semester: filters.semester,
    })
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/php/export_transactions.php?${query}`, {
        credentials: "include",
        headers: { Accept: "text/csv" },
      })
    } catch (error) {
      throw new Error(error instanceof Error ? `Network request failed: ${error.message}` : "Network request failed.")
    }
    const content = await response.text()
    if (!response.ok) throw new Error(`Could not export payment transactions (${response.status}).`)
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/csv")) {
      throw new Error(content.trim() || "The server did not return a CSV export.")
    }
    return content
  },

  async createAdminAnnouncement(
    title: string,
    content: string,
    target: string,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/admin/php/create_announcement.php", {
      method: "POST",
      body: toForm({ title, content, target, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not publish announcement.")
    return result
  },

  async deleteAdminAnnouncement(id: number, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/admin/php/delete_announcement.php", {
      method: "POST",
      body: toForm({ id, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not delete announcement.")
    return result
  },

  async getAdminPosCatalog() {
    const result = await request<{ status: string; message?: string; items?: AdminPosItem[] }>(
      "/admin/php/pos_api.php?action=catalog",
    )
    if (result.status !== "success" || !Array.isArray(result.items)) {
      throw new Error(result.message || "Could not load the POS catalog.")
    }
    return result.items
  },

  async getAdminPosHistory(filters: { from: string; to: string; search: string }) {
    const query = new URLSearchParams({ action: "history", ...filters })
    const result = await request<{ status: string; message?: string; sales?: AdminPosSale[] }>(
      `/admin/php/pos_api.php?${query}`,
    )
    if (result.status !== "success" || !Array.isArray(result.sales)) {
      throw new Error(result.message || "Could not load POS sales history.")
    }
    return result.sales
  },

  async checkoutAdminPos(
    cart: { item_id: number; quantity: number }[],
    tendered: number,
    studentId: string,
    csrfToken: string,
  ): Promise<{ status: string; message?: string; sale_id: number }> {
    const result = await request<{
      status: string
      message?: string
      sale_id?: number
    }>("/admin/php/pos_api.php", {
      method: "POST",
      body: toForm({
        action: "checkout",
        csrf_token: csrfToken,
        cart_json: JSON.stringify(cart),
        payment_method: "Cash",
        amount_tendered: tendered,
        student_id: studentId,
      }),
    })
    if (result.status !== "success" || typeof result.sale_id !== "number") {
      throw new Error(result.message || "Could not complete the cash sale.")
    }
    return { ...result, sale_id: result.sale_id }
  },

  async getAdminPosReceipt(saleId: number) {
    const result = await request<{ status: string; message?: string; sale?: AdminPosSale }>(
      `/admin/php/pos_api.php?action=receipt&sale_id=${encodeURIComponent(String(saleId))}`,
    )
    if (result.status !== "success" || !result.sale) {
      throw new Error(result.message || "Could not load the receipt.")
    }
    return result.sale
  },

  async getAdminAuroraStudentStatus(studentId: string) {
    const result = await request<{
      status: string
      message?: string
      student?: AdminAuroraStudent
      aurora_night?: { active: boolean; event_name: string; fee_amount: number; is_paid: boolean }
    }>(`/php/get_payment_status.php?student_id=${encodeURIComponent(studentId)}`)
    if (result.status !== "success" || !result.student) {
      throw new Error(result.message || "Could not find the student.")
    }
    return result
  },

  async getAdminAuroraCheckins(limit = 20) {
    const result = await request<{
      status: string
      message?: string
      transactions?: AdminAuroraCheckin[]
      total?: number
    }>(`/php/get_aurora_checkins.php?limit=${encodeURIComponent(String(limit))}`)
    if (result.status !== "success" || !Array.isArray(result.transactions)) {
      throw new Error(result.message || "Could not load Aurora check-ins.")
    }
    return { checkins: result.transactions, total: Number(result.total || 0) }
  },

  async checkAdminAuroraGuest(studentId: string, action: "check" | "checkin", csrfToken: string) {
    const result = await request<{
      success?: boolean
      message?: string
      already_checked_in?: boolean
      checked_in_at?: string
      ticket_id?: string
    }>("/php/aurora_checkin_handler.php", {
      method: "POST",
      body: toForm({ student_id: studentId, action, csrf_token: csrfToken }),
    })
    if (result.success === false) throw new Error(result.message || "Aurora check-in failed.")
    return result
  },

  async getAdminAuroraTransactions(page = 1) {
    const query = new URLSearchParams({
      limit: "10",
      page: String(page),
      fee_type: "aurora_night_2026",
    })
    const result = await request<{
      status: string
      message?: string
      transactions?: AdminAuroraPayment[]
      pagination?: { current_page: number; total_pages: number }
    }>(`/php/get_transactions.php?${query}`)
    if (result.status !== "success" || !Array.isArray(result.transactions)) {
      throw new Error(result.message || "Could not load Aurora payments.")
    }
    return {
      transactions: result.transactions,
      page: result.pagination?.current_page || 1,
      totalPages: result.pagination?.total_pages || 1,
    }
  },

  async processAdminAuroraPayment(
    studentId: string,
    paymentMethod: string,
    csrfToken: string,
  ) {
    const result = await request<{
      status: string
      message?: string
      receipt_number?: string
    }>("/php/process_payment.php", {
      method: "POST",
      body: toForm({
        student_id: studentId,
        payment_method: paymentMethod,
        amount: 0,
        fee_type: "aurora_night_2026",
        csrf_token: csrfToken,
      }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not record Aurora payment.")
    return result
  },

  async getAdminPaymentReceipt(paymentId: number) {
    const result = await request<{
      status: string
      message?: string
      receipt?: AdminAuroraReceipt["receipt"]
      student?: AdminAuroraReceipt["student"]
      payment?: AdminAuroraReceipt["payment"]
    }>(`/php/generate_receipt.php?payment_id=${encodeURIComponent(String(paymentId))}`)
    if (result.status !== "success" || !result.receipt || !result.student || !result.payment) {
      throw new Error(result.message || "Could not load payment receipt.")
    }
    return result
  },

  async getInstructorBootstrap() {
    const [data, csrfToken] = await Promise.all([
      request<{
        success?: boolean
        message?: string
        instructor?: InstructorAccount | null
        subjects?: InstructorSubject[]
      }>(`/instructor/php/api/portal.php?action=bootstrap`),
      api.getCsrfToken(),
    ])
    if (data.success === false) throw new Error(data.message || "Could not load instructor account.")
    return { instructor: data.instructor || null, subjects: data.subjects || [], csrfToken }
  },

  async instructorLogin(instructorId: string, password: string, csrfToken: string) {
    const result = await instructorPortalPost<{ success?: boolean; message?: string }>("login", csrfToken, {
      instructor_id: instructorId,
      password,
    })
    if (result.success === false) throw new Error(result.message || "Instructor sign-in failed.")
    return result
  },

  instructorLogout(csrfToken: string) {
    return instructorPortalPost("logout", csrfToken)
  },

  getInstructorDashboard() {
    return request<{
      success?: boolean
      message?: string
      stats: { total: number; time_in: number; time_out: number }
      sessions: string[]
      recent: InstructorAttendanceRecord[]
    }>("/instructor/php/api/portal.php?action=dashboard")
  },

  getInstructorRecords(action: "history" | "evaluations" | "certificates", params: Record<string, string> = {}) {
    const query = new URLSearchParams({ action, ...params })
    return request<{ success?: boolean; message?: string; records: InstructorAttendanceRecord[] }>(
      `/instructor/php/api/portal.php?${query.toString()}`,
    )
  },

  async getInstructorScanners() {
    const result = await request<{ success?: boolean; message?: string; scanners?: InstructorScanner[] }>(
      "/instructor/php/api/portal.php?action=scanners",
    )
    if (result.success === false) throw new Error(result.message || "Could not load scanner permissions.")
    return result.scanners || []
  },

  addInstructorScanner(studentId: string, csrfToken: string) {
    return instructorPortalPost("add_scanner", csrfToken, { student_id: studentId })
  },

  removeInstructorScanner(scannerId: number, csrfToken: string) {
    return instructorPortalPost("remove_scanner", csrfToken, { id: scannerId })
  },

  async instructorScan(mode: "time_in" | "time_out", studentId: string, csrfToken: string) {
    const result = await instructorPortalPost<{
      success?: boolean
      message?: string
      student_name?: string
      time?: string
      subject?: string
    }>("scan", csrfToken, { scan_action: mode, student_id: studentId })
    if (result.success === false) throw new Error(result.message || "Attendance scan failed.")
    return result
  },

  async instructorIssueCertificate(recordId: number, csrfToken: string) {
    const result = await instructorPortalPost<{ success?: boolean; message?: string }>(
      "issue_certificate",
      csrfToken,
      { nstp_attendance_id: recordId },
    )
    if (result.success === false) throw new Error(result.message || "Could not issue certificate.")
    return result
  },

  async getCsrfToken() {
    const result = await request<CsrfResponse>("/php/api/csrf_token.php")
    if (!result.success || !result.csrf_token) {
      throw new Error(result.message || "Could not obtain a security token.")
    }
    return result.csrf_token
  },

  getAuthSession() {
    return request<AuthSessionResponse>("/php/api/auth_session.php")
  },

  login(studentId: string, password: string, csrfToken: string) {
    return request<LoginResponse>("/php/login.php", {
      method: "POST",
      body: toForm({ student_id: studentId, password, csrf_token: csrfToken }),
    })
  },

  async registerStudent(
    values: Record<string, string>,
    csrfToken: string,
  ) {
    const response = await fetch(`${API_BASE_URL}/php/register.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: toForm({ ...values, csrf_token: csrfToken }),
    })
    const raw = await response.text()
    if (response.redirected && new URL(response.url).pathname.includes("login.php")) return
    let payload: { status?: string; success?: boolean; message?: string }
    try {
      payload = JSON.parse(raw) as typeof payload
    } catch {
      throw new Error(response.ok ? "The server returned an invalid registration response." : `Registration failed (${response.status}).`)
    }
    if (!response.ok || (payload.status !== "success" && payload.success !== true)) {
      throw new Error(payload.message || "Registration could not be completed.")
    }
  },

  async requestPasswordReset(email: string, csrfToken: string) {
    const result = await request<{ success: boolean; message?: string }>("/php/send_password_reset.php", {
      method: "POST",
      body: toForm({ email, csrf_token: csrfToken }),
    })
    if (!result.success) throw new Error(result.message || "Could not request a password reset.")
  },

  async logoutStudent() {
    const response = await fetch(`${API_BASE_URL}/php/logout.php`, {
      credentials: "include",
      headers: { Accept: "text/html, application/json" },
    })
    if (!response.ok) throw new Error(`Could not sign out (${response.status}).`)
  },

  async getStudent() {
    const result = await request<StudentResponse>("/php/get_student.php")
    const profile = result.student || (result.student_id ? result as StudentProfile : null)
    if (!profile) throw new Error(result.message || "The server did not return a student profile.")
    return profile
  },

  async getMyAttendance() {
    const result = await request<{
      status: string
      message?: string
      attendance?: StudentAttendanceRecord[]
      nstp_attendance?: StudentNstpAttendanceRecord[]
    }>("/php/api/my_attendance.php")
    if (
      result.status !== "success" ||
      !Array.isArray(result.attendance) ||
      !Array.isArray(result.nstp_attendance)
    ) {
      throw new Error(result.message || "Could not load attendance records.")
    }
    return { attendance: result.attendance, nstpAttendance: result.nstp_attendance }
  },

  async getNstpRecord(attendanceId: number) {
    const result = await request<{ success: boolean; message?: string; record?: NstpRecord }>(
      `/php/api/nstp_record.php?att_id=${encodeURIComponent(String(attendanceId))}`,
    )
    if (!result.success || !result.record) throw new Error(result.message || "Could not load NSTP attendance.")
    return result.record
  },

  async submitNstpEvaluation(attendanceId: number, values: Record<string, string>, csrfToken: string) {
    const result = await request<{ success: boolean; message?: string }>("/php/submit_nstp_evaluation.php", {
      method: "POST",
      body: toForm({ ...values, nstp_attendance_id: attendanceId, csrf_token: csrfToken }),
    })
    if (!result.success) throw new Error(result.message || "Could not submit NSTP evaluation.")
    return result
  },

  async markNstpCertificateIssued(attendanceId: number, csrfToken: string) {
    const result = await request<{ success: boolean; message?: string }>("/php/mark_nstp_certificate_issued.php", {
      method: "POST",
      body: toForm({ nstp_attendance_id: attendanceId, csrf_token: csrfToken }),
    })
    if (!result.success) throw new Error(result.message || "Could not update certificate status.")
    return result
  },

  async getNotifications() {
    const result = await request<{ success: boolean; notifications?: StudentNotification[]; message?: string }>(
      "/php/get_notifications.php",
    )
    if (!result.success || !Array.isArray(result.notifications)) {
      throw new Error(result.message || "Could not load notifications.")
    }
    return result.notifications
  },

  async markNotificationRead(id?: number) {
    const result = await request<{ success: boolean; message?: string }>("/php/mark_notification_read.php", {
      method: "POST",
      body: toForm(id === undefined ? { all: 1 } : { id }),
    })
    if (!result.success) throw new Error(result.message || "Could not update notifications.")
  },

  async getConfessions() {
    const result = await request<{ status: string; message?: string; confessions?: StudentConfession[] }>(
      "/php/get_confessions.php",
    )
    if (result.status !== "success" || !Array.isArray(result.confessions)) {
      throw new Error(result.message || "Could not load confessions.")
    }
    return result.confessions
  },

  async submitConfession(content: string, category: string, isAnonymous: boolean, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/php/submit_confession.php", {
      method: "POST",
      body: toForm({ content, category, is_anonymous: isAnonymous ? 1 : 0, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not submit confession.")
  },

  async reactToConfession(id: number, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>(
      "/php/react_confession.php",
      { method: "POST", body: toForm({ confession_id: id, csrf_token: csrfToken }) },
    )
    if (result.status !== "success") throw new Error(result.message || "Could not react to confession.")
  },

  async getElections() {
    const result = await request<{ status: string; message?: string; elections?: StudentElection[] }>(
      "/php/get_elections.php",
    )
    if (result.status !== "success" || !Array.isArray(result.elections)) {
      throw new Error(result.message || "Could not load elections.")
    }
    return result.elections
  },

  async submitVote(electionId: number, candidateId: number, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/php/submit_vote.php", {
      method: "POST",
      body: toForm({ election_id: electionId, candidate_id: candidateId, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not submit vote.")
  },

  async getPayments() {
    const result = await request<{
      status: string
      message?: string
      payment_history?: StudentPayment[]
      events?: { slug: string; event_name: string }[]
      aurora_night?: { event_name?: string }
    }>("/php/get_payment_status.php")
    if (result.status !== "success" || !Array.isArray(result.payment_history)) {
      throw new Error(result.message || "Could not load payment history.")
    }
    const eventNames = new Map((result.events || []).map((event) => [event.slug, event.event_name]))
    if (result.aurora_night?.event_name) eventNames.set("aurora_night_2026", result.aurora_night.event_name)
    return result.payment_history.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      description: eventNames.get(payment.fee_type) || "CSSG Membership",
      receiptNumber: payment.receipt?.receipt_number || null,
    }))
  },

  async getQRQuest() {
    const [collection, leaderboard] = await Promise.all([
      request<{ success: boolean; message?: string; total?: number; collection?: QRQuestEntry[] }>(
        "/php/qr_quest_my_collection.php",
      ),
      request<{ success: boolean; message?: string; leaderboard?: QRQuestLeaderboardEntry[] }>(
        "/php/qr_quest_leaderboard_json.php",
      ),
    ])
    if (!collection.success) throw new Error(collection.message || "Could not load QR Quest collection.")
    if (!leaderboard.success) throw new Error(leaderboard.message || "Could not load the QR Quest leaderboard.")
    return {
      collection: collection.collection || [],
      total: collection.total || 0,
      leaderboard: leaderboard.leaderboard || [],
    }
  },

  async scanQRQuestStudent(studentId: string, csrfToken: string) {
    const result = await request<{
      success: boolean
      message?: string
      student_name?: string
      total_count?: number
    }>("/php/qr_quest_scan.php", {
      method: "POST",
      body: toForm({ scanned_id: studentId, csrf_token: csrfToken }),
    })
    if (!result.success) throw new Error(result.message || "Could not add this student to your collection.")
    return result
  },

  async changeStudentPassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    csrfToken: string,
  ) {
    const result = await request<{ status: string; message?: string }>("/php/changepass.php", {
      method: "POST",
      body: toForm({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
        csrf_token: csrfToken,
      }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not update your password.")
    return result.message || "Password updated successfully."
  },

  async sendStudentSupportRequest(subject: string, message: string, csrfToken: string) {
    const result = await request<{ status: string; message?: string }>("/php/support.php", {
      method: "POST",
      body: toForm({ subject, message, csrf_token: csrfToken }),
    })
    if (result.status !== "success") throw new Error(result.message || "Could not send support request.")
    return result.message || "Support request sent."
  },

  async getPurchases() {
    const result = await request<{
      status: string
      message?: string
      sales?: StudentPurchase[]
      total_spent?: number
    }>("/admin/php/pos_api.php?action=history")
    if (result.status !== "success") throw new Error(result.message || "Could not load purchases.")
    return { sales: result.sales || [], totalSpent: Number(result.total_spent || 0) }
  },

  async getPurchaseReceipt(saleId: number) {
    const result = await request<{ status: string; message?: string; sale?: StudentPurchase }>(
      `/admin/php/pos_api.php?action=receipt&sale_id=${saleId}`,
    )
    if (result.status !== "success" || !result.sale) {
      throw new Error(result.message || "Could not load receipt.")
    }
    return result.sale
  },

  recordAttendance(eventCode: string, csrfToken: string) {
    return request<AttendanceResponse>("/php/record_attendance.php", {
      method: "POST",
      body: toForm({ event_code: eventCode, csrf_token: csrfToken }),
    })
  },

  regenerateQR(csrfToken: string) {
    return request<AttendanceResponse>("/php/regenerate_qr.php", {
      method: "POST",
      body: toForm({ action: "regenerate_qr", csrf_token: csrfToken }),
    })
  },
}
