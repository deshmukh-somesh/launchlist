"use client";

import { useCallback, useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface ThumbnailUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ThumbnailUploader({ value, onChange, disabled = false }: ThumbnailUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const removeImage = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div className="w-full">
      {value ? (
        // Preview Container
        <div className="relative w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={value}
            alt="Thumbnail preview"
            fill
            className="object-contain"
          />
          {!disabled && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 
                        text-white hover:bg-red-600 transition"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="mt-2 text-sm text-gray-600">Uploading... {uploadProgress}%</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <UploadDropzone<OurFileRouter, "productImage">
            endpoint="productImage"
            config={{
              mode: "auto",
            }}
            content={{
              label: "Drop your thumbnail here",
              button: "Choose Thumbnail",
              allowedContent: "1 image up to 4MB",
                }}
            onBeforeUploadBegin={(files) => {
              setIsUploading(true);
              setUploadProgress(0);
              return [files[0]];
            }}
            onUploadProgress={(progress) => {
              setUploadProgress(Math.min(Math.round(progress), 75));
            }}
            onClientUploadComplete={(res) => {
              setUploadProgress(100);
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                if (res?.[0]) {
                  onChange(res[0].url);
                  toast({
                    title: "Image uploaded successfully",
                    variant: "default",
                  });
                }
              }, 500);
            }}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              setUploadProgress(0);
              toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive",
              });
            }}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg
            ut-label:text-gray-800 ut-label:font-medium
            ut-upload-icon:text-gray-800 ut-upload-icon:w-10 ut-upload-icon:h-10
            ut-allowed-content:text-gray-500 ut-allowed-content:text-sm
            ut-button:bg-blue-500 ut-button:text-white ut-button:rounded-md
            ut-progress:text-blue-500 ut-progress:font-bold
            ut-progress-bar:bg-blue-500"
          />
        </div>
      )}
    </div>
  );
}