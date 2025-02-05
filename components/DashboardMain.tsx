"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { DashboardNav } from "@/components/dashboard/NotificationNav";
import { trpc } from "@/app/_trpc/client";
import {
  ArrowUpCircle,
  MessageCircle,
  Rocket,
  FolderHeart,
  Plus,
  Trash2,
  Eye,
  Loader2,
  UserCircle,
  CheckCircle,
  User,
  ArrowLeft,
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
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import ProductDetailsModal from './ProductDetailsModal';
import UserProfileForm from './UserProfileForm';

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
  
  // Fetch profile status
  const { data: profileStatus, isLoading: isProfileStatusLoading } = trpc.user.isProfileComplete.useQuery();
  const { data: profileData, isLoading: isProfileLoading } = trpc.user.getProfile.useQuery();
  const isProfileComplete = profileStatus?.isComplete;
  const [activeTab, setActiveTab] = useState<string>(isProfileComplete ? 'products' : 'profile');

  // Handle tab changes with profile completion check
  const handleTabChange = (value: string) => {
    if (value !== 'profile' && !isProfileComplete) {
      toast({
        title: "Complete Your Profile",
        description: "Please complete your profile information before accessing other features.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab(value);
  };

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

  // Add useEffect to handle scroll position
  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Add new mutation hook
  const cancelLaunch = trpc.product.cancelLaunch.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Launch cancelled successfully!',
        variant: 'default',
      });
      await utils.product.getDashboardProducts.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error cancelling launch',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Show loading state while determining profile status
  if (isProfileStatusLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6">
      {/* Add Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* <DashboardNav /> */}

      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <div className="bg-[#1A1C2E] border border-[#2A2B3C] p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserCircle className="h-5 w-5 text-[#6E3AFF]" />
            <div className="flex-1">
              <h3 className="font-medium text-white">Complete Your Profile</h3>
              <p className="text-sm text-gray-400">
                Please complete your profile to access all features
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs 
        value={activeTab}
        defaultValue={isProfileComplete ? 'products' : 'profile'}
        onValueChange={handleTabChange}
      >
        <TabsList className="border-b border-[#2A2B3C]">
          <TabsTrigger
            value="profile"
            className="relative"
          >
            Profile
            {isProfileComplete && (
              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="products"
            disabled={!isProfileComplete}
            className={!isProfileComplete ? "opacity-50 cursor-not-allowed" : ""}
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            // disabled={!isProfileComplete}
            disabled={true}
            className={!isProfileComplete ? "opacity-50 cursor-not-allowed" : ""}
          >
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <div className="my-4 flex justify-between items-center max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-white"></h2>
              {isProfileComplete && (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    
                    Profile Complete</span>
                </div>
              )}
            </div>

            <Card className="bg-[#1A1C2E] border-[#2A2B3C]">
              <CardContent className="p-6">
                <UserProfileForm
                  initialData={profileData || {
                    name: '',
                    bio: null,
                    website: null,
                    twitter: null,
                    github: null,
                    avatarUrl: null
                  }}
                  onComplete={async () => {
                    await utils.user.isProfileComplete.invalidate();
                    await new Promise(resolve => setTimeout(resolve, 100));
                    toast({
                      title: "Profile Complete!",
                      description: "You can now access all features.",
                      variant: "default",
                    });
                    setActiveTab('products');
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isProfileComplete && (
          <>
            <TabsContent value="products">
              <div className="space-y-6">
                <div className="flex justify-between items-center max-w-5xl mx-auto">
                  <h2 className="ml-4 text-lg font-semibold text-white"></h2>
                  <Button
                    onClick={() => router.push('/dashboard/products/new')}
                    className="bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]"
                    title="Launch dates must be within the next 14 days"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Product
                  </Button>
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
                            <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg flex-shrink-0 relative">
                              {product.thumbnail ? (
                                <Image
                                  src={product.thumbnail}
                                  alt={product.name}
                                  fill
                                  className="object-cover rounded-lg"
                                  sizes="100px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ImageIcon className="h-8 w-8" />
                                </div>
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
                                {product.isLaunched ? (
                                  <div className="flex gap-2 items-center">
                                    {!isPast(new Date(product.launchDate)) && (
                                      <Button
                                        variant="outline"
                                        onClick={() => cancelLaunch.mutate({ productId: product.id })}
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        Cancel Launch
                                      </Button>
                                    )}
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
                                ) : (
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
          </>
        )}
      </Tabs>

      <ProductDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        productDetails={productDetails}
        isLoading={isDetailsLoading}
      />
    </div>
  );
}