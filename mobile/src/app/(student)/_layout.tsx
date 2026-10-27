import { Redirect, Tabs } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useAuth } from "@/contexts/useAuth"
import { colors } from "@/theme"

export default function StudentLayout() {
  const { student, authLoading } = useAuth()

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }
  if (!student) return <Redirect href="/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarStyle: { borderTopColor: colors.border, height: 64, paddingTop: 8, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="attendance" options={{ title: "Attendance", tabBarLabel: "Attendance" }} />
      <Tabs.Screen name="qr-card" options={{ title: "QR Card", tabBarLabel: "My QR" }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarLabel: "Account" }} />
      <Tabs.Screen name="attendance-record" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="confessions" options={{ href: null }} />
      <Tabs.Screen name="voting" options={{ href: null }} />
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="purchases" options={{ href: null }} />
      <Tabs.Screen name="qr-quest" options={{ href: null }} />
      <Tabs.Screen name="generate-qr" options={{ href: null }} />
      <Tabs.Screen name="nstp-evaluation" options={{ href: null }} />
      <Tabs.Screen name="nstp-certificate" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
})
