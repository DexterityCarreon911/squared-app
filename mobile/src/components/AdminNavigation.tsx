import { Link, router } from "expo-router"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useState } from "react"
import { useAdmin } from "@/contexts/AdminContext"

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/scanner-authorizations", label: "Scanner permissions" },
  { href: "/admin/nstp-subjects", label: "NSTP subjects" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/event-scanner", label: "Event scanner" },
  { href: "/admin/event-attendance", label: "Event attendance report" },
  { href: "/admin/voting", label: "Voting" },
  { href: "/admin/slider", label: "Welcome slider" },
  { href: "/admin/qr-quest", label: "QR Quest" },
  { href: "/admin/evaluations", label: "Evaluations" },
  { href: "/admin/evaluation-responses", label: "Evaluation responses" },
  { href: "/admin/settings", label: "Payment settings" },
  { href: "/admin/payable-events", label: "Payable events" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/confessions", label: "Confessions" },
  { href: "/admin/payments", label: "Student payments" },
  { href: "/admin/payment-transactions", label: "Payment transactions" },
  { href: "/admin/payment-scanner", label: "Payment scanner" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/pos", label: "POS" },
  { href: "/admin/aurora-payments", label: "Aurora Payments" },
  { href: "/admin/aurora-checkin", label: "Aurora Check-in" },
  { href: "/admin/aurora-report", label: "Aurora report" },
]

export default function AdminNavigation() {
  const { admin, logout } = useAdmin()
  const [error, setError] = useState("")

  const signOut = async () => {
    setError("")
    try {
      await logout()
      router.replace("/admin/login")
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Could not sign out.")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>SQUARED ADMIN</Text>
        <Pressable accessibilityRole="button" onPress={() => void signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>
      <Text style={styles.username}>{admin?.username || "Administrator"}</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.links}>
        {links.map((item) => (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={styles.link}><Text style={styles.linkText}>{item.label}</Text></Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#0d5b11", paddingTop: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18 },
  brand: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1.2 },
  signOut: { color: "#fff", fontSize: 12, fontWeight: "800", padding: 8 },
  username: { color: "#d5f0d6", fontSize: 12, paddingHorizontal: 18, paddingTop: 5 },
  links: { gap: 8, paddingHorizontal: 18, paddingVertical: 12 },
  link: { backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  linkText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  error: { color: "#ffe0dd", fontSize: 12, paddingHorizontal: 18, paddingTop: 5 },
})
