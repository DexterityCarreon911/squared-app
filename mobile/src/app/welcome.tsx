import { Link } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Image, ImageBackground, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { API_BASE_URL, api, type PublicAnnouncement, type PublicEvent, type PublicStudentCounts } from "@/services/api"
import { colors } from "@/theme"

const heroSlides = [
  {
    image: "Cover.jpg",
    title: "DCC Squared — Fast, Secure & Reliable",
    subtitle: "The official student organization system of Davao Central College. QR attendance, payments, and student services.",
    description: "Experience the future of attendance management with our innovative QR scanning technology.",
  },
  {
    image: "Cover1.jpg",
    title: "Fast, Secure & Reliable",
    subtitle: "Track and manage attendance with ease using Squared's advanced QR scanning system. No more paperwork, no more hassle.",
    description: "",
  },
  {
    image: "Cover2.jpg",
    title: "Your Digital Campus Companion",
    subtitle: "Seamlessly manage your student life with Squared's comprehensive platform.",
    description: "From attendance tracking to event management, everything you need in one place.",
  },
]

const programs = [
  { code: "CBA", name: "College of Business Administration", image: "https://dcc.edu.ph/wp-content/uploads/2021/04/BA-WEB.png" },
  { code: "CELA", name: "College of Education and Liberal Arts", image: "https://dcc.edu.ph/wp-content/uploads/2021/04/CELA-WEB.png" },
  { code: "CJE", name: "Criminal Justice Education", image: "https://dcc.edu.ph/wp-content/uploads/2021/04/CJE-WEB.png" },
  { code: "HME", name: "Hospitality Management Education", image: "https://dcc.edu.ph/wp-content/uploads/2021/04/HM-LOGO-revised-2.0-768x765.png" },
  { code: "ITE", name: "Information Technology Education", image: "https://dcc.edu.ph/wp-content/uploads/2021/04/ITE-WEB.png" },
]

const avatars = [
  { name: "JOY", role: "The Optimist", image: "JOY.png", description: "Always cheerful and energetic, JOY brings positivity to every interaction. She represents the happy moments of campus life.", traits: ["Energetic", "Friendly", "Optimistic"], color: "#c2185b" },
  { name: "SEVI", role: "The Analyst", image: "SEVI.png", description: "Logical and detail-oriented, SEVI ensures everything runs smoothly. He's the brains behind efficient operations.", traits: ["Analytical", "Organized", "Precise"], color: "#1976d2" },
  { name: "SAMANTHA", role: "The Innovator", image: "SAMANTHA.png", description: "Creative and forward-thinking, SAMANTHA brings fresh ideas to the table. She represents innovation and progress.", traits: ["Creative", "Visionary", "Modern"], color: "#7b1fa2" },
  { name: "ZEKE", role: "The Guardian", image: "ZEKE.png", description: "Strong and reliable, ZEKE represents security and trust. He ensures every transaction and interaction is protected.", traits: ["Reliable", "Secure", "Strong"], color: "#f57c00" },
]

const platformFeatures = [
  ["Event Management", "Create, organize, and manage school events with ease. From seminars to sports meets, handle everything in one platform."],
  ["Secure Authentication", "Multi-layered security to keep student data safe and protected at all times."],
  ["Real-time Notifications", "Instant alerts for events, announcements, and important updates. Never miss what matters."],
  ["Analytics & Insights", "Track attendance patterns, event participation, and generate comprehensive reports for better decision-making."],
  ["Student Profiles", "Personalized dashboards for students to view their attendance records, upcoming events, and achievements."],
  ["Department Integration", "Support for multiple departments (CBA, CELA, CJE, HME, ITE) with tailored experiences for each."],
  ["Mobile-First PWA", "Install as a native app on any device. Download your personalized QR card for quick and easy scanning at events."],
  ["Squared Pay", "Scan-Pay-Go system for CSSG membership fee transactions with digital receipts and real-time tracking."],
]

