import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";

import { ArrowRight, CirclePlus } from "lucide-react";
import UserAccountNav from "@/components/UserAccountNav";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import { getKindeServerSession, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold gap-2 items-center">
            <Image src="/finalbabu.svg" alt="ProductLaunches" width={40} height={40} />
            <span className="font-sans">Product Launches</span>
          </Link>


          {/* todo: add mobile navbar will be done later. */}
          <MobileNav isAuth={!!user} />

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <LoginLink className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Sign in

              </LoginLink>
              <RegisterLink className={buttonVariants({ variant: "signin", size: "sm" })}>
                <CirclePlus className="ml-0.5 h-5 w-5" />

                Submit

              </RegisterLink>
            </>):(
              <>
                <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Dashboard
                </Link>
                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}

          </div>

        </div>
        {/* todo: add mobile navbar will be done later. */}

        {/* <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>PDFAskAI</span>
          </Link>
          todo: add mobile navbar will be done later.
          <MobileNav isAuth={!!user}/>

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href={"/pricing"}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink className={buttonVariants({ size: "sm" })}>
                  Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
          </div>
        </div> */}
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
