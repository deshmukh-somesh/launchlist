"use client";

import { useCallback, useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import Image from "next/image";
import { X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { cn } from "@/lib/utils";

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
    <div className="w-[100px]">
      {value ? (
        // Preview Container
        <div className={cn(
          "relative w-[100px] h-[100px] aspect-square rounded-lg overflow-hidden",
          "bg-[#151725] border border-[#2A2B3C]",
          "group hover:border-[#6E3AFF]/30 transition-colors"
        )}>
          <Image
            src={value}
            alt="Thumbnail preview"
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {!disabled && (
            <button
              onClick={removeImage}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-full",
                "bg-red-500/80 backdrop-blur-sm",
                "text-white hover:bg-red-600",
                "transition-all duration-200 opacity-0 group-hover:opacity-100",
                "hover:scale-110"
              )}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative w-[100px] h-[100px]">
          {isUploading && (
            <div className={cn(
              "absolute inset-0 z-10",
              "bg-[#151725]/90 backdrop-blur-sm",
              "flex flex-col items-center justify-center"
            )}>
              <Loader2 className="h-8 w-8 animate-spin text-[#6E3AFF]" />
              <span className="mt-2 text-sm text-gray-300">
                Uploading... {uploadProgress}%
              </span>
              <div className="w-16 h-1 bg-[#2A2B3C] rounded-full mt-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]"
                  )}
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
              label: "Drop image",
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
            className={cn(
              "bg-[#151725] border-2 border-dashed border-[#2A2B3C]",
              "hover:border-[#6E3AFF]/30 transition-all duration-200",
              "rounded-lg aspect-square max-w-[100px] max-h-[100px]",
              "ut-label:text-gray-400 ut-label:font-medium",
              "ut-upload-icon:text-[#6E3AFF] ut-upload-icon:w-10 ut-upload-icon:h-10",
              "ut-allowed-content:text-gray-500 ut-allowed-content:text-sm",
              "ut-button:bg-gradient-to-r ut-button:from-[#6E3AFF] ut-button:to-[#2563EB]",
              "ut-button:text-white ut-button:rounded-md",
              "ut-progress:text-[#6E3AFF] ut-progress:font-bold",
              "ut-progress-bar:bg-gradient-to-r ut-progress-bar:from-[#6E3AFF] ut-progress-bar:to-[#2563EB]"
            )}
          />

          {/* Optional: Add icon overlay */}
          <div className={cn(
            "absolute inset-0 pointer-events-none",
            "flex items-center justify-center",
            isUploading ? "opacity-0" : "opacity-50"
          )}>
            <ImagePlus className="w-6 h-6 text-[#6E3AFF]" />
          </div>
        </div>
      )}
    </div>
  );
}