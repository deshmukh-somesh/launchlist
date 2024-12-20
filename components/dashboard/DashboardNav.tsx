"use client";

import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function DashboardNav() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifications } = trpc.notification.getUnread.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const utils = trpc.useContext();
  const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnread.invalidate();
    },
  });

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {notifications?.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => markAsRead({ notificationId: notification.id })}
                  className="p-4"
                >
                  <span className="text-sm">{notification.content}</span>
                </DropdownMenuItem>
              ))}
              {(!notifications || notifications.length === 0) && (
                <DropdownMenuItem disabled>
                  No new notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 