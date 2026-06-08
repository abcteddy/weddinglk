export default function DashboardSubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 px-6 md:px-8 py-8 max-w-7xl mx-auto w-full overflow-y-auto">
      {children}
    </div>
  )
}
