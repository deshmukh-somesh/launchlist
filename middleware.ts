// import { NextRequest, NextResponse } from 'next/server';
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// export const config = {
//     matcher: ['/submit']
// }

// export default async function middleware(req: NextRequest) {
//   const { isAuthenticated } = getKindeServerSession();
//   const auth = await isAuthenticated();

//   if (auth) {
//     return NextResponse.next();
//   } else {
//     return NextResponse.redirect(new URL('/api/auth/login?post_login_redirect_url=/submit', req.url));
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const config = {
    matcher: ['/submit', '/dashboard', '/profile']
}

export async function middleware(req: NextRequest) {
  const { isAuthenticated } = getKindeServerSession();
  
  if (await isAuthenticated()) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/api/auth/login', req.url);
  loginUrl.searchParams.set('post_login_redirect_url', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}