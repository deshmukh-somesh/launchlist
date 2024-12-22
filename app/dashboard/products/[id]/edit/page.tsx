"use client";

import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import ProductForm from '@/components/ProductForm';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { toast } from 'sonner';
import { TRPCError } from '@trpc/server';
import { TRPCClientErrorBase } from '@trpc/client';
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
    switch (err.message) {
      case 'Product not found':
        toast.error('Product not found');
        break;
      case 'Not authorized to view this product':
        toast.error('You are not authorized to view this product');
        break;
      default:
        toast.error('An error occurred while loading the product');
    }
    router.push('/dashboard');
    return null;
  }

  // Handle loading and error states
  if (isLoading) return <LoadingSkeleton />;
  if (!product) return <div>Product not found</div>;

  const formData = {
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    description: product.description,
    website: product.website,
    pricing: product.pricing,
    launchDate: new Date(product.launchDate).toISOString().split('T')[0],
    isLaunched: product.isLaunched
  };

  return (
    <ProductForm
      initialData={formData}
      productId={product.id}
      isEditing={true}
    />
  );
} 