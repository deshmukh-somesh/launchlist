"use client";

import { trpc } from "@/app/_trpc/client";
import LoadingSkeleton from "./LoadingSkeleton";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  thumbnail: string | null;
  createdAt: string;
  launchDate: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
  maker: {
    name: string | null;
    avatarUrl: string | null;
  };
  _count: {
    votes: number;
  };

  variant?: 'upcoming' | 'winner' | 'yesterday' | 'default';
}

export default function YesterdayLaunches() {
  const { data: products, isLoading } = trpc.product.getYesterday.useQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Yesterday's Launches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product: Product) => (
             <ProductCard 
             key={product.id} 
             product={{
               ...product,
               createdAt: new Date(product.createdAt),
               launchDate: new Date(product.launchDate),
               categories: product.categories
             }}
             variant="yesterday"
           />
          ))}
        </div>
      </div>
    </div>
  );
} 