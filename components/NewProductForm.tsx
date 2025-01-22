"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';
import { ThumbnailUploader } from "./ThumbnailUploader";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Utility function to generate slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
};

export default function NewProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue 
  } = useForm<FormInputs>({
    defaultValues: {
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


  const name = watch('name');

  // Auto-generate slug when name changes
  useEffect(() => {
    if (name && !isSlugManuallyEdited) {
      setValue('slug', generateSlug(name));
    }
  }, [name, setValue, isSlugManuallyEdited]);
  
  const utils = trpc.useContext();
  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Product created successfully!',
        variant: 'default',
      });
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

  const inputClasses = cn(
    "w-full p-3 bg-[#151725] border rounded-lg transition-colors",
    "focus:outline-none focus:ring-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "text-white placeholder-gray-500"
  );

  const inputWrapper = (hasError: boolean) => cn(
    inputClasses,
    hasError 
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
      : "border-[#2A2B3C] focus:border-[#6E3AFF] focus:ring-[#6E3AFF]/20"
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Thumbnail Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-200">
            Product Thumbnail
          </label>
          <div className="p-4 bg-[#1A1C2E] rounded-lg border border-[#2A2B3C]">
            <ThumbnailUploader
              value={watch('thumbnail')}
              onChange={(url) => setValue('thumbnail', url)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Name
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            className={inputWrapper(!!errors.name)}
            placeholder="Enter product name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Slug
          </label>
          <input
            {...register("slug", { required: "Slug is required" })}
            className={inputWrapper(!!errors.slug)}
            placeholder="product-url-slug"
            disabled={isSubmitting}
          />
          {errors.slug && (
            <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div> */}

<div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Slug
          </label>
          <div className="relative">
            <input
              {...register("slug", { required: "Slug is required" })}
              className={inputWrapper(!!errors.slug)}
              placeholder="product-url-slug"
              disabled={isSubmitting}
              onChange={(e) => {
                if (e.target.value !== generateSlug(name)) {
                  setIsSlugManuallyEdited(true);
                }
              }}
            />
            {isSlugManuallyEdited && (
              <button
                type="button"
                onClick={() => {
                  setIsSlugManuallyEdited(false);
                  setValue('slug', generateSlug(name));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300"
              >
                Reset
              </button>
            )}
          </div>
          {errors.slug && (
            <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>
          )}
          <p className="text-gray-400 text-sm mt-1">
            {isSlugManuallyEdited ? 
              "Manually edited - click Reset to auto-generate from name" : 
              "Automatically generated from name"}
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tagline
          </label>
          <input
            {...register("tagline", { required: "Tagline is required" })}
            className={inputWrapper(!!errors.tagline)}
            placeholder="Brief description of your product"
            disabled={isSubmitting}
          />
          {errors.tagline && (
            <p className="text-red-400 text-sm mt-1">{errors.tagline.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Description
          </label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className={cn(inputWrapper(!!errors.description), "min-h-[120px] resize-y")}
            placeholder="Detailed description of your product"
            rows={4}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Website
          </label>
          <input
            type="url"
            {...register("website", { required: "Website URL is required" })}
            className={inputWrapper(!!errors.website)}
            placeholder="https://your-product.com"
            disabled={isSubmitting}
          />
          {errors.website && (
            <p className="text-red-400 text-sm mt-1">{errors.website.message}</p>
          )}
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Pricing
          </label>
          <select
            {...register("pricing")}
            className={cn(inputWrapper(!!errors.pricing), "appearance-none bg-[#151725]")}
            disabled={isSubmitting}
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </div>

        {/* Launch Date */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Launch Date
          </label>
          <input
            type="date"
            {...register("launchDate", { 
              required: "Launch date is required",
              validate: (value) => {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return selectedDate >= tomorrow || "Launch date must be at least tomorrow";
              }
            })}
            min={minDate}
            className={inputWrapper(!!errors.launchDate)}
            disabled={isSubmitting}
          />
          {errors.launchDate && (
            <p className="text-red-400 text-sm mt-1">{errors.launchDate.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full p-4 rounded-lg font-medium transition-all",
            "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
            "text-white hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            "Create Product"
          )}
        </button>
      </form>
    </div>
  );
}