import { Stack } from "expo-router"
import { PrefectProvider } from "@/contexts/PrefectContext"

export default function PrefectRootLayout() {
  return (
    <PrefectProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PrefectProvider>
  )
}
