import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server';
import Link from 'next/link';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAccountNavProps {
  email: string | undefined;
  name: string;
  imageUrl: string | null;
}

const UserAccountNav = async ({
  email,
  imageUrl,
  name,
}: UserAccountNavProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-9 w-9 rounded-full",
            "border border-[#2A2B3C]",
            "hover:border-[#6E3AFF]/50",
            "transition-colors duration-200"
          )}
        >
          <Avatar className="h-9 w-9 relative">
            {imageUrl ? (
              <AvatarImage
                src={imageUrl}
                alt={name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback 
                className={cn(
                  "bg-[#151725]",
                  "text-[#6E3AFF]",
                  "font-medium"
                )}
              >
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}

            {/* Online status indicator */}
            <span className={cn(
              "absolute bottom-0 right-0",
              "h-2.5 w-2.5 rounded-full",
              "bg-green-500",
              "ring-2 ring-[#151725]"
            )} />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end"
        className={cn(
          "w-64 p-2",
          "bg-[#151725] border border-[#2A2B3C]",
          "shadow-xl shadow-black/10"
        )}
      >
        {/* User Info */}
        <div className={cn(
          "flex items-center gap-3 p-2",
          "rounded-md",
          "hover:bg-[#1A1C2E] transition-colors"
        )}>
          <Avatar className="h-8 w-8">
            {imageUrl ? (
              <AvatarImage
                src={imageUrl}
                alt={name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-[#1A1C2E] text-[#6E3AFF]">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-white">
              {name}
            </p>
            {email && (
              <p className="text-xs text-gray-400 truncate">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-2 bg-[#2A2B3C]" />

        {/* Dashboard Link */}
        <DropdownMenuItem asChild>
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center gap-2",
              "cursor-pointer rounded-md",
              "text-gray-300 hover:text-white",
              "hover:bg-[#1A1C2E]",
              "transition-colors duration-200"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-[#2A2B3C]" />

        {/* Logout Button */}
        <DropdownMenuItem asChild>
          <LogoutLink 
            className={cn(
              "flex items-center gap-2",
              "cursor-pointer rounded-md",
              "text-red-400 hover:text-red-300",
              "hover:bg-red-500/10",
              "transition-colors duration-200"
            )}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserAccountNav;