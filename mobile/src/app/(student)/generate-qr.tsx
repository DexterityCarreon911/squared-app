import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { useState } from "react"
import { colors } from "@/theme"

export default function GenerateQrScreen() {
  const [content, setContent] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [error, setError] = useState("")
  const imageUrl = generatedContent
    ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(generatedContent)}`
    : ""

  const generate = () => {
    const value = content.trim()
    if (!value) return
    setError("")
    setGeneratedContent(value)
  }

  const openImage = async () => {
    if (!imageUrl) return
    try {
      await Linking.openURL(imageUrl)
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Could not open the generated QR image.")
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.page}>
      <Text style={styles.heading}>Generate QR code</Text>
      <Text style={styles.subtitle}>Create a QR code for text, links, or event codes.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>CONTENT</Text>
        <TextInput
          autoCapitalize="sentences"
          autoCorrect={false}
          multiline
          onChangeText={setContent}
          onSubmitEditing={generate}
          placeholder="Enter text, URL, or event code"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          value={content}
        />
        <Pressable accessibilityRole="button" disabled={!content.trim()} onPress={generate} style={[styles.button, !content.trim() && styles.disabled]}>
          <Text style={styles.buttonText}>Generate QR code</Text>
        </Pressable>
        <Text style={styles.privacy}>QR content is sent to QRServer to create the image. Do not encode private or sensitive information.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
      {imageUrl ? (
        <View style={styles.card}>
          <Image onError={() => setError("The QR image could not be loaded. Please check your connection and try again.")} resizeMode="contain" source={{ uri: imageUrl }} style={styles.qr} />
          <Text selectable style={styles.encoded}>{generatedContent}</Text>
          <Pressable accessibilityRole="button" onPress={() => void openImage()} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Open image to save or share</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => { setContent(""); setGeneratedContent(""); setError("") }} style={styles.newButton}>
            <Text style={styles.newText}>Create another</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 36, paddingTop: 28 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  card: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 18 },
  label: { alignSelf: "stretch", color: colors.text, fontSize: 11, fontWeight: "900" },
  input: { alignSelf: "stretch", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginTop: 8, minHeight: 82, padding: 12, textAlignVertical: "top" },
  button: { alignItems: "center", alignSelf: "stretch", backgroundColor: colors.primary, borderRadius: 10, marginTop: 12, padding: 13 },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  privacy: { alignSelf: "stretch", color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 12 },
  qr: { height: 250, width: 250 },
  encoded: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 12, textAlign: "center" },
  secondaryButton: { alignItems: "center", alignSelf: "stretch", backgroundColor: "#0f172a", borderRadius: 10, marginTop: 14, padding: 12 },
  secondaryText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  newButton: { alignItems: "center", alignSelf: "stretch", borderColor: colors.border, borderRadius: 10, borderWidth: 1, marginTop: 8, padding: 12 },
  newText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  error: { alignSelf: "stretch", backgroundColor: "#fff1f0", borderRadius: 9, color: colors.danger, lineHeight: 19, marginTop: 10, overflow: "hidden", padding: 10 },
})
