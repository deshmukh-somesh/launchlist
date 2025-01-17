import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, CirclePlus } from "lucide-react";
import UserAccountNav from "@/components/UserAccountNav";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import { getKindeServerSession, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { cn } from "@/lib/utils";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className={cn(
      "sticky h-16 inset-x-0 top-0 z-30 w-full",
      "border-b border-[#2A2B3C]",
      "bg-background/60 backdrop-blur-xl",
      "supports-[backdrop-filter]:bg-background/60"
    )}>
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-2",
              "font-semibold text-lg",
              "text-white hover:text-[#6E3AFF]",
              "transition-colors duration-200"
            )}
          >
            <div className="relative w-8 h-8">
              <Image 
                src="/finalbabu.svg" 
                alt="ProductLaunches" 
                fill
                className="object-contain transition-transform hover:scale-110 duration-200"
              />
            </div>
            <span>Product Launches</span>
          </Link>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <MobileNav isAuth={!!user} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            {!user ? (
              <>
                <LoginLink 
                  className={buttonVariants({ 
                    variant: "ghost",
                    className: cn(
                      "text-gray-300 hover:text-white",
                      "hover:bg-white/10",
                      "transition-colors duration-200"
                    )
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink 
                  className={buttonVariants({
                    className: cn(
                      "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
                      "hover:opacity-90",
                      "text-white font-medium",
                      "flex items-center gap-2",
                      "shadow-lg shadow-[#6E3AFF]/25",
                      "transition-all duration-200",
                      "hover:shadow-xl hover:shadow-[#6E3AFF]/20",
                      "hover:-translate-y-0.5"
                    )
                  })}
                >
                  <CirclePlus className="h-4 w-4" />
                  Submit Product
                </RegisterLink>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className={buttonVariants({
                    variant: "ghost",
                    className: cn(
                      "text-gray-300 hover:text-white",
                      "hover:bg-white/10",
                      "transition-colors duration-200"
                    )
                  })}
                >
                  Dashboard
                </Link>
                <div className="pl-4 border-l border-[#2A2B3C]">
                  <UserAccountNav
                    name={!user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`}
                    email={user.email ?? ""}
                    imageUrl={user.picture ?? ""}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Optional: Gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6E3AFF]/20 to-transparent" />
    </nav>
  );
};

export default Navbar;