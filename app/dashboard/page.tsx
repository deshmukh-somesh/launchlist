import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {redirect} from "next/navigation";

import DashboardMain from "@/components/DashboardMain";
import { db } from "@/db";
export default async function DashboardPage() {
const {getUser} = getKindeServerSession();
const user = await getUser();

if(!user || !user.id) {
  redirect("/auth-callback?origin=dashboard");
}
  // Corrected async dbUser fetching
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });
  
  
    if(!dbUser) redirect('/auth-callback?origin=dashboard')
  return <DashboardMain />;
}


