# Squared Enterprise

React/Vite frontend for Squared, backed by the existing same-origin PHP application.

## Requirements

- Node.js 20.19+ (Node.js 22+ recommended)
- npm
- Android Studio with an Android SDK to build Android packages
- PHP backend and database deployed alongside the frontend

## Web production build

```sh
npm ci
npm run lint
npm run build
```

Deploy the contents of `dist/` to the document root at `https://squared-qr.online/`.
Keep the legacy PHP endpoints available at their existing root paths (`/php`,
`/admin/php`, `/instructor/php`, and `/prefect_admin/php`). Configure the web
server to serve `index.html` for frontend routes while allowing real PHP files
to execute normally. Do not route missing API/PHP requests to the SPA fallback.

Use HTTPS in production. Configure the web server to serve the hashed files in
`/assets/` with long-lived immutable caching, and `index.html`, `sw.js`, and
`manifest.json` with revalidation/no-cache headers so clients receive releases.
Never deploy `.env` files, database secrets, signing keys, or development source
maps to the public document root.

Before production, rotate any previously published Prefect default credentials.
The default login is disabled and new accounts are not auto-created. Provision
or reset a Prefect administrator from the PHP CLI on the backend host:

```sh
read -s -p "New Prefect password: " PREFECT_ADMIN_PASSWORD
export PREFECT_ADMIN_PASSWORD
cd /path/to/squared-old
php prefect_admin/cli/provision_admin.php prefect-admin "Prefect Administrator"
unset PREFECT_ADMIN_PASSWORD
```

## Android APK (hosted web app)

The Android app is a Capacitor wrapper that opens the hosted Enterprise site.
This keeps the legacy PHP session and API paths same-origin and avoids bundling
PHP in the APK. The app requires an internet connection; publish the Enterprise
frontend and PHP backend at the configured origin before distributing an APK.

The production URL and Android application ID are configured in
`capacitor.config.ts`. The current values are `https://squared-qr.online/` and
`com.squared.qr`. Finalize the application ID before publishing; changing it
later creates a different Android app. The APK task checks for the Enterprise
deployment marker at the configured URL and stops if the URL still serves the
legacy site or an error page.

1. Install Android Studio and its Android SDK. Set `ANDROID_HOME` (or
   `ANDROID_SDK_ROOT`) if the SDK is not in its default location.
2. Install project dependencies and generate the Android project:

   ```sh
   npm ci
   npm run android:add
   ```

   Run `npm run android:add` only once. The generated `android/` project should
   be kept in version control.
3. Build and synchronize the frontend and native project:

   ```sh
   npm run android:sync
   ```

4. Open Android Studio:

   ```sh
   npm run android:open
   ```

   In Android Studio, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   The debug APK is output under `android/app/build/outputs/apk/debug/`.

On Windows, after Android Studio/SDK setup, the debug build can also be run with:

```sh
npm run android:apk:debug
```

Before an APK build, deploy the production frontend and verify it with
`npm run check:production`. To build against a separate HTTPS staging site,
set `CAPACITOR_SERVER_URL` for both the check and Capacitor commands.

For a store release, use Android Studio's signed APK/AAB flow with a private
release keystore. Back up the keystore securely and never commit it. Install and
test the signed release on physical devices before distribution. Debug APKs are
for testing only.

## Notes

- QR camera access requires HTTPS, browser/WebView support, and granted camera
  permission. Screens include manual student-ID entry as a fallback.
- The APK is a web wrapper, not an offline native rewrite. PHP-backed workflows
  require the production server to be available.
- Ensure a privacy policy is published and complete store data-safety
  disclosures before Play Store submission.
- Test login/session persistence, registration, payments, receipts, attendance,
  QR scanning, and deep frontend routes on-device before release.
