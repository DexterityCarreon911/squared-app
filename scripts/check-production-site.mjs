const configuredUrl = process.env.CAPACITOR_SERVER_URL || "https://squared-qr.online/"
let productionUrl

try {
  productionUrl = new URL(configuredUrl)
} catch {
  console.error(`Invalid CAPACITOR_SERVER_URL: ${configuredUrl}`)
  process.exit(1)
}

if (productionUrl.protocol !== "https:") {
  console.error("The Android app requires an HTTPS production URL.")
  process.exit(1)
}

try {
  const response = await fetch(productionUrl, {
    headers: { Accept: "text/html" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  })
  const contentType = response.headers.get("content-type") || ""
  const html = await response.text()

  if (!response.ok || !contentType.includes("text/html")) {
    throw new Error(`Expected an HTML page; server returned HTTP ${response.status}.`)
  }
  if (new URL(response.url).origin !== productionUrl.origin) {
    throw new Error(`The site redirected to a different origin: ${response.url}`)
  }
  if (!html.includes('name="squared-application" content="enterprise"')) {
    throw new Error("This URL does not serve the deployed Squared Enterprise frontend.")
  }

  console.log(`Production site verified: ${response.url}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : "Could not verify the production site.")
  process.exit(1)
}
