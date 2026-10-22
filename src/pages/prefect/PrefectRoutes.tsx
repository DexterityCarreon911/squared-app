import { Navigate, Route, Routes } from "react-router-dom"
import PrefectIncidentDetail from "./IncidentDetail"
import PrefectIncidentForm from "./IncidentForm"
import PrefectIncidents from "./Incidents"
import PrefectLogin from "./Login"
import PrefectReports from "./Reports"
import PrefectStudents from "./Students"
import PrefectViolations from "./Violations"

/** Standalone route subtree to mount from the host router without coupling to its layout. */
export default function PrefectRoutes() {
  return (
    <Routes>
      <Route path="login" element={<PrefectLogin />} />
      <Route path="incidents" element={<PrefectIncidents />} />
      <Route path="incidents/new" element={<PrefectIncidentForm />} />
      <Route path="incidents/:id" element={<PrefectIncidentDetail />} />
      <Route path="students" element={<PrefectStudents />} />
      <Route path="violations" element={<PrefectViolations />} />
      <Route path="reports" element={<PrefectReports />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  )
}
