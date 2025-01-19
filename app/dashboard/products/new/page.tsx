import NewProductForm from "@/components/NewProductForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] bg-[#0A0B14] animate-fade-in-up">
      {/* Gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/5 to-transparent pointer-events-none" /> */}
      <div className="absolute" />
      <div className="max-w-4xl mx-auto relative">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-400 hover:text-white"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400">New Product</span>
        </div>

        {/* Main content */}
        <div className="bg-[#151725] border border-[#2A2B3C] rounded-xl shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-white mb-6">
              Create New Product
            </h1>
            
            {/* Form container */}
            <div className="relative">
              <NewProductForm />
            </div>
          </div>
        </div>

        {/* Optional: Background pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #6E3AFF 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
}