const featureColors = ["#2AAD7A", "#5B46AE", "#F0931E", "#87A52B", "#C0395A", "#2AABAB", "#B09020", "#5B46AE"]
const featureSymbols = ["▦", "✓", "♢", "↗", "◎", "◉", "▣", "$"]
const aboutFeatures = [
  ["Scan QR Codes", "Quick and secure attendance tracking with instant QR code scanning technology."],
  ["View Analytics", "Comprehensive analytics and detailed attendance reports with real-time data."],
  ["Manage Users", "Efficiently manage users and their attendance records with advanced tools."],
]

const blueprintPillars = [
  ["Digital Governance & Smart Systems", "Establish efficient, paperless, technology-driven systems for student org operations.", "#3E9DD4"],
  ["Quality Assurance, Evaluation & Reporting", "Ensure consistent high standards and accountability in student events and activities.", "#87A52B"],
  ["Communications, Branding & Publications", "Establish professional and consistent branding for all Squared communications.", "#C4401C"],
  ["Creative Media & Cultural Production", "Amplify student voices and promote campus creativity through multimedia.", "#C0395A"],
  ["Research, Development & Innovation", "Apply research to guide continuous improvement and innovation.", "#2AAD7A"],
  ["Artificial Intelligence Integration", "Integrate AI responsibly to enhance organizational efficiency and learning.", "#5B46AE"],
  ["Student Development & Capacity Building", "Develop competent, ethical, and future-ready student leaders.", "#B09020"],
  ["Partnerships & Collaboration", "Strengthen collaborations with student organizations and institutional offices.", "#2AABAB"],
  ["Community Extension & Social Impact", "Expand Squared's impact to communities outside the campus.", "#C83020"],
  ["Sustainability & Green Operations", "Promote environmentally responsible and sustainable organizational practices.", "#3B9E40"],
  ["Financial Sustainability & Resource Mobilization", "Ensure Squared's financial independence and continuity.", "#F0931E"],
  ["Platform Development & Accessibility", "Ensure inclusive, accessible, and user-friendly digital platforms.", "#7B3FAE"],
]

const founders = [
  { name: "Roberto P. Tacbobo Jr.", role: "Founder · Visionary Leader", image: "roberto.png", description: "The innovative mind behind Squared QR, dedicated to transforming traditional campus processes into seamless digital experiences through cutting-edge technology solutions." },
  { name: "Charles S. Evangelio Jr.", role: "Co-Founder · Technical Lead & Developer", image: "charles.png", description: "Full-stack developer who architectured and built the Squared QR system from ground up, ensuring robust performance and exceptional user experience across all platforms." },
  { name: "Angel Pitch R. Geronggay", role: "Co-Founder · Creative Strategist", image: "pitch.png", description: "Creative director and strategic partner focused on user experience design and ensuring the platform meets the diverse needs of the DCC student community." },
]

function localDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function getEventStatus(event: PublicEvent) {
  const today = localDateString(new Date())
  if (event.event_date > today) return "Upcoming"
  if (event.event_date < today) return "Ended"
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [startHour, startMinute] = event.start_time.split(":").map(Number)
  const [endHour, endMinute] = event.end_time.split(":").map(Number)
  const start = startHour * 60 + startMinute
  const end = endHour * 60 + endMinute
  if (currentMinutes < start) return "Upcoming"
  if (currentMinutes <= end) return "Ongoing"
  return "Ended"
}

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <View style={styles.clockOverlay}>
      <Text style={styles.liveClock}>{time.toLocaleTimeString()}</Text>
    </View>
  )
}

