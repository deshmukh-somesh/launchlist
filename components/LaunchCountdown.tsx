"use client";

import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Clock } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function LaunchCountdown() {
  const [countdown, setCountdown] = useState<CountdownTime>({ hours: 0, minutes: 0, seconds: 0 });
  
  const { data: nextLaunch, isLoading } = trpc.product.getNextLaunch.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });

  // Calculate countdown values
  const calculateTimeLeft = (targetDate: Date): CountdownTime => {
    const totalSeconds = Math.max(0, differenceInSeconds(targetDate, new Date()));
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  useEffect(() => {
    if (!nextLaunch?.launchDate) return;

    const timer = setInterval(() => {
      const target = new Date(nextLaunch.launchDate);
      setCountdown(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [nextLaunch]);

  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  // Loading state with placeholder numbers
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 animate-pulse">
        <Clock className="h-5 w-5 text-blue-400" />
        <div className="text-2xl font-mono font-bold text-blue-400">
          --:--:--
        </div>
      </div>
    );
  }

  // If no next launch is found
  if (!nextLaunch) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Clock className="h-5 w-5 text-gray-400" />
        <div className="text-2xl font-mono font-bold text-gray-400">
          No upcoming launches
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Clock className="h-5 w-5 text-blue-600" />
      <div className="text-2xl font-mono font-bold text-blue-600">
        {formatNumber(countdown.hours)}:{formatNumber(countdown.minutes)}:{formatNumber(countdown.seconds)}
      </div>
    </div>
  );
} 