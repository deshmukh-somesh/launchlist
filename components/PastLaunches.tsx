"use client";

import { trpc } from "@/app/_trpc/client";
import ProductCard from "./ProductCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { History, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PastLaunches() {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = trpc.product.getPastLaunches.useInfiniteQuery(
    {
      limit: 9,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSkeleton variant="default" />;

  return (
    <div className="py-12 relative">
      {/* Subtle gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#151725]/50 to-transparent pointer-events-none" /> */}
      <div className="absolute" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="mb-8 max-w-4xl mx-auto">
          {/* Title section with history icon and gradient underline */}
          <div className="flex items-center gap-3 mb-2">
          <div className="relative">
          <div className="absolute -inset-1 bg-[#6E3AFF] rounded-full blur opacity-30 animate-pulse" />
            <History className="h-8 w-8 text-[#6E3AFF] relative" />
            </div>
            <h2 className="text-3xl font-bold text-white">Past Launches</h2>
          </div>

          {/* Subtitle with improved contrast */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-gray-400 text-sm">
              Previously launched products
            </span>
            <div className="h-1 w-20 bg-gradient-to-r from-[#6E3AFF] to-transparent rounded-full" />
          </div>
        </div>

        <div className="space-y-6">
          {data?.pages.map((page, pageIndex) =>
            page.items.map((product, productIndex) => (
              <div
                key={product.id}
                className={cn(
                  "w-full transform transition-all duration-500",
                  "hover:translate-y-[-2px]",
                  // Add fade-in animation for new items
                  "animate-fade-in-up",
                  // Delay animation based on index
                  `animation-delay-${(pageIndex * page.items.length + productIndex) % 5}`
                )}
              >
                <ProductCard
                  product={{
                    ...product,
                    createdAt: new Date(product.createdAt),
                    launchDate: new Date(product.launchDate),
                    categories: product.categories,
                    _count: {
                      votes: product._count?.votes || 0,
                      comments: product._count?.comments || 0,
                    }
                  }}
                  variant="default"
                  showVoting={true}
                  disableVoting={true}
                />
              </div>
            ))
          )}
        </div>

        {/* Infinite scroll loader */}
        <div
          ref={ref}
          className={cn(
            "mt-8 flex justify-center",
            isFetchingNextPage ? "opacity-100" : "opacity-0",
            "transition-opacity duration-300"
          )}
        >
          {isFetchingNextPage && (
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-6 w-6 text-[#6E3AFF] animate-spin" />
              <span className="text-sm text-gray-400">Loading more products...</span>
            </div>
          )}
        </div>

        {/* End of list indicator */}
        {!hasNextPage && data?.pages.some(page => page.items.length > 0) && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#151725] border border-[#2A2B3C]">
              <span className="text-sm text-gray-400">You&apos;ve reached the end</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}