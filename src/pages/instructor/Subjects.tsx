import { BookOpen, Users } from "lucide-react"
import { LoadingState, Notice, PageHeading, PortalFrame, useRequireInstructor } from "./portal"

export default function InstructorSubjects() {
  const portal = useRequireInstructor()
  return <PortalFrame instructor={portal.instructor} csrfToken={portal.csrfToken}>
    {portal.loading ? <LoadingState /> : <>
      {portal.error && <Notice>{portal.error}</Notice>}
      <PageHeading title="Assigned subjects" description="Subject assignments and student counts are managed by the NSTP administrator." />
      {!portal.subjects.length ? <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
        <h2 className="mt-3 font-bold">No assigned NSTP subjects</h2>
        <p className="mt-1 text-sm text-gray-500">There are currently no subject assignments associated with your instructor ID.</p>
      </div> : <div className="grid gap-4 md:grid-cols-2">
        {portal.subjects.map((subject) => <article key={subject.subject_code} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#187C19]">{subject.subject_code}</p><h2 className="mt-1 text-lg font-bold">{subject.subject_name || "NSTP subject"}</h2></div>
            <span className="rounded-xl bg-green-50 p-2 text-[#187C19]"><BookOpen className="h-5 w-5" /></span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
            <span className="text-gray-500">{subject.section ? `Section ${subject.section}` : "Section not set"}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold"><Users className="h-4 w-4 text-gray-400" />{subject.student_count} enrolled</span>
          </div>
        </article>)}
      </div>}
    </>}
  </PortalFrame>
}
