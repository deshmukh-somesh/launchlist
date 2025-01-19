import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0A0B14] text-white">
      {/* Sidebar with dark theme */}
      <div className="fixed left-0 h-screen border-r border-[#2A2B3C] bg-[#151725] shadow-xl">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-[240px]"> {/* Adjust ml based on your sidebar width */}
        {/* Navigation with dark theme */}
        <div className="fixed top-0 right-0 left-[240px] z-10 border-b border-[#2A2B3C] bg-[#151725]/80 backdrop-blur-sm">
          <DashboardNav />
        </div>

        {/* Main content with proper spacing and background effects */}
        <main className="relative pt-[64px] min-h-screen"> {/* Adjust pt based on your nav height */}
          {/* Gradient background effect */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/5 to-transparent pointer-events-none" /> */}
          <div className="absolute" /> 
          {/* Content container */}
          <div className="relative p-8 max-w-7xl mx-auto">
            {/* Subtle grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.02]" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%236E3AFF' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                backgroundSize: '24px 24px'
              }}
            />
            
            {/* Actual content */}
            <div className="relative">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}