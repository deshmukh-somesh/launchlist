import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Rocket, Link as LinkIcon, ImageIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productDetails: any;
  isLoading: boolean;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  productDetails,
  isLoading,
}: ProductDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-[#1A1C2E] border border-[#2A2B3C] text-white p-4">
        <DialogHeader className="mb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-200">
            <Eye className="h-5 w-5 text-[#6E3AFF]" />
            Product Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6E3AFF]" />
          </div>
        ) : productDetails ? (
          <div className="space-y-4 overflow-y-auto">
            {/* Top Section with Thumbnail and Basic Info */}
            <div className="flex gap-3 items-start">
              {/* Thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#151725] border border-[#2A2B3C] flex-shrink-0">
                {productDetails.thumbnail ? (
                  <Image
                    src={productDetails.thumbnail}
                    alt={productDetails.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{productDetails.name}</h3>
                <p className="text-sm text-gray-400 truncate">{productDetails.tagline}</p>
              </div>

              {/* Pricing Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#6E3AFF]/20 text-[#6E3AFF]">
                {productDetails.pricing}
              </span>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-3">
                {/* Website */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Website</label>
                  <a
                    href={productDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#151725] border border-[#2A2B3C] text-[#6E3AFF] hover:text-[#6E3AFF]/80 transition-colors text-sm"
                  >
                    <LinkIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{productDetails.website}</span>
                  </a>
                </div>

                {/* Launch Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Launch Date</label>
                  <div className="p-2 rounded-lg bg-[#151725] border border-[#2A2B3C] text-sm">
                    {format(new Date(productDetails.launchDate), 'PPP')}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <div className="p-2 rounded-lg bg-[#151725] border border-[#2A2B3C] text-sm h-[100px] overflow-y-auto">
                  {productDetails.description}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A2B3C]">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-8 bg-[#151725] text-white border-[#2A2B3C] hover:bg-[#2A2B3C]"
              >
                Close
              </Button>
              <Link href={`/products/${productDetails.slug}`}>
                <Button
                  variant="default"
                  className="h-8 bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] text-white hover:opacity-90"
                >
                  <Rocket className="h-4 w-4 mr-1.5" />
                  View Live
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}