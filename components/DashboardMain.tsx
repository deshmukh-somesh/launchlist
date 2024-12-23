"use client";

import React, { useState } from 'react';
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
  Plus,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { toast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types based on your schema
type DashboardProduct = {
  id: string;
  name: string;
  tagline: string;
  thumbnail: string | null;
  pricing: 'FREE' | 'PAID' | 'SUBSCRIPTION';
  slug: string;
  launchDate: string;
  isLaunched: boolean;
  _count: {
    votes: number;
    comments: number;
  };
};

export default function DashboardMain() {
  const router = useRouter();
  const utils = trpc.useContext();
  
  // Combine the isPending states into one
  const { data, isPending: isProductsLoading } = trpc.product.getDashboardProducts.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<DashboardProduct | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const launchProduct = trpc.product.launch.useMutation({
    onSuccess: async (data) => {
      toast({
        title: 'Product launched successfully!',
        variant: 'default',
      });
      await Promise.all([
        utils.product.getDashboardProducts.invalidate(),
        utils.product.getUpcoming.invalidate(),
        utils.product.getTodaysWinners.invalidate(),
      ]);
      // Redirect to the public product page after launch
      router.push(`/products/${data.slug}`);
    },
    onError: (error) => {
      toast({
        title: 'Error launching product',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

   // Add the delete mutation
   const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Product deleted successfully!',
        variant: 'default',
      });
      await utils.product.getDashboardProducts.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Add the handleDelete function
  const handleDelete = (productId: string) => {
    deleteProduct.mutate({ productId });
  };

  const handleNewProduct = () => {
    router.push('/dashboard/products/new');
  };

  // Rename the second isPending to avoid conflict
  const { data: productDetails, isPending: isDetailsLoading } = trpc.product.getProductById.useQuery(
    { id: selectedProduct?.id ?? '' },
    { enabled: !!selectedProduct }
  );

  // Prefetch product details when hovering over the View Form button
  const prefetchProduct = (productId: string) => {
    utils.product.getProductById.prefetch({ id: productId });
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
              <Link href="/dashboard/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Product
                </Button>
              </Link>
            </div>

            {/* Products List */}
            <div className="grid gap-4">
              {isProductsLoading ? (
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

                          <div className="flex gap-2 mt-4">
                            {!product.isLaunched ? (
                              <>
                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                  <Button variant="outline">
                                    Edit
                                  </Button>
                                </Link>
                                <Button
                                  onClick={() => launchProduct.mutate({ productId: product.id })}
                                  variant="default"
                                >
                                  Launch Product
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        product and remove it from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(product.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            ) : (
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setIsViewModalOpen(true);
                                  }}
                                  onMouseEnter={() => prefetchProduct(product.id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Form
                                </Button>
                                <Link href={`/products/${product.slug}`}>
                                  <Button variant="default">
                                    <Rocket className="h-4 w-4 mr-2" />
                                    View Live
                                  </Button>
                                </Link>
                                <span className="text-sm text-green-600 flex items-center gap-1">
                                  <Rocket className="h-4 w-4" />
                                  Launched
                                </span>
                              </div>
                            )}
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

      {/* Add the Dialog for viewing product details */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl min-h-[400px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          
          {isDetailsLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : productDetails ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  {productDetails.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tagline</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  {productDetails.tagline}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {productDetails.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  <a href={productDetails.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    {productDetails.website}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pricing</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  {productDetails.pricing}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Launch Date</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  {format(new Date(productDetails.launchDate), 'PPP')}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}