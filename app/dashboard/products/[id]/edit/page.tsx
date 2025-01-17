"use client";

import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import ProductForm from '@/components/ProductForm';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { toast } from '@/components/ui/use-toast';
import { TRPCError } from '@trpc/server';
import { TRPCClientErrorBase } from '@trpc/client';
// import { DefaultErrorShape } from '@trpc/server/unstable-core-do-import';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DefaultErrorShape } from '@trpc/server/unstable-core-do-not-import';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const { data: product, isLoading, error } = trpc.product.getProductById.useQuery(
    { id: id as string },
    { 
      enabled: !!id,
      retry: false
    }
  );

  // Handle errors
  if (error) {
    const err = error as TRPCClientErrorBase<DefaultErrorShape>;
    
    toast({
      title: 'Error',
      description: getErrorMessage(err.message),
      variant: 'destructive',
    });
    
    // Return error state instead of immediate redirect
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="p-6 bg-[#151725] border border-[#2A2B3C] rounded-xl shadow-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {getErrorTitle(err.message)}
            </h3>
            <p className="text-gray-400 mb-6">
              {getErrorMessage(err.message)}
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-[#2A2B3C] hover:border-[#6E3AFF] text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 animate-fade-in-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-white">
            <Loader2 className="h-5 w-5 animate-spin text-[#6E3AFF]" />
            <span>Loading product details...</span>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="p-6 bg-[#151725] border border-[#2A2B3C] rounded-xl shadow-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Product Not Found
            </h3>
            <p className="text-gray-400 mb-6">
              We couldn't find the product you're looking for.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-[#2A2B3C] hover:border-[#6E3AFF] text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formData = {
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    description: product.description,
    website: product.website,
    pricing: product.pricing,
    launchDate: new Date(product.launchDate).toISOString().split('T')[0],
    isLaunched: product.isLaunched,
    thumbnail: product.thumbnail || ''
  };

  return (
    <div className="p-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400">Edit Product</span>
        </div>

        {/* Form container */}
        <div className="bg-[#151725] border border-[#2A2B3C] rounded-xl shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-white mb-6">
              Edit {product.name}
            </h1>
            <ProductForm
              initialData={formData}
              productId={product.id}
              isEditing={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for error handling
function getErrorTitle(message: string): string {
  switch (message) {
    case 'Product not found':
      return 'Product Not Found';
    case 'Not authorized to view this product':
      return 'Access Denied';
    default:
      return 'Error Occurred';
  }
}

function getErrorMessage(message: string): string {
  switch (message) {
    case 'Product not found':
      return 'We couldn\'t find the product you\'re looking for.';
    case 'Not authorized to view this product':
      return 'You don\'t have permission to view or edit this product.';
    default:
      return 'An unexpected error occurred while loading the product.';
  }
}