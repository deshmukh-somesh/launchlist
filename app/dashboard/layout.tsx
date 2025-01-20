// DashboardLayout.tsx
import { Sidebar } from "@/components/dashboard/Sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#151725]">
      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on lg screens */}
        <div className="hidden lg:flex w-64 shrink-0">
          <div className="w-64 fixed inset-y-0">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="min-h-screen">
            <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              {/* Background pattern */}
              <div 
                className="absolute inset-0 opacity-5" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%236E3AFF' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                  backgroundSize: '24px 24px'
                }}
              />
              
              {/* Content */}
              <div className="relative">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}