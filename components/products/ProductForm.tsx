"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ProductImageUpload } from "./ProductImageUpload";

// Function to generate slug from product name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
};

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  }),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  website: z.string().url("Must be a valid URL"),
  pricing: z.enum(["FREE", "PAID", "SUBSCRIPTION"]),
  launchDate: z.date(),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [openCategories, setOpenCategories] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryIds: [], // Initialize with empty array
    }
  });

  // Get selected categories from form instead of separate state
  const selectedCategories = watch("categoryIds") || [];
  
  const { data: categories, isLoading: categoriesLoading } = trpc.category.getAll.useQuery();
  
  const { mutate: createProduct, isPending } = trpc.product.create.useMutation({
    onSuccess: (data) => {
      toast.success("Product created successfully!");
      router.push(`/products/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: createCategory } = trpc.category.create.useMutation({
    onSuccess: (newCategory) => {
      toast.success("Category created!");
      setNewCategoryOpen(false);
      // Add the new category to selection
      handleCategorySelect(newCategory.id);
    },
  });

  const handleCategorySelect = (categoryId: string) => {
    const current = selectedCategories;
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    setValue("categoryIds", updated);
  };

  // Watch the name field to auto-generate slug
  const name = watch("name");

  // Auto-generate slug when name changes
  useEffect(() => {
    if (name) {
      setValue("slug", generateSlug(name));
    }
  }, [name, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct({
        ...data,
        images,
        launchDate: selectedDate || new Date(),
      });
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-medium">Product Images</label>
        <ProductImageUpload
          value={images}
          onChange={(urls) => setImages(urls)}
        />
        <p className="text-xs text-gray-500">
          Upload up to 4 images. First image will be used as thumbnail.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input {...register("name")} placeholder="Product Name" />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Input 
              {...register("slug")} 
              placeholder="product-slug"
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => name && setValue("slug", generateSlug(name))}
            >
              Regenerate
            </Button>
          </div>
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            This will be your product's URL: example.com/products/<span className="font-mono">{watch("slug") || "product-slug"}</span>
          </p>
        </div>

        <div>
          <Input {...register("tagline")} placeholder="Tagline" />
          {errors.tagline && (
            <p className="text-red-500 text-sm">{errors.tagline.message}</p>
          )}
        </div>

        <div>
          <Textarea {...register("description")} placeholder="Description" />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Input {...register("website")} placeholder="Website URL" />
          {errors.website && (
            <p className="text-red-500 text-sm">{errors.website.message}</p>
          )}
        </div>

        <div>
          <Select onValueChange={(value) => setValue("pricing", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <Popover open={openCategories} onOpenChange={setOpenCategories}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCategories}
                className="w-full justify-between"
              >
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} categories selected`
                  : "Select categories..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search categories..." 
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandEmpty>
                  No categories found.
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={() => setNewCategoryOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new category
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {categories?.filter(cat => 
                    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                  ).map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => handleCategorySelect(category.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategories.includes(category.id) 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-gray-500">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCategories.map((catId) => {
              const category = categories?.find((c) => c.id === catId);
              return category ? (
                <Badge 
                  key={catId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleCategorySelect(catId)}
                >
                  {category.name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ) : null;
            })}
          </div>
          {errors.categoryIds && (
            <p className="text-red-500 text-sm">{errors.categoryIds.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Launch Date
          </label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date) setValue("launchDate", date);
            }}
            className="rounded-md border"
            initialFocus
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Product"}
      </Button>

      <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createCategory({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
              });
            }}
            className="space-y-4"
          >
            <Input name="name" placeholder="Category name" required />
            <Textarea 
              name="description" 
              placeholder="Category description (optional)" 
            />
            <Button type="submit">Create Category</Button>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
} 