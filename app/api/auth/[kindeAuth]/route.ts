
import { NextRequest } from "next/server";

// import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// export async function GET(request: NextRequest, { params }: {params:any}) {
//   const endpoint = params.kindeAuth;
//   console.log("this is the endpoint", endpoint)
//   return handleAuth(request, endpoint);
// }


import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = handleAuth();