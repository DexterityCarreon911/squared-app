# Squared Enterprise

Squared Enterprise includes the existing React/Vite web frontend and an Expo/React Native Android app in `mobile/`. Both target the existing PHP backend.

## Requirements

- Node.js 20.19+ (Node.js 22+ recommended)
- npm
- An Expo account for cloud Android builds
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

## Native Android app (Expo / React Native)

The native app lives in `mobile/` and is built with Expo and React Native. It
uses EAS Build to produce APKs in the cloud, so Android Studio and a local
Android SDK are not required. The native app calls the PHP API at
`https://squared-qr.online` by default; set `EXPO_PUBLIC_API_URL` to use another
HTTPS backend.

The Android application ID is `com.squared.qr`. Choose the final ID before
publishing; changing it later creates a separate Android app.

```sh
cd mobile
npm ci
npx eas-cli@latest login
npx eas-cli@latest build:configure
npm run build:apk
```

The first build may ask you to create or link an EAS project and configure
Android signing credentials. The `preview` profile produces an installable APK.
For Play Store distribution, run `npm run build:aab` to create an Android App
Bundle. Keep signing credentials private and never commit them.

Run `npm start` in `mobile/` to launch Expo for development. A physical device
or Android emulator is needed to validate camera scanning, PHP session
persistence, and device-specific behavior.

The native conversion is in progress. The React Native app currently includes
a public welcome page with a rotating hero, live student counts, academic
programs, live announcements, and upcoming activities; student registration
and password reset, dashboard, attendance entry and history, QR
card and QR Quest, generic QR generation, NSTP evaluation and certificate
viewing/sharing/PDF export, notifications, confessions, voting, payment and
purchase history, password changes, support requests, and account sign-out.
Instructor sign-in, subjects, attendance scanning, student scanner
permissions, attendance history, filtered attendance reports with CSV export,
evaluations, and certificates are also available natively. Prefect sign-in,
incident search/filing/detail and case actions, student discipline records,
violation catalog management, and filtered discipline reports are also
available. Admin sign-in, dashboard with expandable program/course enrollment,
searchable/sortable student views and event create/edit/delete/status
management, announcement and PCA voting management, event evaluation form
builder, payment configuration, POS sales/receipts, and Aurora payment/check-in
workflows are available natively. Administrator workflows also include direct
PCA nominee image uploads, welcome-slider image management, QR Quest
registration/settings management with a confirmed clear-all operation, event
attendance scanning, scanner authorization, NSTP subject management,
payable-event configuration, payment
scanning, evaluation response review, student record actions, and Aurora
check-in reporting. Event attendance reporting includes status filters,
student search, pagination, and a full confirmed-attendance CSV export.
Aurora check-in reporting includes search, date filters, pagination, and a full
filtered CSV export. Filtered payment transaction history with full filtered
CSV export is also available from the administrator navigation.
Keep using the web app for workflows that still lack a functioning native
counterpart or a verified backend contract.

Native confession moderation and support replies use the JSON API contracts
in `squared-old/confession/admin.php` and
`squared-old/admin/php/support_api.php`; native support management includes
status filters, per-status counts, and status updates. Deploy those backend
files with the mobile app before using these administrator screens. Student
payment records are read from the existing membership payment tables through
`squared-old/admin/php/payments_api.php`. The web payment-creation control is
not functional and its displayed due-date fields do not exist in the checked-in
payment schema, so the native screen does not claim to create or modify fees.
Native event management uses `squared-old/admin/php/mobile_events_api.php`;
native PCA voting management uses
`squared-old/admin/php/mobile_voting_api.php`; membership and Aurora
configuration use `squared-old/admin/php/mobile_payment_settings_api.php`.
Evaluation form management uses
`squared-old/admin/php/mobile_evaluation_fields_api.php`; slider management
uses `squared-old/admin/php/mobile_slider_api.php`; QR Quest administration
uses `squared-old/admin/php/mobile_qr_quest_api.php`. PCA nominee image uploads
are handled by `squared-old/admin/php/mobile_voting_api.php`. Deploy these
endpoints with the mobile app. Administrator event scans use
`squared-old/admin/php/mobile_events_api.php` and require applying
`squared-old/admin/php/migrations/20261023_admin_event_scanner.sql` before
deploying the updated endpoint. Admin scans are recorded as pending until the
student completes the event evaluation.

The React web prototype's slider, QR Quest-management, evaluation-management,
and generic settings screens are still static/demo interactions. Native
evaluation, payment, slider, and QR Quest settings now use their corresponding
legacy PHP data contracts. New administrator tools use
`squared-old/admin/php/mobile_admin_tools_api.php`,
`mobile_student_management_api.php`, `mobile_evaluation_responses_api.php`,
and `mobile_aurora_report_api.php`; deploy them with the native app. Payment
processing and student lookup use the existing `/php` payment endpoints.
Payment transaction exports use `/php/export_transactions.php`, which now
accepts the same student search filter as the native report.
Event attendance reports and confirmed-attendee exports use the
`squared-old/admin/php/mobile_events_api.php` contract.
Aurora check-in report exports use
`squared-old/admin/php/mobile_aurora_report_api.php`.

## Notes

- PHP-backed workflows require network access to the production server.
- QR scanning uses the native camera and requires the user to grant camera
  permission.
- Ensure a privacy policy is published and complete store data-safety
  disclosures before Play Store submission.
- Test login/session persistence, registration, payments, receipts, attendance,
  QR scanning, and deep frontend routes on-device before release.
