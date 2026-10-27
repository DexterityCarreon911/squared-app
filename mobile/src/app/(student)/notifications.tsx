import { useCallback, useEffect, useMemo, useState } from "react"
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { api, type StudentNotification } from "@/services/api"
import { colors } from "@/theme"

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  const loadNotifications = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      setNotifications(await api.getNotifications())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load notifications.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getNotifications()
      .then((result) => {
        if (active) setNotifications(result)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load notifications.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  )

  const markRead = async (id?: number) => {
    setUpdating(true)
    setError("")
    try {
      await api.markNotificationRead(id)
      setNotifications((current) => current.map((notification) =>
        id === undefined || notification.id === id ? { ...notification, is_read: true } : notification,
      ))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update notifications.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadNotifications(true)} tintColor={colors.primary} />}
      style={styles.page}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.subtitle}>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable accessibilityRole="button" disabled={updating} onPress={() => void markRead()} style={styles.markAll}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.card}><Text style={styles.muted}>Loading notifications...</Text></View>
      ) : notifications.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No notifications</Text>
          <Text style={styles.muted}>New event, announcement, and payment updates will appear here.</Text>
        </View>
      ) : notifications.map((notification) => (
        <View key={notification.id} style={[styles.card, !notification.is_read && styles.unread]}>
          <View style={styles.cardHeader}>
            <Text style={styles.type}>{notification.type}</Text>
            {!notification.is_read ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Mark ${notification.title} as read`}
                disabled={updating}
                onPress={() => void markRead(notification.id)}
              >
                <Text style={styles.markRead}>Mark read</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.cardTitle}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
          <Text style={styles.time}>{notification.time_ago}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 5 },
  markAll: { borderColor: colors.primary, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  markAllText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 },
  unread: { borderLeftColor: colors.primary, borderLeftWidth: 4 },
  cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  type: { color: colors.primary, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  markRead: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 9 },
  message: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  time: { color: colors.placeholder, fontSize: 12, marginTop: 10 },
  muted: { color: colors.muted, lineHeight: 20, marginTop: 6 },
  error: { backgroundColor: "#fff1f0", borderRadius: 10, color: colors.danger, lineHeight: 20, marginBottom: 14, overflow: "hidden", padding: 12 },
})
