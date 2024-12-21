// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { trpc } from "@/app/_trpc/client";
// import { useRouter } from "next/navigation";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Textarea } from "../ui/textarea";
// import { Calendar } from "../ui/calendar";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "../ui/select";
// import { toast } from "sonner";
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { Badge } from "../ui/badge";
// import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
// import { ProductImageUpload } from "./ProductImageUpload";

// // Function to generate slug from product name
// const generateSlug = (name: string) => {
//     return name
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric chars with hyphen
//         .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
//         .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
// };

// const productSchema = z.object({
//     name: z.string().min(1, "Name is required"),
//     slug: z.string().min(1, "Slug is required"),
//     tagline: z.string().min(1, "Tagline is required"),
//     description: z.string().min(1, "Description is required"),
//     website: z.string().url("Must be a valid URL"),
//     pricing: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']),
//     launchDate: z.date(),
//     categoryIds: z.array(z.string()).min(1, "Select at least one category"),
//     thumbnail: z.string().nullable(),
// });

// type ProductFormData = z.infer<typeof productSchema>;

// export function ProductForm() {
//     const router = useRouter();
//     const [images, setImages] = useState<string[]>([]);
//     const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//     const [openCategories, setOpenCategories] = useState(false);
//     const [newCategoryOpen, setNewCategoryOpen] = useState(false);
//     const [categorySearch, setCategorySearch] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [newCategory, setNewCategory] = useState({
//         name: '',
//         description: ''
//     });

//     // Simplified categories query
//     const { 
//         data: categories = [], 
//         isLoading: categoriesLoading,
//         error: categoriesError 
//     } = trpc.category.getAll.useQuery(undefined, {
//         staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//         retry: 3
//     });

//     // Show error toast if categories fail to load
//     if (categoriesError) {
//         toast.error('Failed to load categories');
//     }

//     const { mutate: createProduct, isPending } = trpc.product.create.useMutation({
//         onSuccess: (data) => {
//             toast.success("Product created successfully!");
//             setIsSubmitting(false);
//             router.push(`/products/${data.slug}`);
//             router.refresh();
//         },
//         onError: (error) => {
//             setIsSubmitting(false);
//             toast.error(`Failed to create product: ${error.message}`);
//         },
//     });

//     const { mutate: createCategory } = trpc.category.create.useMutation({
//         onSuccess: (newCategory) => {
//             toast.success("Category created!");
//             setNewCategoryOpen(false);
//             handleCategorySelect(newCategory.id);
//             setNewCategory({ name: '', description: '' });
//         },
//         onError: (error) => {
//             toast.error(`Failed to create category: ${error.message}`);
//         },
//     });

//     const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
//         resolver: zodResolver(productSchema),
//         defaultValues: {
//             categoryIds: [],
//             pricing: "FREE",
//             launchDate: new Date(),
//             name: "",
//             slug: "",
//             tagline: "",
//             description: "",
//             website: "",
//             thumbnail: null,
//         }
//     });

//     const selectedCategories = watch("categoryIds") ?? [];

//     const handleCategorySelect = (categoryId: string) => {
//         const current = watch("categoryIds") || []; // Add fallback empty array
//         const updated = current.includes(categoryId)
//             ? current.filter((id) => id !== categoryId)
//             : [...current, categoryId];
//         setValue("categoryIds", updated, {
//             shouldValidate: true,
//         });
//     };


//     const onSubmit = (data: ProductFormData) => {
//         createProduct({
//             ...data,
//             launchDate: data.launchDate.toISOString(),
//             images: images,
//             thumbnail: images[0] || null,
//         });
//     };

//     const handleCreateCategory = () => {
//         if (!newCategory.name) {
//             toast.error("Category name is required");
//             return;
//         }
//         createCategory({
//             name: newCategory.name,
//             description: newCategory.description
//         });
//     };

//     const handleImagesUpdate = (newImages: string[]) => {
//         setImages(newImages);
//         if (newImages.length > 0) {
//             setValue('thumbnail', newImages[0]);
//         } else {
//             setValue('thumbnail', null);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//             <div className="space-y-2">
//                 <label className="text-sm font-medium">Product Images</label>
//                 <ProductImageUpload
//                     value={images}
//                     onChange={handleImagesUpdate}
//                 />
//                 <p className="text-xs text-gray-500">
//                     Upload up to 4 images. First image will be used as thumbnail.
//                 </p>
//             </div>

