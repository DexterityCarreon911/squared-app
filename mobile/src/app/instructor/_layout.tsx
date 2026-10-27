import { Stack } from "expo-router"
import { InstructorProvider } from "@/contexts/InstructorContext"
import { StatusBar } from "expo-status-bar"

export default function InstructorRootLayout() {
  return (
    <InstructorProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </InstructorProvider>
  )
}
