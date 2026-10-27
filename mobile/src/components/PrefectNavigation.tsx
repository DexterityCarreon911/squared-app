import { Link, router } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { usePrefect } from "@/contexts/PrefectContext"

const links = [
  { href: "/prefect/incidents", label: "Incidents" },
  { href: "/prefect/students", label: "Students" },
  { href: "/prefect/violations", label: "Violations" },
  { href: "/prefect/reports", label: "Reports" },
]

export default function PrefectNavigation() {
  const { user, logout } = usePrefect()
  const [error, setError] = useState("")

  const signOut = async () => {
    setError("")
    try {
      await logout()
      router.replace("/prefect/login")
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Could not sign out.")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>PREFECT OF DISCIPLINE</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => void signOut()}><Text style={styles.signOut}>Sign out</Text></Pressable>
      </View>
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
  container: { backgroundColor: "#f8fafc", borderBottomColor: "#e2e8f0", borderBottomWidth: 1, paddingTop: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18 },
  identity: { flex: 1 },
  eyebrow: { color: "#92400e", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  name: { color: "#0f172a", fontSize: 16, fontWeight: "800", marginTop: 4 },
  signOut: { color: "#475569", fontSize: 12, fontWeight: "800", padding: 8 },
  links: { gap: 8, paddingHorizontal: 18, paddingVertical: 12 },
  link: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: 9, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  linkText: { color: "#334155", fontSize: 12, fontWeight: "700" },
  error: { color: "#b42318", fontSize: 12, paddingHorizontal: 18, paddingTop: 5 },
})
