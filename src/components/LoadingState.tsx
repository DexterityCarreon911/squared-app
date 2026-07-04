interface LoadingStateProps {
  message?: string
  className?: string
}

export default function LoadingState({ message = "Loading...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-green-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-[#187C19] rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-gray-500 text-sm font-medium">{message}</p>
    </div>
  )
}
