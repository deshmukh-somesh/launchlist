"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen((prev) => !prev);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-gray-300 hover:text-white transition-colors"
      />

      {isOpen && (
        <div className="fixed inset-0 z-0 w-full animate-in fade-in-0">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleOpen} />
          
          <div className="fixed top-0 left-0 right-0 bg-[#151725] border-b border-[#2A2B3C] p-6 pt-20 shadow-xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-4">
              {!isAuth ? (
                <>
                  <Link
                    href="/sign-up"
                    onClick={() => closeOnCurrent("/sign-up")}
                    className="flex items-center w-full font-semibold text-[#6E3AFF] hover:text-[#5B2FD9] transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <div className="h-px w-full bg-[#2A2B3C]" />
                  
                  <Link
                    href="/sign-in"
                    onClick={() => closeOnCurrent("/sign-in")}
                    className="flex items-center w-full font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => closeOnCurrent("/dashboard")}
                    className="flex items-center w-full font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  
                  <div className="h-px w-full bg-[#2A2B3C]" />
                  
                  <Link
                    href="/sign-out"
                    className="flex items-center w-full font-semibold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sign out
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;