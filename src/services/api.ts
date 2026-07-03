const API_BASE = import.meta.env.VITE_API_URL || ""

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      ...options?.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Request failed")
  return data
}

function toForm(body: Record<string, string | number | boolean>) {
  const params = new URLSearchParams()
  for (const [key, val] of Object.entries(body)) {
    params.set(key, String(val))
  }
  return params.toString()
}

export const api = {
  // Auth
  login: (student_id: string, password: string, csrf_token: string) =>
    request<{ status: string; message: string }>("/php/login.php", {
      method: "POST",
      body: toForm({ student_id, password, csrf_token }),
    }),

  adminLogin: (username: string, password: string, csrf_token: string) =>
    request<{ success: boolean; message: string; redirect?: string }>("/admin/php/login.php", {
      method: "POST",
      body: toForm({ username, password, csrf_token }),
    }),

  // Session
  getSession: () =>
    request<{ show_modal: boolean; message?: string; type?: string }>("/php/session.php"),

  // Confessions
  getConfessions: (page = 1, limit = 12) =>
    request<{ confessions: any[]; pagination: any }>(
      `/confession/fetch_confessions.php?page=${page}&limit=${limit}`
    ),

  submitConfession: (content: string, category: string, csrf_token: string) =>
    request<{ success: boolean; message: string }>("/confession/submit_confession.php", {
      method: "POST",
      body: toForm({ content, category, csrf_token }),
    }),

  reactConfession: (confession_id: number, reaction_type: string, csrf_token: string) =>
    request<{ success: boolean }>("/confession/react_confession.php", {
      method: "POST",
      body: toForm({ confession_id, reaction_type, csrf_token }),
    }),

  reportConfession: (confession_id: number, reason: string, csrf_token: string) =>
    request<{ success: boolean }>("/confession/report_confession.php", {
      method: "POST",
      body: toForm({ confession_id, reason, csrf_token }),
    }),

  // Attendance
  recordAttendance: (
    event_id: number,
    scanner_id: number,
    student_id: string,
    csrf_token: string
  ) =>
    request<{ success: boolean; message: string }>("/php/record_attendance.php", {
      method: "POST",
      body: toForm({ event_id, scanner_id, student_id, csrf_token }),
    }),

  // Profile
  updateProfile: (data: Record<string, string>, csrf_token: string) =>
    request<{ success: boolean; message: string }>("/php/update.php", {
      method: "POST",
      body: toForm({ ...data, csrf_token }),
    }),

  changePassword: (
    current_password: string,
    new_password: string,
    confirm_password: string,
    csrf_token: string
  ) =>
    request<{ success: boolean; message: string }>("/php/changepass.php", {
      method: "POST",
      body: toForm({ current_password, new_password, confirm_password, csrf_token }),
    }),

  // Voting
  submitVote: (award: string, nominee_id: number, csrf_token: string) =>
    request<{ success: boolean }>("/pca_vote.php", {
      method: "POST",
      body: toForm({ award, nominee_id, csrf_token }),
    }),
}
