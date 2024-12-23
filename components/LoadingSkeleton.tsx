import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-64" /> {/* Title skeleton */}
        </div>

        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="max-w-7xl mx-5">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image skeleton */}
                    <Skeleton className="h-[200px] w-full md:w-[300px] rounded-lg" />
                    
                    <div className="flex-1 space-y-4">
                      {/* Title and tagline */}
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>

                      {/* Categories */}
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>

                      {/* Launch date and stats */}
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
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