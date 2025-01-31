import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import  MaxWidthWrapper  from "@/components/MaxWidthWrapper";

interface LoadingSkeletonProps {
  variant?: 'upcoming' | 'winner' | 'yesterday' | 'default' | 'product';
}

export default function LoadingSkeleton({ variant = 'default' }: LoadingSkeletonProps) {
  const getTitle = () => {
    switch (variant) {
      case 'upcoming':
        return "Launching Today";
      case 'winner':
        return "Today's Winners";
      case 'yesterday':
        return "Yesterday's Winners";
      default:
        return "Past Launches";
    }
  };

  if (variant === 'product') {
    return (
      <MaxWidthWrapper className="py-10">
        <div className="bg-[#151725] rounded-xl border border-[#2A2B3C] p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="w-full aspect-video bg-[#1A1C2E] rounded-lg animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-[#1A1C2E] rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-[#1A1C2E] rounded-lg w-1/2 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 bg-[#1A1C2E] rounded-full w-20 animate-pulse" />
                <div className="h-6 bg-[#1A1C2E] rounded-full w-20 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#1A1C2E] rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#1A1C2E] rounded w-24 animate-pulse" />
                  <div className="h-3 bg-[#1A1C2E] rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <div className="py-12 relative">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/5 to-transparent pointer-events-none" /> */}
      <div className="absolute" />
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white">
              {getTitle()}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-400 text-sm">Vote for the product that you like the most!</span>
              <div className="h-1 w-20 bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] rounded-full" />
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="relative flex items-start gap-6 p-4 sm:p-5 rounded-xl bg-[#151725] border border-[#2A2B3C] w-full max-w-4xl mx-auto"
            >
              {/* Product Image */}
              <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                <Skeleton className="w-full h-full rounded-lg bg-[#1A1C2E]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <Skeleton className="h-6 w-48 mb-2 bg-[#1A1C2E]" /> {/* Title */}
                    <Skeleton className="h-4 w-96 bg-[#1A1C2E]" /> {/* Tagline */}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-1">
                    <Skeleton className="w-12 h-12 rounded-lg bg-[#1A1C2E]" />
                    <Skeleton className="w-12 h-12 rounded-lg bg-[#1A1C2E]" />
                    <Skeleton className="w-12 h-12 rounded-lg bg-[#1A1C2E]" />
                  </div>
                </div>

                {/* Categories and Maker Info */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-[#1A1C2E]" />
                    <Skeleton className="h-6 w-20 rounded-full bg-[#1A1C2E]" />
                    <Skeleton className="h-6 w-20 rounded-full bg-[#1A1C2E]" />
                  </div>

                  {/* Maker Info */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full bg-[#1A1C2E]" />
                    <Skeleton className="h-4 w-24 bg-[#1A1C2E]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}