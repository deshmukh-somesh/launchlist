"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/app/_trpc/client";
import { 
  ArrowUpCircle,
  MessageCircle, 
  Rocket,
  FolderHeart,
  Plus
} from 'lucide-react';

// Types based on your schema
type DashboardProduct = {
  id: string;
  name: string;
  tagline: string;
  thumbnail: string | null;
  pricing: 'FREE' | 'PAID' | 'SUBSCRIPTION';
  _count: {
    votes: number;
    comments: number;
  };
};

export default function DashboardMain() {
  const router = useRouter();
  const { data, isLoading } = trpc.product.getDashboardProducts.useQuery();

  const handleNewProduct = () => {
    router.push('/dashboard/products/new');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Overview */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Upvotes</p>
                <p className="text-2xl font-bold">{data?.totalVotes ?? 0}</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Comments</p>
                <p className="text-2xl font-bold">{data?.totalComments ?? 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Products</p>
                <p className="text-2xl font-bold">{data?.totalProducts ?? 0}</p>
              </div>
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Products</h2>
              <Button onClick={handleNewProduct}>
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </div>

            {/* Products List */}
            <div className="grid gap-4">
              {isLoading ? (
                // Loading skeleton
                Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-4">
                          <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
                          <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                data?.products.map((product: DashboardProduct) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Product Thumbnail */}
                        <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg flex-shrink-0">
                          {product.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-gray-600 text-sm mt-1">
                                {product.tagline}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                              {product.pricing}
                            </span>
                          </div>

                          <div className="flex gap-4 mt-4">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <ArrowUpCircle className="h-4 w-4" />
                              {product._count.votes}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MessageCircle className="h-4 w-4" />
                              {product._count.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collections">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Collections</h2>
              <Button variant="outline">
                <FolderHeart className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Collections will be mapped here */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Collection Name</h3>
                  <p className="text-sm text-gray-600 mt-1">Collection description</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">0 products</span>
                    <span className="text-sm text-gray-500">Public</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}