import { Stack } from "expo-router"
import { AdminProvider } from "@/contexts/AdminContext"

export default function AdminRootLayout() {
  return (
    <AdminProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AdminProvider>
  )
}
