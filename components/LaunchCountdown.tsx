"use client";

import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Clock, Rocket } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { cn } from "@/lib/utils";

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface NextLaunch {
  name: string;
  launchDate: string;
}

export default function LaunchCountdown() {
  const [countdown, setCountdown] = useState<CountdownTime>({ hours: 0, minutes: 0, seconds: 0 });
  
  const { data: nextLaunch, isLoading } = trpc.product.getNextLaunch.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const calculateTimeLeft = (targetDate: Date): CountdownTime => {
    const now = new Date();
    const targetUTC = new Date(targetDate);
    
    const totalSeconds = Math.max(0, differenceInSeconds(targetUTC, now));
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  useEffect(() => {
    if (!nextLaunch?.launchDate) return;

    const target = new Date(nextLaunch.launchDate);
    setCountdown(calculateTimeLeft(target));

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [nextLaunch]);

  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center gap-4",
        "p-6 rounded-xl",
        "bg-gradient-to-br from-[#151725] to-[#1A1C2E]",
        "border border-[#2A2B3C]",
        "animate-pulse"
      )}>
        <Clock className="h-6 w-6 text-[#6E3AFF] animate-spin" />
        <div className="text-3xl font-mono font-bold text-[#6E3AFF]">
          --:--:--
        </div>
      </div>
    );
  }

  // No launches
  if (!nextLaunch) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-3",
        "p-6 rounded-xl",
        "bg-gradient-to-br from-[#151725] to-[#1A1C2E]",
        "border border-[#2A2B3C]"
      )}>
        <Rocket className="h-8 w-8 text-gray-400" />
        <div className="text-xl font-medium text-gray-400 text-center">
          No upcoming launches
        </div>
      </div>
    );
  }

  // Active countdown
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      "p-6 rounded-xl",
      "bg-gradient-to-br from-[#151725] to-[#1A1C2E]",
      "border border-[#2A2B3C]",
      "hover:border-[#6E3AFF]/30 transition-colors"
    )}>
      <div className="text-lg font-medium text-white mb-2">
        Next Launch In
      </div>
      
      <div className="flex items-center gap-4">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "text-3xl font-mono font-bold",
            "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
            "bg-clip-text text-transparent"
          )}>
            {formatNumber(countdown.hours)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Hours</div>
        </div>

        <div className="text-2xl font-bold text-[#6E3AFF]">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "text-3xl font-mono font-bold",
            "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
            "bg-clip-text text-transparent",
            countdown.minutes === 0 && countdown.hours === 0 && "animate-pulse"
          )}>
            {formatNumber(countdown.minutes)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Minutes</div>
        </div>

        <div className="text-2xl font-bold text-[#6E3AFF]">:</div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "text-3xl font-mono font-bold",
            "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
            "bg-clip-text text-transparent",
            countdown.minutes === 0 && countdown.hours === 0 && "animate-pulse"
          )}>
            {formatNumber(countdown.seconds)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Seconds</div>
        </div>
      </div>

      {/* Optional: Product name display */}
      {nextLaunch?.name && (
        <div className="mt-4 text-sm text-gray-400 text-center">
          Next up: <span className="text-white">{nextLaunch.name}</span>
        </div>
      )}

      {/* Animated progress bar */}
      <div className="w-full h-1 bg-[#2A2B3C] rounded-full mt-4 overflow-hidden">
        <div 
          className={cn(
            "h-full bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
            "animate-pulse"
          )}
          style={{
            width: `${Math.min(100, (countdown.seconds / 60) * 100)}%`,
            transition: 'width 1s linear'
          }}
        />
      </div>
    </div>
  );
}