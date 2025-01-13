"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { ThumbnailUploader } from "./ThumbnailUploader";


export type ProductFormInputs = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  website: string;
  pricing: 'FREE' | 'PAID' | 'SUBSCRIPTION';
  launchDate: string;
  isLaunched: boolean;
  thumbnail: string | null;
};

interface ProductFormProps {
  initialData?: ProductFormInputs;
  productId?: string;
  isEditing?: boolean;
  readonly?: boolean;
}

export default function ProductForm({ initialData, productId, isEditing = false, readonly = false }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get tomorrow's date for minimum launch date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductFormInputs>({
  //   defaultValues: initialData || {
  //     pricing: 'FREE',
  //     launchDate: minDate,
  //     thumbnail: null
  //   }
  // });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProductFormInputs, any>({
    defaultValues: initialData || {
      pricing: 'FREE',
      launchDate: minDate,
      thumbnail: null,
      name: '',
      slug: '',
      tagline: '',
      description: '',
      website: '',
      isLaunched: false
    }
  });

  // Watch name and slug fields for changes
  const name = watch('name');
  const slug = watch('slug');
  const thumbnail = watch('thumbnail');
  // Check for duplicates
  const { data: duplicateCheck } = trpc.product.checkDuplicate.useQuery(
    {
      name,
      slug,
      excludeId: isEditing ? productId : undefined
    },
    {
      enabled: !!(name && slug), // Only run query when both fields have values
      refetchOnWindowFocus: false
    }
  );

  const validateName = async (value: string) => {
    if (!value) return "Name is required";
    if (duplicateCheck?.exists && duplicateCheck.field === 'name') {
      return "A product with this name already exists";
    }
    return true;
  };

  const validateSlug = async (value: string) => {
    if (!value) return "Slug is required";
    if (duplicateCheck?.exists && duplicateCheck.field === 'slug') {
      return "A product with this slug already exists";
    }
    return true;
  };

  const utils = trpc.useContext();


  const updateProduct = trpc.product.update.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Product updated successfully!',
        variant: 'default',
      });
      //   Invalidate both queries
      await Promise.all([
        utils.product.getDashboardProducts.invalidate(),
        utils.product.getProductById.invalidate({ id: productId as string })
      ])
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Error updating product',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });

  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Product created successfully!',
        variant: 'default',
      });
      //   Invalidate the dashboard products query
      await utils.product.getDashboardProducts.invalidate();
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Error creating product',
        description: error.message,
        variant: 'destructive',
      });
    }
  });



  const onSubmit = async (data: ProductFormInputs) => {
    setIsSubmitting(true);
    try {
      if (isEditing && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          ...data,
          categoryIds: [],
          images: []
        });
      } else {
        await createProduct.mutateAsync({
          ...data,
          categoryIds: [],
          images: [],
          isLaunched: false
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {readonly ? 'View Product' : isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <label className="block font-medium">Product Thumbnail</label>
          <ThumbnailUploader
            value={thumbnail}
            onChange={(url) => setValue('thumbnail', url)}
            disabled={readonly}
          />
          {errors.thumbnail && (
            <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Name</label>
          <input
            {...register("name", {
              required: "Name is required",
              validate: validateName
            })}
            className="w-full p-2 border rounded"
            disabled={readonly}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Slug</label>
          <input
            {...register("slug", {
              required: "Slug is required",
              validate: validateSlug
            })}
            className="w-full p-2 border rounded"
            disabled={readonly}
          />
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Tagline</label>
          <input
            {...register("tagline", { required: "Tagline is required" })}
            className="w-full p-2 border rounded"
            disabled={readonly}
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className="w-full p-2 border rounded"
            rows={4}
            disabled={readonly}
          />
        </div>

        <div>
          <label className="block mb-1">Website</label>
          <input
            type="url"
            {...register("website", { required: "Website URL is required" })}
            className="w-full p-2 border rounded"
            disabled={readonly}
          />
        </div>

        <div>
          <label className="block mb-1">Pricing</label>
          <select
            {...register("pricing")}
            className="w-full p-2 border rounded"
            disabled={readonly}
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Launch Date</label>
          <input
            type="date"
            {...register("launchDate", {
              required: "Launch date is required",
              validate: (value) => {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Check if selected date is at least tomorrow
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                return selectedDate >= tomorrow ||
                  "Launch date must be at least tomorrow";
              }
            })}
            min={minDate} // Always prevent selecting dates before tomorrow
            className="w-full p-2 border rounded"
            disabled={readonly}
          />
          {errors.launchDate && (
            <p className="text-red-500 text-sm mt-1">{errors.launchDate.message}</p>
          )}
        </div>

        {!readonly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
          </button>
        )}
      </form>
    </div>
  );
} 