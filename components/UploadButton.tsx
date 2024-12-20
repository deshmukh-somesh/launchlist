"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import DropZone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/hooks/useUploadThing";
import { toast } from "sonner";
import { trpc } from "@/app/_trpc/client";

interface UploadButtonProps {
  productId: string;
  onUploadComplete?: (urls: string[]) => void;
}

const UploadDropzone = ({ productId, onUploadComplete }: UploadButtonProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { startUpload } = useUploadThing("productImage", {
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const { mutate: uploadImages } = trpc.product.uploadImages.useMutation({
    onSuccess: (data) => {
      toast.success("Images uploaded successfully");
      if (Array.isArray(data)) {
        onUploadComplete?.(data.map((img: { url: string }) => img.url));
      }
    },
    onError: (error) => {
      toast.error(`Error uploading images: ${error.message}`);
    },
  });

  return (
    <DropZone
      multiple={true}
      maxFiles={4}
      maxSize={4 * 1024 * 1024} // 4MB
      accept={{
        'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg',]
      }}
      onDrop={async (acceptedFiles) => {
        try {
          setIsUploading(true);

          const res = await startUpload(acceptedFiles);

          if (!res) {
            throw new Error('Upload failed');
          }

          const urls = res.map(file => file.url);
          
          uploadImages({
            urls,
            productId,
          });

        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Upload failed');
        } finally {
          setIsUploading(false);
        }
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div {...getRootProps()} className="border h-64 m-4 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-zinc-500">Images (up to 4MB each)</p>
              </div>

              {acceptedFiles.length > 0 && (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles.length} files selected
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading... {uploadProgress}%
                  </div>
                </div>
              )}

              <input {...getInputProps()} type="file" id="dropzone-file" className="hidden" />
            </label>
          </div>
        </div>
      )}
    </DropZone>
  );
};

const UploadButton = (props: UploadButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload Images</Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone {...props} />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;