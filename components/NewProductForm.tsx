"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';
import { ThumbnailUploader } from "./ThumbnailUploader";

type FormInputs = {
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

export default function NewProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get tomorrow's date for minimum launch date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  // const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
  //   defaultValues: {
  //     pricing: 'FREE',
  //     launchDate: minDate // Set default to tomorrow
  //   }
  // });

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue 
  } = useForm<FormInputs, any>({
    defaultValues: {
      pricing: 'FREE',
      launchDate: minDate,
      thumbnail: null,  // Add this
      name: '',
      slug: '',
      tagline: '',
      description: '',
      website: '',
      isLaunched: false
    }
  });

  const utils = trpc.useContext();
  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Product created successfully!',
        variant: 'default',
      });
      // Invalidate the dashboard products query
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
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    try {
      await createProduct.mutateAsync({
        ...data,
        categoryIds: [],
        images: [],
        isLaunched: false
      });
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Add ThumbnailUploader */}
          <div className="space-y-4">
          <label className="block mb-1">Product Thumbnail</label>
          <ThumbnailUploader
            value={watch('thumbnail')}
            onChange={(url) => setValue('thumbnail', url)}
            disabled={false}
          />
        </div>
        <div>
          <label className="block mb-1">Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Slug</label>
          <input
            {...register("slug", { required: "Slug is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.slug && <p className="text-red-500">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Tagline</label>
          <input
            {...register("tagline", { required: "Tagline is required" })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1">Website</label>
          <input
            type="url"
            {...register("website", { required: "Website URL is required" })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Pricing</label>
          <select
            {...register("pricing")}
            className="w-full p-2 border rounded"
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
            min={minDate} // Prevent selecting dates before tomorrow
            className="w-full p-2 border rounded"
          />
          {errors.launchDate && (
            <p className="text-red-500 text-sm mt-1">{errors.launchDate.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
} 