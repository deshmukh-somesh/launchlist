"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Rocket,
  FolderHeart,
  Bell,
  Settings,
  Plus,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "My Products",
    icon: Rocket,
    href: "/dashboard/products",
    color: "text-violet-500",
  },
  {
    label: "Collections",
    icon: FolderHeart,
    href: "/dashboard/collections",
    color: "text-pink-500",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
    color: "text-orange-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="bg-[#151725] text-white border-[#2A2B3C] hover:bg-[#1A1C2E] hover:border-[#6E3AFF]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "h-full transition-all duration-300 ease-in-out",
          "bg-[#151725] border-r border-[#2A2B3C]",
          // Mobile: full-screen overlay
          "fixed inset-0 z-40 w-full lg:w-64",
          // Transform
          "transform lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static positioning
          "lg:relative lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#2A2B3C]">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-2"
            >
              <h1 className="text-xl font-bold text-white">Product Launches</h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 mt-6">
            <nav className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    "text-sm font-medium",
                    "transition-colors duration-200",
                    "hover:bg-[#1A1C2E] hover:text-white",
                    pathname === route.href 
                      ? "bg-[#1A1C2E] text-white" 
                      : "text-gray-400"
                  )}
                >
                  <route.icon className={cn("h-5 w-5", route.color)} />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Submit Product Button */}
          <div className="p-4 border-t border-[#2A2B3C]">
            <Link
              href="/submit"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "text-sm font-medium text-white",
                "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
                "hover:opacity-90 transition-opacity"
              )}
            >
              <Plus className="h-5 w-5" />
              Submit Product
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}