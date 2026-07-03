import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-[#187C19] mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Go Home</Link>
          </Button>
          <Button asChild>
            <Link to="/login"><Home className="w-4 h-4 mr-1" /> Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
