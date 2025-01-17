import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="py-12 relative">
      {/* Matching gradient background from UpcomingLaunches */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-8">
          {/* Title skeleton with gradient beneath */}
          <div className="space-y-1">
            <Skeleton className="h-10 w-64 bg-[#1E1F2E]" />
            <div className="h-1 w-20 bg-gradient-to-r from-[#6E3AFF]/20 to-[#2563EB]/20 rounded-full" />
          </div>
        </div>

        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="max-w-7xl mx-5"
            >
              <Card className="bg-[#151725] border border-[#2A2B3C] hover:border-[#6E3AFF]/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image skeleton with subtle gradient */}
                    <Skeleton className="h-[200px] w-full md:w-[300px] rounded-lg bg-[#1E1F2E] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2A2B3C]/10 to-transparent animate-shimmer" />
                    </Skeleton>
                    
                    <div className="flex-1 space-y-4">
                      {/* Title and tagline */}
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4 bg-[#1E1F2E]" />
                        <Skeleton className="h-4 w-1/2 bg-[#1E1F2E]" />
                      </div>

                      {/* Categories */}
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 bg-[#1E1F2E]" />
                        <Skeleton className="h-6 w-20 bg-[#1E1F2E]" />
                      </div>

                      {/* Launch date and stats */}
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32 bg-[#1E1F2E]" />
                        <Skeleton className="h-4 w-20 bg-[#1E1F2E]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}