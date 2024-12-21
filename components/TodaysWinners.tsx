"use client";

import { trpc } from "@/app/_trpc/client";
import LoadingSkeleton from "./LoadingSkeleton";
import ProductCard from "./ProductCard";
import { keepPreviousData } from "@tanstack/react-query";
import type { Product } from "@/types/product";

export default function TodaysWinners() {
  const { data: products, isLoading } = trpc.product.getTodaysWinners.useQuery(undefined, {
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-3xl font-bold">Today's Winners 🏆</h2>
          <span className="text-sm text-gray-500">
            (Top voted products launched today)
          </span>
        </div>
        
        {products && products.length > 0 ? (
          <div className="space-y-6">
            {products.map((product: Product) => (
              <div key={product.id} className="w-full">
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    createdAt: new Date(product.createdAt),
                    launchDate: new Date(product.launchDate),
                    categories: product.categories,
                    website: product.website // Ensure website is included
                  }}
                  variant="winner"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No winners yet today. Check back later!
          </p>
        )}
      </div>
    </div>
  );
} 