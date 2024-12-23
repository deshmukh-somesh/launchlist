"use client"
import { useEffect } from 'react';
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Rocket, Star, Trophy } from "lucide-react";
import Link from "next/link";
import LaunchCountdown from "@/components/LaunchCountdown";
import UpcomingLaunches from "@/components/UpcomingLaunches";
import TodaysWinners from "@/components/TodaysWinners";
import YesterdayWinners from "@/components/YesterdayWinners";
import PastLaunches from "@/components/PastLaunches";


export default function Home() {
  const utils = trpc.useContext();
  
  // Add stats query
  const { data: stats, isLoading: isStatsLoading } = trpc.user.getPlatformStats.useQuery();
  
  useEffect(() => {
    utils.product.getUpcoming.prefetch();
    utils.product.getTodaysWinners.prefetch();
    utils.product.getYesterday.prefetch();
    utils.product.getNextLaunch.prefetch();
  }, []);

  // Format numbers with + suffix
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.floor(num/1000)}K+`;
    }
    return `${num}+`;
  };

  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-25 flex flex-col items-center justify-center text-center">
        <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <Rocket className="h-5 w-5 text-blue-500" />
          <p className="text-sm font-semibold text-gray-700">
            Product Launches is now Public! 🚀
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatNumber(stats?.totalProducts || 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Products Launched</div>
          </div>
          <div className="flex flex-col items-center">
            <Star className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatNumber(stats?.totalUsers || 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Happy Users</div>
          </div>
          <div className="flex flex-col items-center">
            <Rocket className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              ) : (
                stats?.totalLaunches24h || 0
              )}
            </div>
            <div className="text-sm text-gray-600">Launches Today</div>
          </div>
        </div>

        <div className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm">
          <div className="text-lg font-medium text-gray-800 mb-3">Next Product Launch In</div>
          <LaunchCountdown />
        </div>

        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Discover & Share Amazing{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Digital Products
          </span>
        </h1>

        <p className="mt-6 max-w-prose text-lg text-zinc-700 leading-relaxed">
          Join our thriving community of makers and innovators. Share your products, 
          get valuable feedback, and be part of the next big thing.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            className={buttonVariants({
              size: 'lg',
              className: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700',
            })}
            href="/dashboard"
          >
            Launch Your Product <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            className={buttonVariants({
              size: 'lg',
              variant: 'outline',
              className: 'border-2',
            })}
            href="/products"
          >
            Explore Products <Star className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center space-x-8 opacity-75">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">100% Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Verified Products</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Active Community</span>
          </div>
        </div>
      </MaxWidthWrapper>

      <div className="max-w-[1400px] mx-auto px-4 space-y-16">
        <section className="bg-white rounded-xl shadow-sm">
          <UpcomingLaunches />
        </section>

        <section className="bg-white rounded-xl shadow-sm">
          <TodaysWinners />
        </section>

        <section className="bg-white rounded-xl shadow-sm">
          <YesterdayWinners />
        </section>

        <section className="bg-white rounded-xl shadow-sm">
          <PastLaunches />
        </section>
      </div>
    </>
  );
}
