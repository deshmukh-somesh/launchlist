"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/hooks/useUploadThing";
import { UploadDropzone } from "@uploadthing/react";
import { X, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { OurFileRouter } from "@/lib/uploadthing";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";

interface ProductImageUploadProps {
  onChange: (urls: string[]) => void;
  value: string[];
}

export function ProductImageUpload({ onChange, value = [] }: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("productImage", {
    onUploadBegin: () => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
    },
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      setUploadProgress(100);
      if (res && Array.isArray(res)) {
        const urls = res.map((r) => r.url || '').filter(Boolean);
        if (urls.length > 0) {
          onChange([...value, ...urls]);
          toast.success("Images uploaded successfully");
        }
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      setError(error.message);
      toast.error(`Error uploading images: ${error.message}`);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Array.isArray(value) && value.map((url) => (
          <div key={url} className="relative aspect-square rounded-md overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="bg-rose-500 p-1 rounded-full hover:bg-rose-600 transition"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <Image
              fill
              src={url}
              alt="Product image"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(!value || value.length < 4) && (
        <>
          <UploadDropzone<OurFileRouter, "productImage">
            endpoint="productImage"
            onUploadBegin={() => {
              setIsUploading(true);
              setError(null);
            }}
            config={{
              mode: "auto"
            }}
            content={{
              allowedContent: "Image files only (JPEG, PNG, WebP) up to 4MB",
            }}
            appearance={{
              label: "text-sm",
              allowedContent: "text-xs",
              button: "ut-uploading:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90",
            }}
          />

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-1" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 