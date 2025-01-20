"use client";

import { trpc } from "@/app/_trpc/client";
import LoadingSkeleton from "./LoadingSkeleton";
import ProductCard from "./ProductCard";
import { keepPreviousData } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodaysWinners() {
  const { data: winners, isLoading } = trpc.product.getTodaysWinners.useQuery(undefined, {
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  });

  if (isLoading) {
    return <LoadingSkeleton variant="winner" />;
  }

  return (
    <div className="py-12 relative">
      {/* Celebratory gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/10 to-transparent pointer-events-none" /> */}
      <div className="absolute" />
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="mb-8 max-w-4xl mx-auto">
          {/* Title section with trophy icon and gradient underline */}
          <div className="flex items-center gap-3 mb-2">
            {/* <Trophy className="h-8 w-8 text-[#FFD700]" /> Gold color for trophy */}
            <div className="relative">
              <div className="absolute -inset-1 bg-[#FFD700] rounded-full blur opacity-30 animate-pulse" />
              <Trophy className="h-8 w-8 text-[#FFD700]" /> {/* Gold color for trophy */}
            </div>
            <h2 className="text-3xl font-bold text-white">Today&apos;s Winners</h2>
          </div>

          {/* Subtitle with improved contrast */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-gray-400 text-sm">
              Top voted products launched today
            </span>
            <div className="h-1 w-20 bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] rounded-full" />
          </div>
        </div>


        {winners && winners.length > 0 ? (
          <div className="space-y-6">
            {winners.map((product, index) => {
              // Find all products with the same vote count
              const tiedProducts = winners.filter(
                p => (p._count?.votes || 0) === (product._count?.votes || 0)
              );
              const isTied = tiedProducts.length > 1;
              const rank = winners.findIndex(
                p => (p._count?.votes || 0) === (product._count?.votes || 0)
              ) + 1;

              return (
                <div 
                  key={product.id} 
                  className="w-full transform transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <ProductCard 
                    product={{
                      ...product,
                      createdAt: new Date(product.createdAt),
                      launchDate: new Date(product.launchDate),
                      categories: product.categories,
                      website: product.website,
                      isLaunched: product.isLaunched,
                      maker: {
                        ...product.maker,
                        username: product.maker.username || null
                      },
                      _count: {
                        votes: product._count?.votes || 0,
                        comments: product._count?.comments || 0,
                      }
                    }}
                    variant="winner"
                    rank={rank}
                    isTied={isTied}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto rounded-xl border border-[#2A2B3C] bg-[#151725] p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No winners yet today
            </p>
            <p className="text-gray-500 mt-2">
              Be the first to launch and get votes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}