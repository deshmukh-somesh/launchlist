import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import DashboardMain from "@/components/DashboardMain";
import { db } from "@/db";

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect("/auth-callback?origin=dashboard");
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect('/auth-callback?origin=dashboard');

  return (
    // Wrapper div with dark theme styling
    <div className="min-h-[calc(100vh-64px)]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6E3AFF]/5 via-transparent to-[#2563EB]/5 pointer-events-none" />
      
      {/* Content container */}
      <div className="relative">
        <DashboardMain />
      </div>

      {/* Optional: Background pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #6E3AFF 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}