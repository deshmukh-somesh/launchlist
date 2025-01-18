"use client";

import { trpc } from "@/app/_trpc/client";
import LoadingSkeleton from "./LoadingSkeleton";
import ProductCard from "./ProductCard";
import { keepPreviousData } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export default function YesterdayWinners() {
  const { data: products, isLoading } = trpc.product.getYesterdayWinners.useQuery(undefined, {
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  });

  if (isLoading) {
    return <LoadingSkeleton variant="yesterday" />;
  }

  return (
    <div className="py-12 relative">
      {/* Gradient background with slightly different color */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB]/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="mb-8">
          {/* Title section with award icon and gradient underline */}
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-[#C0C0C0]" /> {/* Silver color for yesterday's winners */}
            <h2 className="text-3xl font-bold text-white">Yesterday's Winners</h2>
          </div>
          
          {/* Subtitle with improved contrast */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-gray-400 text-sm">
              Top voted products from yesterday
            </span>
            <div className="h-1 w-20 bg-gradient-to-r from-[#2563EB] to-[#6E3AFF] rounded-full" />
          </div>
        </div>
        
        {products && products.length > 0 ? (
          <div className="space-y-6">
            {products.map((product: Product, index) => (
              <div 
                key={product.id} 
                className="w-full transform transition-all duration-300 hover:translate-y-[-2px]"
              >
                {/* Wrapper with rank-based glow effect */}
                <div 
                // className={
                //   cn(
                //   "relative rounded-xl overflow-hidden",
                //   index === 0 && "shadow-[0_0_10px_rgba(37,99,235,0.15)]",
                //   index === 1 && "shadow-[0_0_20px_rgba(37,99,235,0.1)]",
                //   index === 2 && "shadow-[0_0_10px_rgba(37,99,235,0.05)]"
                // )}
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
                        name: product.maker.name,
                        avatarUrl: product.maker.avatarUrl,
                        username: product.maker.username
                      },
                      _count: {
                        votes: product._count?.votes || 0,
                        comments: product._count?.comments || 0,
                      }
                    }}
                    variant="winner"
                    rank={index + 1}
                  />

                  {/* Rank indicator - optional enhancement */}
                  {/* {index < 3 && (
                    <div className={cn(
                      "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 && "bg-[#2563EB]/20 text-[#2563EB]",
                      index === 1 && "bg-[#2563EB]/15 text-[#2563EB]",
                      index === 2 && "bg-[#2563EB]/10 text-[#2563EB]"
                    )}>
                      #{index + 1}
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#2A2B3C] bg-[#151725] p-8 text-center">
            <Award className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No winners from yesterday
            </p>
            <p className="text-gray-500 mt-2">
              Check today's launches and cast your votes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}