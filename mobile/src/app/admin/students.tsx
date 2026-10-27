import { Redirect } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native"
import AdminNavigation from "@/components/AdminNavigation"
import { useAdmin } from "@/contexts/AdminContext"
import { api, type AdminStudent } from "@/services/api"
import { avatars, programs } from "@/constants/academic"
import { colors } from "@/theme"

export default function AdminStudentsScreen() {
  const { admin, csrfToken, loading: authLoading } = useAdmin()
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"student_id" | "last_name">("student_id")
  const [sortDescending, setSortDescending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [editing, setEditing] = useState<AdminStudent | null>(null)
  const [saving, setSaving] = useState(false)
  const [edit, setEdit] = useState({
    first_name: "", middle_name: "", last_name: "", suffix: "", sex: "", program: "", course: "", email: "", avatar: "JOY", is_pwd: false,
    new_password: "", confirm_password: "",
  })

  useEffect(() => {
    if (!admin) return
    let active = true
    api.getAdminStudents()
      .then((result) => { if (active) setStudents(result) })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load students.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = !query ? students : students.filter((student) =>
      `${student.student_id} ${student.first_name} ${student.middle_name} ${student.last_name} ${student.course} ${student.email}`
        .toLowerCase()
        .includes(query),
    )
    return [...matching].sort((left, right) => {
      const result = left[sortBy].localeCompare(right[sortBy], undefined, { numeric: true, sensitivity: "base" })
      return sortDescending ? -result : result
    })
  }, [students, search, sortBy, sortDescending])

  const toggleSort = (field: "student_id" | "last_name") => {
    if (field === sortBy) setSortDescending((current) => !current)
    else {
      setSortBy(field)
      setSortDescending(false)
    }
  }

  const beginEdit = (student: AdminStudent) => {
    setEditing(student)
    setEdit({
      first_name: student.first_name, middle_name: student.middle_name || "", last_name: student.last_name,
      suffix: student.suffix || "", sex: student.sex, program: student.program, course: student.course,
      email: student.email, avatar: student.avatar || "JOY", is_pwd: student.is_pwd === 1,
      new_password: "", confirm_password: "",
    })
    setError("")
    setNotice("")
  }

  const saveStudent = async () => {
    if (!editing || saving) return
    setSaving(true); setError(""); setNotice("")
    try {
      const result = await api.updateAdminStudent({
        student_id: editing.student_id, ...edit, is_pwd: edit.is_pwd ? 1 : 0,
      }, csrfToken)
      setStudents((current) => current.map((item) => item.student_id === editing.student_id ? {
        ...item,
        first_name: edit.first_name,
        middle_name: edit.middle_name,
        last_name: edit.last_name,
        suffix: edit.suffix,
        sex: edit.sex,
        program: edit.program,
        course: edit.course,
        email: edit.email,
        avatar: edit.avatar,
        is_pwd: edit.is_pwd ? 1 : 0,
      } : item))
      setEdit((current) => ({ ...current, new_password: "", confirm_password: "" }))
      setNotice(result.message || "Student profile updated.")
      setEditing(null)
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not update student.") }
    finally { setSaving(false) }
  }

  const confirmDelete = (student: AdminStudent) => Alert.alert("Delete student record?", `Permanently delete ${student.first_name} ${student.last_name} (${student.student_id})?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => {
      setSaving(true); setError(""); setNotice("")
      void api.deleteAdminStudent(student.student_id, csrfToken)
        .then((result) => {
          setStudents((current) => current.filter((item) => item.student_id !== student.student_id))
          setNotice(result.message || "Student deleted.")
        })
        .catch((deleteError: unknown) => setError(deleteError instanceof Error ? deleteError.message : "Could not delete student."))
        .finally(() => setSaving(false))
    } },
  ])

  const setEditField = (key: keyof typeof edit, value: string | boolean) => setEdit((current) => ({ ...current, [key]: value }))
  const selectedProgram = programs.find((program) => program.code === edit.program)

  if (authLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
  if (!admin) return <Redirect href="/admin/login" />

  return (
    <View style={styles.page}>
      <AdminNavigation />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Students</Text>
        <Text style={styles.subtitle}>Search student account and enrollment details.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {notice ? <Text accessibilityRole="status" style={styles.notice}>{notice}</Text> : null}
        {editing ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit {editing.student_id}</Text>
            {([
              ["first_name", "First name"], ["middle_name", "Middle name"], ["last_name", "Last name"],
              ["suffix", "Suffix"], ["email", "Email"],
            ] as const).map(([key, label]) => <TextInput key={key} autoCapitalize={key === "email" ? "none" : "words"} onChangeText={(value) => setEditField(key, value)} placeholder={label} placeholderTextColor={colors.placeholder} style={styles.input} value={edit[key]} />)}
            <Text style={styles.label}>Program</Text>
            <View style={styles.sexRow}>{programs.map((program) => <Pressable key={program.code} onPress={() => setEdit((current) => ({
              ...current,
              program: program.code,
              course: program.courses.some((course) => course === current.course) ? current.course : "",
            }))} style={[styles.secondary, edit.program === program.code && styles.selected]}><Text style={styles.secondaryText}>{program.code}</Text></Pressable>)}</View>
            <Text style={styles.label}>Course</Text>
            <View style={styles.choiceList}>{(selectedProgram?.courses || []).map((course) => <Pressable key={course} onPress={() => setEditField("course", course)} style={[styles.choice, edit.course === course && styles.selectedChoice]}><Text style={styles.secondaryText}>{course}</Text></Pressable>)}</View>
            <Text style={styles.label}>Avatar</Text>
            <View style={styles.sexRow}>{avatars.map((avatar) => <Pressable key={avatar} onPress={() => setEditField("avatar", avatar)} style={[styles.secondary, edit.avatar === avatar && styles.selected]}><Text style={styles.secondaryText}>{avatar}</Text></Pressable>)}</View>
            <View style={styles.switchRow}><Text style={styles.muted}>Sex: {edit.sex}</Text><View style={styles.sexRow}><Pressable onPress={() => setEditField("sex", "Female")} style={[styles.secondary, edit.sex === "Female" && styles.selected]}><Text style={styles.secondaryText}>Female</Text></Pressable><Pressable onPress={() => setEditField("sex", "Male")} style={[styles.secondary, edit.sex === "Male" && styles.selected]}><Text style={styles.secondaryText}>Male</Text></Pressable></View></View>
            <View style={styles.switchRow}><Text style={styles.muted}>PWD status</Text><Switch value={edit.is_pwd} onValueChange={(value) => setEditField("is_pwd", value)} trackColor={{ true: colors.primary }} /></View>
            <Text style={styles.label}>Optional new password (8+ characters, number and symbol)</Text>
            <TextInput autoCapitalize="none" onChangeText={(value) => setEditField("new_password", value)} placeholder="New password" placeholderTextColor={colors.placeholder} secureTextEntry style={styles.input} value={edit.new_password} />
            <TextInput autoCapitalize="none" onChangeText={(value) => setEditField("confirm_password", value)} placeholder="Confirm new password" placeholderTextColor={colors.placeholder} secureTextEntry style={styles.input} value={edit.confirm_password} />
            <View style={styles.sexRow}><Pressable disabled={saving} onPress={() => void saveStudent()} style={styles.button}><Text style={styles.buttonText}>{saving ? "Saving…" : "Save profile"}</Text></Pressable><Pressable onPress={() => setEditing(null)} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable></View>
          </View>
        ) : null}
        <TextInput onChangeText={setSearch} placeholder="Search by ID, name, course, or email" placeholderTextColor={colors.placeholder} style={styles.input} value={search} />
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by</Text>
          <Pressable accessibilityRole="button" onPress={() => toggleSort("student_id")} style={[styles.sortButton, sortBy === "student_id" && styles.selectedSort]}>
            <Text style={[styles.sortText, sortBy === "student_id" && styles.selectedSortText]}>Student ID {sortBy === "student_id" ? sortDescending ? "↓" : "↑" : ""}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => toggleSort("last_name")} style={[styles.sortButton, sortBy === "last_name" && styles.selectedSort]}>
            <Text style={[styles.sortText, sortBy === "last_name" && styles.selectedSortText]}>Name {sortBy === "last_name" ? sortDescending ? "↓" : "↑" : ""}</Text>
          </Pressable>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : filtered.length === 0 ? (
          <View style={styles.card}><Text style={styles.muted}>No students found.</Text></View>
        ) : filtered.map((student) => (
          <View key={student.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{student.first_name} {student.middle_name ? `${student.middle_name} ` : ""}{student.last_name}{student.suffix ? `, ${student.suffix}` : ""}</Text>
              <Text style={[styles.status, student.status === "active" ? styles.active : styles.inactive]}>{student.status}</Text>
            </View>
            <Text style={styles.id}>{student.student_id}</Text>
            <Text style={styles.detail}>{student.program} · {student.course}</Text>
            <Text style={styles.muted}>{student.email} · {student.sex}</Text>
            <View style={styles.sexRow}><Pressable disabled={saving} onPress={() => beginEdit(student)} style={styles.secondary}><Text style={styles.secondaryText}>Edit record</Text></Pressable><Pressable disabled={saving} onPress={() => confirmDelete(student)} style={styles.delete}><Text style={styles.deleteText}>Delete</Text></Pressable></View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  center: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 6 },
  input: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, marginBottom: 14, marginTop: 14, paddingHorizontal: 12, paddingVertical: 12 },
  sortRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
  sortLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  sortButton: { borderColor: colors.border, borderRadius: 9, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  selectedSort: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  selectedSortText: { color: "#fff" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginBottom: 9, padding: 14 },
  row: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  cardTitle: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "800" },
  label: { color: colors.text, fontSize: 11, fontWeight: "800", marginTop: 10 },
  choiceList: { gap: 7, marginTop: 7 },
  choice: { borderColor: colors.border, borderRadius: 9, borderWidth: 1, padding: 9 },
  selectedChoice: { backgroundColor: "#f0f8f0", borderColor: colors.primary },
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  sexRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9 },
  button: { backgroundColor: colors.primary, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  secondary: { backgroundColor: "#f1f7f1", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  selected: { backgroundColor: "#dff0df" },
  secondaryText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  delete: { backgroundColor: "#fff1f0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  deleteText: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  notice: { backgroundColor: "#eaf7eb", borderRadius: 10, color: colors.primary, lineHeight: 20, marginTop: 10, padding: 12 },
  id: { color: colors.primary, fontSize: 12, fontWeight: "800", marginTop: 7 },
  detail: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 5 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  status: { borderRadius: 10, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, textTransform: "capitalize" },
  active: { backgroundColor: "#e8f5e9", color: colors.primary },
  inactive: { backgroundColor: "#edf0ed", color: colors.muted },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 12, overflow: "hidden", padding: 12 },
})
