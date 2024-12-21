"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

type FormInputs = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  website: string;
  pricing: 'FREE' | 'PAID' | 'SUBSCRIPTION';
  launchDate: string;
};

export default function NewProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    try {
      await createProduct.mutate({
        ...data,
        thumbnail: null,
        categoryIds: [], // For simplicity, we're not handling categories yet
        images: [], // For simplicity, we're not handling images yet
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {...register("launchDate", { required: "Launch date is required" })}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
} 