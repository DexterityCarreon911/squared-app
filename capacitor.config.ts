import type { CapacitorConfig } from "@capacitor/cli"

const productionUrl = process.env.CAPACITOR_SERVER_URL || "https://squared-qr.online/"
const productionHost = new URL(productionUrl).hostname

const config: CapacitorConfig = {
  appId: "com.squared.qr",
  appName: "Squared QR",
  webDir: "dist",
  backgroundColor: "#ffffff",
  server: {
    url: productionUrl,
    cleartext: false,
    allowNavigation: [productionHost],
  },
}

export default config
