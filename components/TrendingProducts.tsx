"use client";

import { trpc } from "@/app/_trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDistance } from "date-fns";

export default function TrendingProducts() {
  const { data: products, isLoading } = trpc.trending.getTrendingProducts.useQuery(
    { timeframe: "WEEK", limit: 6 }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-3/4 mt-4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Trending This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Link href={`/products/${product.slug}`} key={product.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{product.tagline}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                      <img
                        src={product.maker.avatarUrl || '/default-avatar.png'}
                        alt={product.maker.name || 'Maker'}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-500">
                        {product.maker.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistance(new Date(product.createdAt), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 