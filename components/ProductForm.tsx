"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { ThumbnailUploader } from "./ThumbnailUploader";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategorySelect } from "./CategorySelect";

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
  categories: string[]; // Array of category IDs
};

interface ProductFormProps {
  initialData?: ProductFormInputs;
  productId?: string;
  isEditing?: boolean;
  readonly?: boolean;
}

// Utility function to generate slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
};

export default function ProductForm({ initialData, productId, isEditing = false, readonly = false }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories || []
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProductFormInputs>({
    defaultValues: initialData || {
      pricing: 'FREE',
      launchDate: minDate,
      thumbnail: null,
      name: '',
      slug: '',
      tagline: '',
      description: '',
      website: '',
      isLaunched: false,
      categories: []
    }
  });

  const name = watch('name');
  const slug = watch('slug');
  const thumbnail = watch('thumbnail');


  // Auto-generate slug when name changes
  useEffect(() => {
    if (name && !isSlugManuallyEdited) {
      const generatedSlug = generateSlug(name);
      setValue('slug', generatedSlug);
    }
  }, [name, setValue, isSlugManuallyEdited]);
  // TRPC queries and mutations [unchanged]
  const { data: duplicateCheck } = trpc.product.checkDuplicate.useQuery(
    {
      name,
      slug,
      excludeId: isEditing ? productId : undefined
    },
    {
      enabled: !!(name && slug),
      refetchOnWindowFocus: false
    }
  );

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

  // Validation functions [unchanged]
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

  const onSubmit = async (data: ProductFormInputs) => {
    // ... [submission logic remains unchanged]
    setIsSubmitting(true);
    try {
      if (isEditing && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          ...data,
          categoryIds: selectedCategories,
          images: [],
        });
      } else {
        await createProduct.mutateAsync({
          ...data,
          categoryIds: selectedCategories,
          images: [],
          isLaunched: false,
        });
      }
    } catch (error) {
      console.error(`Error creating product: ${error}`);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const inputClasses = cn(
    "w-full p-3 bg-[#151725] border rounded-lg transition-colors",
    "focus:outline-none focus:ring-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    errors ? "border-red-500 focus:ring-red-500" : "border-[#2A2B3C] focus:border-[#6E3AFF] focus:ring-[#6E3AFF]/20",
    "text-white placeholder-gray-500"
  );

  const inputWrapper = (hasError: boolean) => cn(
    inputClasses,
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-[#2A2B3C] focus:border-[#6E3AFF] focus:ring-[#6E3AFF]/20"
  );


  const labelClasses = "block mb-2 text-sm font-medium text-gray-200";
  const errorClasses = "text-red-400 text-sm mt-1";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Thumbnail Section */}
        <div className="space-y-4">
          <label className={labelClasses}>Product Thumbnail</label>
          <div className="p-4 bg-[#1A1C2E] rounded-lg border border-[#2A2B3C]">
            <ThumbnailUploader
              value={thumbnail}
              onChange={(url) => setValue('thumbnail', url)}
              disabled={readonly}
            />
          </div>
          {errors.thumbnail && (
            <p className={errorClasses}>{errors.thumbnail.message}</p>
          )}
        </div>

        {/* Name Field */}
        <div>
          <label className={labelClasses}>Name</label>
          <input
            {...register("name", {
              required: "Name is required",
              validate: validateName
            })}
            // className={inputClasses}
            className={inputWrapper(!!errors.name)}
            placeholder="Enter product name"
            disabled={readonly || isSubmitting}
          />
          {/* {errors.name && (
            <p className={errorClasses}>{errors.name.message}</p>
          )} */}
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Slug Field */}
        <div>
          <label className={labelClasses}>Slug</label>
          <div className="relative">
            <input
              {...register("slug", {
                required: "Slug is required",
                validate: validateSlug
              })}
              // className={inputClasses}
              className={inputWrapper(!!errors.slug)}
              placeholder="product-url-slug"
              disabled={readonly || isSubmitting}
              onChange={(e) => {
                const value = e.target.value;
                if (value !== generateSlug(name)) {
                  setIsSlugManuallyEdited(true);
                }
              }}
            />

            {!readonly && (
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
            {errors.slug && (
              <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>
            )}
            <p className="text-gray-400 text-sm mt-1">
              {isSlugManuallyEdited ?
                "Manually edited - click Reset to auto-generate from name" :
                "Automatically generated from name"}
            </p>
          </div>
          {errors.slug && (
            <p className={errorClasses}>{errors.slug.message}</p>
          )}
        </div>

        {/* Tagline Field */}
        <div>
          <label className={labelClasses}>Tagline</label>
          <input
            {...register("tagline", { required: "Tagline is required" })}
            className={inputClasses}
            placeholder="Brief description of your product"
            disabled={readonly}
          />
          {errors.tagline && (
            <p className={errorClasses}>{errors.tagline.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className={cn(inputClasses, "min-h-[120px] resize-y")}
            placeholder="Detailed description of your product"
            rows={4}
            disabled={readonly}
          />
          {errors.description && (
            <p className={errorClasses}>{errors.description.message}</p>
          )}
        </div>

        {/* Categories Field */}
        <div>
          <label className={labelClasses}>Categories</label>
          <CategorySelect
            selectedCategories={selectedCategories}
            onSelect={(categoryIds) => {
              setSelectedCategories(categoryIds);
              setValue('categories', categoryIds);
            }}
            disabled={readonly || isSubmitting}
          />
          {errors.categories && (
            <p className={errorClasses}>{errors.categories.message}</p>
          )}
        </div>
        
        {/* Website Field */}
        <div>
          <label className={labelClasses}>Website</label>
          <input
            type="url"
            {...register("website", { required: "Website URL is required" })}
            className={inputClasses}
            placeholder="https://your-product.com"
            disabled={readonly}
          />
          {errors.website && (
            <p className={errorClasses}>{errors.website.message}</p>
          )}
        </div>

        {/* Pricing Field */}
        <div>
          <label className={labelClasses}>Pricing</label>
          <select
            {...register("pricing")}
            className={cn(inputClasses, "appearance-none bg-[#151725]")}
            disabled={readonly}
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </div>

        {/* Launch Date Field */}
        <div>
          <label className={labelClasses}>Launch Date</label>
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
            className={cn(
              inputWrapper(!!errors.launchDate),
              "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"
            )}
            disabled={readonly}
          />
          {errors.launchDate && (
            <p className={errorClasses}>{errors.launchDate.message}</p>
          )}
        </div>


        {/* Submit Button */}
        {!readonly && (
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
                <span>{isEditing ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <span>{isEditing ? "Save Changes" : "Create Product"}</span>
            )}
          </button>
        )}
      </form>
    </div>
  );
}