//             <div className="space-y-4">
//                 <div>
//                     <Input {...register("name")} placeholder="Product Name" />
//                     {errors.name && (
//                         <p className="text-red-500 text-sm">{errors.name.message}</p>
//                     )}
//                 </div>

//                 <div>
//                     <div className="flex items-center gap-2">
//                         <Input
//                             {...register("slug")}
//                             placeholder="product-slug"
//                             className="font-mono"
//                         />
//                         <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => {
//                                 const name = watch("name");
//                                 if (name) {
//                                     setValue("slug", generateSlug(name));
//                                 }
//                             }}
//                         >
//                             Regenerate
//                         </Button>
//                     </div>
//                     {errors.slug && (
//                         <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
//                     )}
//                     <p className="text-sm text-gray-500 mt-1">
//                         This will be your product's URL: example.com/products/<span className="font-mono">{watch("slug") || "product-slug"}</span>
//                     </p>
//                 </div>

//                 <div>
//                     <Input {...register("tagline")} placeholder="Tagline" />
//                     {errors.tagline && (
//                         <p className="text-red-500 text-sm">{errors.tagline.message}</p>
//                     )}
//                 </div>

//                 <div>
//                     <Textarea {...register("description")} placeholder="Description" />
//                     {errors.description && (
//                         <p className="text-red-500 text-sm">{errors.description.message}</p>
//                     )}
//                 </div>

//                 <div>
//                     <Input {...register("website")} placeholder="Website URL" />
//                     {errors.website && (
//                         <p className="text-red-500 text-sm">{errors.website.message}</p>
//                     )}
//                 </div>

//                 <div>
//                     <Select onValueChange={(value) => setValue("pricing", value as any)}>
//                         <SelectTrigger>
//                             <SelectValue placeholder="Select pricing" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="FREE">Free</SelectItem>
//                             <SelectItem value="PAID">Paid</SelectItem>
//                             <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 <div className="space-y-2">
//                     <label className="text-sm font-medium">Categories</label>
//                     <Popover open={openCategories} onOpenChange={setOpenCategories}>
//                         <PopoverTrigger asChild>
//                             <Button
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-expanded={openCategories}
//                                 className="w-full justify-between"
//                                 disabled={categoriesLoading}
//                             >
//                                 {selectedCategories?.length > 0
//                                     ? `${selectedCategories.length} categories selected`
//                                     : "Select categories..."}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                             </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-full p-0">
//                             <Command>
//                                 <CommandInput
//                                     placeholder="Search categories..."
//                                     value={categorySearch}
//                                     onValueChange={setCategorySearch}
//                                 />
//                                 <CommandEmpty>
//                                     {categoriesLoading ? (
//                                         "Loading categories..."
//                                     ) : (
//                                         "No categories found."
//                                     )}
//                                 </CommandEmpty>
//                                 {!categoriesLoading && categories && (
//                                     <CommandGroup>
//                                         {categories.map((category) => (
//                                             <CommandItem
//                                                 key={category.id}
//                                                 value={category.id}
//                                                 onSelect={() => handleCategorySelect(category.id)}
//                                             >
//                                                 <Check
//                                                     className={cn(
//                                                         "mr-2 h-4 w-4",
//                                                         selectedCategories?.includes(category.id)
//                                                             ? "opacity-100"
//                                                             : "opacity-0"
//                                                     )}
//                                                 />
//                                                 {category.name}
//                                             </CommandItem>
//                                         ))}
//                                     </CommandGroup>
//                                 )}
//                             </Command>
//                         </PopoverContent>
//                     </Popover>
//                     {errors.categoryIds && (
//                         <p className="text-red-500 text-sm">{errors.categoryIds.message}</p>
//                     )}
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium mb-2">
//                         Launch Date
//                     </label>
//                     <Calendar
//                         mode="single"
//                         selected={selectedDate}
//                         onSelect={(date) => {
//                             setSelectedDate(date || new Date());
//                             if (date) setValue("launchDate", date);
//                         }}
//                         className="rounded-md border"
//                         initialFocus
//                     />
//                 </div>
//             </div>

//             <Button type="submit" disabled={isPending}>
//                 {isPending ? "Creating..." : "Create Product"}
//             </Button>
//         </form>
//     );
// } 