export default function WelcomeScreen() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [announcement, setAnnouncement] = useState<PublicAnnouncement | null>(null)
  const [studentCounts, setStudentCounts] = useState<PublicStudentCounts | null>(null)
  const [countsError, setCountsError] = useState("")
  const [slideIndex, setSlideIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError("")
    const contentRequest = api.getPublicLandingContent()
      .then((content) => {
        setEvents(content.events)
        setAnnouncement(content.announcement)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load Squared updates.")
      })
    const countsRequest = api.getPublicStudentCounts()
      .then(setStudentCounts)
      .catch((loadError: unknown) => {
        setCountsError(loadError instanceof Error ? loadError.message : "Could not load student counts.")
      })
    try {
      await Promise.all([contentRequest, countsRequest])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getPublicLandingContent()
      .then((content) => {
        if (!active) return
        setEvents(content.events)
        setAnnouncement(content.announcement)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load Squared updates.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    api.getPublicStudentCounts()
      .then((result) => { if (active) setStudentCounts(result) })
      .catch((loadError: unknown) => {
        if (active) setCountsError(loadError instanceof Error ? loadError.message : "Could not load student counts.")
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
      style={styles.page}
    >
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Image accessibilityLabel="Squared logo" source={require("../../assets/images/squared-logo.png")} style={styles.navLogo} />
          <Text style={styles.navBrand}>Squared</Text>
        </View>
        <View style={styles.navActions}>
          <Link href="/login" asChild><Pressable style={styles.navLogin}><Text style={styles.navLoginText}>Login</Text></Pressable></Link>
          <Link href="/register" asChild><Pressable style={styles.navRegister}><Text style={styles.navRegisterText}>Register</Text></Pressable></Link>
        </View>
      </View>

      <ImageBackground
        imageStyle={styles.heroImage}
        source={{ uri: `${API_BASE_URL}/images/${heroSlides[slideIndex].image}` }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay}>
          <LiveClock />
          <Text style={styles.heading}>{heroSlides[slideIndex].title}</Text>
          <Text style={styles.subtitle}>{heroSlides[slideIndex].subtitle}</Text>
          {heroSlides[slideIndex].description ? <Text style={styles.heroDescription}>{heroSlides[slideIndex].description}</Text> : null}
          <View style={styles.actions}>
            <Link href="/register" asChild><Pressable style={styles.primaryButton}><Text style={styles.primaryButtonText}>Register Now!</Text></Pressable></Link>
            <Link href="/login" asChild><Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Login</Text></Pressable></Link>
          </View>
          <View style={styles.slideControls}>
            <Pressable accessibilityLabel="Previous welcome slide" accessibilityRole="button" onPress={() => setSlideIndex((current) => (current + heroSlides.length - 1) % heroSlides.length)} style={styles.slideArrow}><Text style={styles.slideArrowText}>‹</Text></Pressable>
            {heroSlides.map((slide, index) => (
              <Pressable accessibilityLabel={`Show slide ${index + 1}`} accessibilityRole="button" key={slide.image} onPress={() => setSlideIndex(index)} style={[styles.slideDot, index === slideIndex && styles.activeSlideDot]} />
            ))}
            <Pressable accessibilityLabel="Next welcome slide" accessibilityRole="button" onPress={() => setSlideIndex((current) => (current + 1) % heroSlides.length)} style={styles.slideArrow}><Text style={styles.slideArrowText}>›</Text></Pressable>
          </View>
        </View>
      </ImageBackground>

      <Text style={styles.sectionTitle}>Squared Community</Text>
      {countsError ? <View style={styles.card}><Text accessibilityRole="alert" style={styles.error}>{countsError}</Text></View> : studentCounts ? (
        <View style={styles.countsCard}>
          <Text style={styles.countNumber}>{studentCounts.total.toLocaleString()}</Text>
          <Text style={styles.countLabel}>REGISTERED STUDENTS</Text>
          <View style={styles.programCounts}>
            {programs.map((program) => (
              <View key={program.code} style={styles.programCount}>
                <Text style={styles.programCountNumber}>{(studentCounts.programs[program.code] || 0).toLocaleString()}</Text>
                <Text style={styles.programCode}>{program.code}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      {error ? (
        <View style={styles.card}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : events.length ? events.map((event, index) => (
        <View key={`${event.event_date}-${event.event_name}-${index}`} style={styles.card}>
          <View style={styles.eventHeading}>
            <Text style={styles.cardTitle}>{event.event_name}</Text>
            <Text style={[styles.status, getEventStatus(event) === "Ongoing" && styles.ongoingStatus]}>{getEventStatus(event)}</Text>
          </View>
          <Text style={styles.muted}>{formatDate(event.event_date)}</Text>
          <Text style={styles.body}>{formatTime(event.start_time)} – {formatTime(event.end_time)}</Text>
        </View>
      )) : <View style={styles.card}><Text style={styles.muted}>No upcoming activities are scheduled.</Text></View>}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Squared Avatars</Text>
        <Text style={styles.sectionIntro}>Meet the unique personalities that represent the spirit of Squared QR System.</Text>
      </View>
      {avatars.map((avatar) => (
        <View key={avatar.name} style={styles.avatarCard}>
          <Image accessibilityLabel={`${avatar.name} avatar`} source={{ uri: `${API_BASE_URL}/avatars/${avatar.image}` }} style={styles.avatarImage} />
          <View style={styles.avatarContent}>
            <Text style={[styles.avatarName, { color: avatar.color }]}>{avatar.name}</Text>
            <Text style={[styles.avatarRole, { color: avatar.color }]}>{avatar.role}</Text>
            <Text style={styles.body}>{avatar.description}</Text>
            <View style={styles.traits}>
              {avatar.traits.map((trait) => <Text key={trait} style={styles.traitTag}>{trait}</Text>)}
            </View>
          </View>
        </View>
      ))}

      <Image
        accessibilityLabel="Squared QR attendance system overview"
        resizeMode="contain"
        source={{ uri: `${API_BASE_URL}/images/Squared.png` }}
        style={styles.overviewImage}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Squared is More Than Attendance</Text>
        <Text style={styles.sectionIntro}>A comprehensive digital ecosystem empowering student organizations.</Text>
      </View>
      {platformFeatures.map(([title, description], index) => (
        <View key={title} style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: featureColors[index] }]}><Text style={styles.featureIconText}>{featureSymbols[index]}</Text></View>
          <Text style={styles.featureTitle}>{title}</Text>
          {index === 7 ? <Text style={styles.comingSoon}>COMING SOON</Text> : null}
          <Text style={styles.body}>{description}</Text>
        </View>
      ))}

      <View style={styles.missionCard}>
        <Text style={styles.missionTitle}>Building the Future of Student Organizations</Text>
        <Text style={styles.missionBody}>Squared is a digital transformation platform designed to modernize how student organizations operate. From attendance tracking to event management, from secure payments to real-time analytics — we’re creating an ecosystem where technology empowers student leaders.</Text>
        <Text style={styles.missionBody}>Our mission goes beyond convenience. We’re building sustainable, inclusive, and future-ready systems that will serve generations of students.</Text>
      </View>

      <View style={styles.blueprint}>
        <Image accessibilityLabel="Squared Blueprint logo" source={{ uri: `${API_BASE_URL}/images/Squared_Blueprint_Logo.png` }} style={styles.blueprintLogo} />
        <Text style={styles.blueprintEyebrow}>STRATEGIC PLAN 2026–2030</Text>
        <Text style={styles.blueprintTitle}>Squared Blueprint 2030</Text>
        <Text style={styles.blueprintSubtitle}>12 Pillars. One Vision. Sustainable Impact.</Text>
        <Text style={styles.blueprintBody}>A five-year roadmap transforming Squared into a leading, digitally empowered, and sustainable student organization — built on innovation, research, creative production, and digital systems.</Text>
        <View style={styles.colorStrip}>
          {blueprintPillars.map(([_, __, color], index) => (
            <View key={index} style={[styles.colorStripItem, { backgroundColor: color }]} />
          ))}
        </View>
        <View style={styles.blueprintStats}>
          <View style={styles.blueprintStat}><Text style={styles.blueprintStatNumber}>12</Text><Text style={styles.blueprintStatLabel}>Pillars</Text></View>
          <View style={styles.blueprintStat}><Text style={styles.blueprintStatNumber}>5</Text><Text style={styles.blueprintStatLabel}>Years</Text></View>
          <View style={styles.blueprintStat}><Text style={styles.blueprintStatNumber}>2030</Text><Text style={styles.blueprintStatLabel}>Vision</Text></View>
        </View>
        {blueprintPillars.map(([title, description, color], index) => (
          <View key={title} style={styles.pillarCard}>
            <View style={[styles.pillarColor, { backgroundColor: color }]} />
            <Text style={[styles.pillarNumber, { color }]}>{String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.pillarTitle}>{title}</Text>
            <Text style={styles.body}>{description}</Text>
          </View>
        ))}
        <Text style={styles.blueprintQuote}>"Squared is a structured, future-ready organization built on interconnected pillars, guided by a clear blueprint, and designed for sustainable and inclusive impact."</Text>
        <Text style={styles.blueprintStatsCaption}>Squared Blueprint 2030 · 12 Pillars · One Vision</Text>
      </View>

      <View style={styles.announcementSection}>
        <Text style={styles.sectionTitle}>Latest Announcement</Text>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : announcement ? (
          <View style={styles.announcementCard}>
            <Text style={styles.cardTitle}>{announcement.title}</Text>
            <Text style={styles.body}>{announcement.content}</Text>
            <Text style={styles.muted}>Posted {new Date(announcement.created_at).toLocaleString()}</Text>
          </View>
        ) : <View style={styles.card}><Text style={styles.muted}>No announcements are available right now.</Text></View>}
      </View>

      <View style={styles.updatesCard}>
        <Text style={styles.sectionTitle}>Latest Updates</Text>
        <Text style={styles.body}>Follow us on Facebook for the latest news and announcements.</Text>
        <Text style={styles.socialName}>DCC Squared · facebook.com/dccsquared</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Academic Programs</Text>
        <Text style={styles.sectionIntro}>Discover the diverse range of programs designed to shape future leaders and professionals.</Text>
      </View>
      {programs.map((program) => (
        <View key={program.code} style={styles.academicCard}>
          <Image accessibilityLabel={`${program.code} program logo`} source={{ uri: program.image }} style={styles.programImage} />
          <View style={styles.academicCopy}>
            <Text style={styles.programName}>{program.name}</Text>
            <Text style={styles.programBadge}>{program.code}</Text>
          </View>
        </View>
      ))}

      <View style={styles.aboutCard}>
        <Text style={styles.sectionTitle}>About Squared</Text>
        <View style={styles.logoRow}>
          <View style={styles.logoItem}>
            <Image accessibilityLabel="Davao Central College logo" source={{ uri: `${API_BASE_URL}/images/dcc_logo.png` }} style={styles.aboutLogo} />
            <Text style={styles.muted}>Davao Central College</Text>
          </View>
          <View style={styles.logoItem}>
            <Image accessibilityLabel="Squared QR logo" source={{ uri: `${API_BASE_URL}/images/Squared_Logo.png` }} style={styles.aboutLogo} />
            <Text style={styles.muted}>Squared QR System</Text>
          </View>
        </View>
        <Text style={styles.body}>Revolutionizing Davao Central College Main Campus Experiences — powered by QR technology.</Text>
        <Text style={styles.body}><Text style={styles.aboutEmphasis}>Squared</Text> is a modern web-based system developed for DCC students to streamline attendance, event participation, and transactions using QR code technology.</Text>
        <Text style={styles.body}>Originally launched through Google Forms, Squared has now evolved into a complete web application. Students can register on the platform, automatically generate their own QR codes, and use them for quick and efficient scanning during DCC activities.</Text>
        <Text style={styles.body}>Whether it's attending an event, verifying identity, or checking in for official activities, Squared simplifies the process for both students and organizers — reducing queues, manual tracking, and paperwork.</Text>
        <Text style={styles.body}>The goal of Squared is to enhance accessibility, boost efficiency, and improve the overall experience of every DCC event — all with a simple scan.</Text>
        {aboutFeatures.map(([title, description]) => (
          <View key={title} style={styles.aboutFeature}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.body}>{description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.foundersSection}>
        <Text style={styles.sectionTitle}>Meet Our Visionary Team</Text>
        <Text style={styles.sectionIntro}>The passionate minds revolutionizing campus experiences at Davao Central College.</Text>
        {founders.map((founder) => (
          <View key={founder.name} style={styles.founderCard}>
            <Image accessibilityLabel={founder.name} source={{ uri: `${API_BASE_URL}/images/founders/${founder.image}` }} style={styles.founderImage} />
            <Text style={styles.founderName}>{founder.name}</Text>
            <Text style={styles.founderRole}>{founder.role}</Text>
            <Text style={styles.body}>{founder.description}</Text>
          </View>
        ))}
        <View style={styles.joinCard}>
          <Text style={styles.featureTitle}>Join Our Mission</Text>
          <Text style={styles.body}>Be part of the revolution in campus digital transformation.</Text>
          <Link href="/register" asChild><Pressable style={styles.joinButton}><Text style={styles.retryText}>Get Register Now!</Text></Pressable></Link>
        </View>
      </View>

      <View style={styles.footerCard}>
        <Image accessibilityLabel="Squared logo" source={require("../../assets/images/squared-logo.png")} style={styles.navLogo} />
        <Text style={styles.footerBrand}>Squared</Text>
        <Text style={styles.muted}>Transforming student organizations through digital innovation and sustainable impact.</Text>
        <Text style={styles.muted}>squared.dcc@gmail.com</Text>
        <Text style={styles.footerLinks}>Login  ·  Register  ·  QR Scanner  ·  Blueprint 2030</Text>
        <Text style={styles.muted}>Connect: Facebook · Instagram · TikTok · YouTube</Text>
        <Text style={styles.footer}>© {new Date().getFullYear()} Squared. All rights reserved.</Text>
        <Text style={styles.footer}>Developed with care by Charles S. Evangelio Jr.</Text>
      </View>
      <Text style={styles.footer}>Pull down to refresh event and announcement updates.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  content: { paddingBottom: 40 },
  navbar: { alignItems: "center", backgroundColor: "rgba(24,124,25,0.96)", flexDirection: "row", justifyContent: "space-between", minHeight: 58, paddingHorizontal: 16, paddingVertical: 8, paddingTop: 50 },
  navLeft: { alignItems: "center", flexDirection: "row" },
  navLogo: { height: 34, width: 34 },
  navBrand: { color: "#fff", fontSize: 19, fontWeight: "900", marginLeft: 8 },
  navActions: { alignItems: "center", flexDirection: "row", gap: 10 },
  navLogin: { paddingHorizontal: 9, paddingVertical: 8 },
  navLoginText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  navRegister: { backgroundColor: "#f0931e", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  navRegisterText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  hero: { backgroundColor: colors.primary, overflow: "hidden" },
  heroImage: { borderRadius: 22 },
  heroOverlay: { backgroundColor: "rgba(4,30,7,0.68)", justifyContent: "center", minHeight: 380, padding: 24, paddingTop: 38 },
  clockOverlay: { alignItems: "center", marginTop: 20 },
  liveClock: { color: "#fff", fontSize: 16, fontWeight: "700", textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  eyebrow: { color: "#d5f0d6", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heading: { color: "#fff", fontSize: 29, fontWeight: "900", lineHeight: 36, marginTop: 12, textAlign: "center" },
  subtitle: { color: "#e1f2e1", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center" },
  heroDescription: { color: "#fff", fontSize: 13, lineHeight: 20, marginTop: 9, textAlign: "center" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 20 },
  primaryButton: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 },
  primaryButtonText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  secondaryButton: { borderColor: "#c6e4c8", borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11 },
  secondaryButtonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  slideControls: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 18 },
  slideArrow: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, height: 30, justifyContent: "center", width: 30 },
  slideArrowText: { color: "#fff", fontSize: 22, fontWeight: "700", lineHeight: 25 },
  slideDot: { backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 5, height: 8, width: 8 },
  activeSlideDot: { backgroundColor: "#8DC71E", borderColor: "#fff", borderWidth: 1, height: 11, width: 11 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: "900", marginBottom: 9, marginTop: 23 },
  sectionIntro: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 9, marginTop: -4 },
  loader: { marginVertical: 18 },
  card: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginHorizontal: 16, marginBottom: 9, padding: 15 },
  cardTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  body: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 8 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  countsCard: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginHorizontal: 16, marginBottom: 9, padding: 16 },
  countNumber: { color: colors.primary, fontSize: 30, fontWeight: "900" },
  countLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 2 },
  programCounts: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", marginTop: 14, paddingTop: 11, width: "100%" },
  programCount: { alignItems: "center", minWidth: "20%", paddingHorizontal: 3, paddingVertical: 4 },
  programCountNumber: { color: colors.text, fontSize: 14, fontWeight: "900" },
  programCode: { color: colors.primary, fontSize: 10, fontWeight: "800", marginTop: 3 },
  avatarCard: { backgroundColor: "#fff", borderColor: "#e8f5e9", borderRadius: 18, borderWidth: 1, marginHorizontal: 16, marginBottom: 12, overflow: "hidden" },
  avatarImage: { backgroundColor: "#f1f8e9", height: 230, width: "100%" },
  avatarContent: { padding: 16 },
  avatarName: { fontSize: 20, fontWeight: "900" },
  avatarRole: { alignSelf: "flex-start", backgroundColor: "#f1f8e9", borderRadius: 14, fontSize: 11, fontWeight: "800", marginTop: 5, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5 },
  traits: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  traitTag: { backgroundColor: "#e8f5e9", borderColor: "#c8e6c9", borderRadius: 12, borderWidth: 1, color: colors.primary, fontSize: 10, fontWeight: "700", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
  overviewImage: { height: 210, marginBottom: 10, marginTop: 8, width: "100%" },
  featureCard: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 15, borderWidth: 1, marginHorizontal: 16, marginBottom: 10, padding: 16 },
  featureIcon: { alignItems: "center", borderRadius: 13, height: 42, justifyContent: "center", marginBottom: 11, width: 42 },
  featureIconText: { color: "#fff", fontSize: 21, fontWeight: "900" },
  featureTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  comingSoon: { alignSelf: "flex-start", backgroundColor: "#f0931e", borderRadius: 5, color: "#fff", fontSize: 9, fontWeight: "900", marginTop: 5, overflow: "hidden", paddingHorizontal: 7, paddingVertical: 4 },
  missionCard: { backgroundColor: "#1a1d28", borderRadius: 20, marginHorizontal: 16, marginTop: 8, padding: 20 },
  missionTitle: { color: "#fff", fontSize: 20, fontWeight: "900", lineHeight: 27 },
  missionBody: { color: "rgba(255,255,255,0.84)", fontSize: 13, lineHeight: 22, marginTop: 11 },
  blueprint: { backgroundColor: "#f0f2f4", marginTop: 24, padding: 16 },
  blueprintLogo: { alignSelf: "center", height: 82, marginBottom: 9, width: 82 },
  programBadge: { backgroundColor: "#e8f5e9", borderRadius: 8, color: colors.primary, fontSize: 11, fontWeight: "900", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 7 },
  blueprintEyebrow: { color: "#1a1d28", fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 7, textAlign: "center" },
  blueprintTitle: { color: "#1a1d28", fontSize: 24, fontWeight: "900", marginTop: 8, textAlign: "center" },
  blueprintSubtitle: { color: colors.primary, fontSize: 14, fontWeight: "800", marginTop: 7, textAlign: "center" },
  blueprintBody: { color: "#4b5563", fontSize: 13, lineHeight: 20, marginHorizontal: 5, marginTop: 10, textAlign: "center" },
  colorStrip: { flexDirection: "row", flexWrap: "wrap", gap: 4, justifyContent: "center", marginVertical: 16 },
  colorStripItem: { height: 8, width: 8 },
  blueprintStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 13, marginTop: 18 },
  blueprintStat: { alignItems: "center", minWidth: "28%" },
  blueprintStatNumber: { color: "#1a1d28", fontSize: 22, fontWeight: "900" },
  blueprintStatLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 3 },
  pillarCard: { backgroundColor: "#fff", borderRadius: 13, marginBottom: 9, overflow: "hidden", padding: 14 },
  pillarColor: { height: 4, left: 0, position: "absolute", right: 0, top: 0 },
  pillarNumber: { fontSize: 11, fontWeight: "900" },
  pillarTitle: { color: colors.text, fontSize: 14, fontWeight: "800", marginTop: 5 },
  blueprintQuote: { color: "#1a1d28", fontSize: 14, fontStyle: "italic", fontWeight: "700", lineHeight: 22, marginTop: 8, textAlign: "center" },
  blueprintStatsCaption: { color: colors.primary, fontSize: 11, fontWeight: "800", marginTop: 9, textAlign: "center" },
  announcementSection: { backgroundColor: "#f8fdf0", marginTop: 18, paddingBottom: 10, paddingHorizontal: 0, paddingTop: 4 },
  announcementCard: { backgroundColor: "#fff", borderColor: "#e8f5e9", borderLeftColor: colors.primary, borderLeftWidth: 4, borderRadius: 15, borderWidth: 1, marginHorizontal: 16, padding: 16 },
  updatesCard: { backgroundColor: "#fff", borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginHorizontal: 16, marginTop: 18, padding: 15 },
  socialName: { color: colors.primary, fontSize: 12, fontWeight: "800", marginTop: 11 },
  academicCard: { alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 13, marginHorizontal: 16, marginBottom: 10, minHeight: 104, padding: 13 },
  programImage: { height: 64, width: 64 },
  academicCopy: { flex: 1, gap: 7 },
  programName: { color: colors.text, flex: 1, fontSize: 13, fontWeight: "800" },
  aboutCard: { backgroundColor: "#fff", borderColor: "#e8f5e9", borderLeftColor: colors.primary, borderLeftWidth: 4, borderRadius: 16, borderWidth: 1, marginHorizontal: 16, marginTop: 18, padding: 16 },
  logoRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-around", marginVertical: 12 },
  logoItem: { alignItems: "center", flex: 1 },
  aboutLogo: { height: 72, width: 72 },
  aboutEmphasis: { color: colors.primary, fontWeight: "900" },
  aboutFeature: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  foundersSection: { backgroundColor: "#f3f9ed", marginTop: 20, padding: 16 },
  founderCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 18, marginBottom: 13, padding: 17 },
  founderImage: { backgroundColor: "#e8f5e9", borderColor: "#69B41E", borderRadius: 64, borderWidth: 3, height: 128, width: 128 },
  founderName: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 15, textAlign: "center" },
  founderRole: { color: colors.primary, fontSize: 12, fontWeight: "800", marginTop: 5, textAlign: "center" },
  joinCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 15, marginBottom: 6, padding: 17 },
  joinButton: { backgroundColor: colors.primary, borderRadius: 9, marginTop: 12, paddingHorizontal: 15, paddingVertical: 11 },
  footerCard: { alignItems: "center", backgroundColor: "#152116", marginTop: 18, padding: 22 },
  footerBrand: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 6 },
  footerLinks: { color: "#c6e4c8", fontSize: 11, fontWeight: "700", lineHeight: 18, marginTop: 11, textAlign: "center" },
  eventHeading: { alignItems: "center", flexDirection: "row", gap: 8 },
  status: { backgroundColor: "#e8f5e9", borderRadius: 10, color: colors.primary, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  ongoingStatus: { backgroundColor: "#fff4df", color: "#8a5700" },
  error: { color: colors.danger, fontWeight: "700", lineHeight: 20 },
  retryButton: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 9, marginTop: 11, paddingHorizontal: 13, paddingVertical: 9 },
  retryText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  footer: { color: colors.muted, fontSize: 11, marginTop: 9, textAlign: "center" },
})
