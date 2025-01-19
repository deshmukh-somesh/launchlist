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
  X
} from "lucide-react";
import { useState } from "react";
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

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-gray-900 text-white border-none hover:bg-gray-800"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out bg-gray-900 text-white",
        "lg:translate-x-0 lg:static lg:w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="space-y-4 py-4 flex flex-col h-full">
          <div className="px-3 py-2 flex-1">
            <Link href="/dashboard" className="flex items-center pl-3 mb-14">
              <h1 className="text-2xl font-bold">LaunchList</h1>
            </Link>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    pathname === route.href
                      ? "text-white bg-white/10"
                      : "text-zinc-400"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="px-3">
            <Link
              href="/submit"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-blue-600 bg-blue-500 rounded-lg transition"
              )}
            >
              <div className="flex items-center flex-1">
                <Plus className="h-5 w-5 mr-3" />
                Submit Product
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}