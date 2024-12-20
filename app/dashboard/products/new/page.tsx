import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
      <ProductForm />
    </div>
  );
} 