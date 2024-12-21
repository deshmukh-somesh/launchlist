"use client";

import { trpc } from "@/app/_trpc/client";
import LoadingSkeleton from "./LoadingSkeleton";
import ProductCard from "./ProductCard";
import { useEffect } from 'react';

export default function UpcomingLaunches() {
  const { data: products, isLoading, isError, refetch } = trpc.product.getUpcoming.useQuery(
    undefined,
    {
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  useEffect(() => {
    refetch();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-red-500">Error loading upcoming launches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Upcoming Launches</h2>
        {products && products.length > 0 ? (
          <div className="space-y-6"> {/* Changed to vertical stack */}
            {products.map((product) => (
              <div key={product.id} className="max-w-7xl mx-5"> {/* Container for each product */}
                <ProductCard 
                  product={{
                    ...product,
                    createdAt: new Date(product.createdAt),
                    launchDate: new Date(product.launchDate),
                    categories: product.categories
                  }}
                  variant="upcoming"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No upcoming launches yet. Launch dates must be set in the future.
          </p>
        )}
      </div>
    </div>
  );
}