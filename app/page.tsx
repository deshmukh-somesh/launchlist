"use client"
import { useState, useEffect, useRef } from 'react';
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Rocket, Star, Trophy, ArrowUp } from "lucide-react";
import Link from "next/link";
import LaunchCountdown from "@/components/LaunchCountdown";
import UpcomingLaunches from "@/components/UpcomingLaunches";
import TodaysWinners from "@/components/TodaysWinners";
import YesterdayWinners from "@/components/YesterdayWinners";
import PastLaunches from "@/components/PastLaunches";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { useRouter } from 'next/navigation';
import { LoginLink, useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Footer } from "@/components/Footer";
import compactBadges from "@/public/productlaunches-badges-clean.svg";
import Image from "next/image";

export default function Home() {
  // scroll at top 
  const [showScrollTop, setShowScrollTop] = useState(false);
  const productSectionRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useKindeBrowserClient();
  const router = useRouter();
  const utils = trpc.useContext();
  const { data: stats, isLoading: isStatsLoading } = trpc.user.getPlatformStats.useQuery();

  useEffect(() => {
    utils.product.getUpcoming.prefetch();
    utils.product.getTodaysWinners.prefetch();
    utils.product.getYesterday.prefetch();
    utils.product.getNextLaunch.prefetch();
  }, []);

  // useEffect with handleScroll function: 
  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 500px
      setShowScrollTop(window.scrollY > 1200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = () => {
    productSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return `${num}+`;
  };



  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-16 sm:mt-16 flex flex-col items-center justify-center text-center">
        {/* Announcement Banner */}
        <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-[#2A2B3C] bg-[#151725] px-7 py-2 shadow-md backdrop-blur transition-all hover:border-[#6E3AFF] hover:bg-[#1A1C2E]">
          <Rocket className="h-5 w-5 text-[#6E3AFF]" />
          <p className="text-sm font-semibold text-white">
            Product Launches is now Public! 🚀
          </p>
        </div>

        <div className="mb-8">
          <Image src={compactBadges} alt="Product Launches Logo" width={1000} height={1000} />
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#151725] border border-[#2A2B3C] hover:border-[#6E3AFF] transition-colors">
            <Trophy className="h-6 w-6 text-[#6E3AFF] mb-2" />
            <div className="text-2xl font-bold text-white">
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-[#1E1F2E] animate-pulse rounded" />
              ) : (
                formatNumber(stats?.totalProducts || 0)
              )}
            </div>
            <div className="text-sm text-gray-400">Products Launched</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#151725] border border-[#2A2B3C] hover:border-[#6E3AFF] transition-colors">
            <Star className="h-6 w-6 text-[#2563EB] mb-2" />
            <div className="text-2xl font-bold text-white">
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-[#1E1F2E] animate-pulse rounded" />
              ) : (
                formatNumber(stats?.totalUsers || 0)
              )}
            </div>
            <div className="text-sm text-gray-400">Happy Users</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-[#151725] border border-[#2A2B3C] hover:border-[#6E3AFF] transition-colors">
            <Rocket className="h-6 w-6 text-[#6E3AFF] mb-2" />
            <div className="text-2xl font-bold text-white">
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-[#1E1F2E] animate-pulse rounded" />
              ) : (
                stats?.totalLaunches24h || 0
              )}
            </div>
            <div className="text-sm text-gray-400">Launches Today</div>
          </div>
        </div>

        {/* Countdown Section */}
        <div className="mb-12 p-6 bg-[#151725] rounded-2xl border border-[#2A2B3C] shadow-lg">
          <div className="text-lg font-medium text-white mb-3">Next Product Launch In</div>
          <LaunchCountdown />
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl text-white">
          Discover & Share Amazing{' '}
          <span className="bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] bg-clip-text text-transparent">
            Digital Products
          </span>
        </h1>

        <p className="mt-6 max-w-prose text-lg text-gray-400 leading-relaxed">
          Join our thriving community of makers and innovators. Share your products,
          get valuable feedback, and be part of the next big thing.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              className={buttonVariants({
                size: 'lg',
                className: 'bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] text-white hover:from-[#5B2FD9] hover:to-[#1E4FBE]',
              })}
              href="/dashboard"
            >
              Launch Your Product <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <LoginLink
              className={buttonVariants({
                size: 'lg',
                className: 'bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] text-white hover:from-[#5B2FD9] hover:to-[#1E4FBE]',
              })}
            >
              Launch Your Product <ArrowRight className="ml-2 h-5 w-5" />
            </LoginLink>
          )}
          <Link
            className={buttonVariants({
              size: 'lg',
              variant: 'outline',
              className: 'border-[#2A2B3C] hover:border-[#6E3AFF] text-white',
            })}
            href="/products"
          >
            Explore Products <Star className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex items-center justify-center space-x-8 opacity-75" ref={productSectionRef}>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#6E3AFF]"></div>
            <span className="text-sm text-gray-400">100% Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#2563EB]"></div>
            <span className="text-sm text-gray-400">Verified Products</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#6E3AFF]"></div>
            <span className="text-sm text-gray-400">Active Community</span>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Product Sections */}
      <div className="max-w-[1400px] mx-auto px-4 space-y-16" >
        {/* <section className="bg-[#151725] rounded-xl border border-[#2A2B3C] shadow-lg"> */}
        <section >
          <UpcomingLaunches />
        </section>

        {/* <section className="bg-[#151725] rounded-xl border border-[#2A2B3C] shadow-lg"> */}
        {/* <section>
          <TodaysWinners />
        </section> */}

        {/* <section className="bg-[#151725] rounded-xl border border-[#2A2B3C] shadow-lg"> */}
        <section>
          <YesterdayWinners />
        </section>

        {/* <section className="bg-[#151725] rounded-xl border border-[#2A2B3C] shadow-lg"> */}
        <section>
          <PastLaunches />
        </section>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToSection}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-[#151725] border border-[#2A2B3C] hover:border-[#6E3AFF] transition-all duration-300 shadow-lg ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to products section"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-[#6E3AFF] rounded-full blur opacity-30" />
          <ArrowUp className="h-6 w-6 text-[#6E3AFF] relative" />
        </div>
      </button>
      <Footer />
    </>
  );
}