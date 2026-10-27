import { Redirect, router } from "expo-router"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { useAuth } from "@/contexts/useAuth"
import { colors } from "@/theme"

export default function IndexScreen() {
  const { student, authLoading, authError, refreshAuth } = useAuth()

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Checking your Squared session...</Text>
      </View>
    )
  }

  if (student) return <Redirect href="/(student)" />

  if (authError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Can’t reach Squared</Text>
        <Text style={styles.message}>{authError}</Text>
        <Pressable style={styles.button} onPress={() => void refreshAuth()}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Continue to sign in</Text>
        </Pressable>
      </View>
    )
  }

  return <Redirect href="/welcome" />
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: colors.background,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", textAlign: "center" },
  message: { color: colors.muted, marginTop: 12, textAlign: "center", lineHeight: 22 },
  button: {
    marginTop: 22,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  link: { color: colors.primary, fontWeight: "600", marginTop: 20 },
})
