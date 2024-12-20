import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <DashboardNav />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
} 