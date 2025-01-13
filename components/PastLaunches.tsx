"use client";

import { trpc } from "@/app/_trpc/client";
import ProductCard from "./ProductCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

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

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-3xl font-bold">Past Launches</h2>
          <span className="text-sm text-gray-500">
            (Previously launched products)
          </span>
        </div>
        
        <div className="space-y-6">
          {data?.pages.map((page) =>
            page.items.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard
                  key={product.id}
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
                />
              </div>
            ))
          )}
        </div>

        <div ref={ref} className="mt-8 flex justify-center">
          {isFetchingNextPage && (
            <LoadingSkeleton />
          )}
        </div>
      </div>
    </div>
  );
} 