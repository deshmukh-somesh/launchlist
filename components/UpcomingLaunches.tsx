"use client";

// import { trpc } from "@/app/_trpc/client";
// import { formatDistanceToNow, isTomorrow, differenceInSeconds } from "date-fns";
// import { Badge } from "./ui/badge";
// import { Clock } from "lucide-react";
// import { useState, useEffect } from "react";
// import ProductCard from "./ProductCard";

// interface CountdownTime {
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function UpcomingLaunches() {
//   const [countdown, setCountdown] = useState<CountdownTime>({ hours: 0, minutes: 0, seconds: 0 });

//   const { data: products } = trpc.product.getUpcoming.useQuery(
//     undefined,
//     {
//       refetchInterval: 30000,
//       refetchOnWindowFocus: true,
//     }
//   );

//   // Filter for tomorrow's launches
//   const tomorrowLaunches = products?.filter(product => 
//     isTomorrow(new Date(product.launchDate))
//   ).sort((a, b) => 
//     new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime()
//   ) ?? [];

//   // Calculate countdown values
//   const calculateTimeLeft = (targetDate: Date): CountdownTime => {
//     const totalSeconds = Math.max(0, differenceInSeconds(targetDate, new Date()));

//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     return { hours, minutes, seconds };
//   };

//   // Update countdown every second
//   useEffect(() => {
//     if (!tomorrowLaunches.length) return;

//     const timer = setInterval(() => {
//       const nextLaunch = new Date(tomorrowLaunches[0].launchDate);
//       setCountdown(calculateTimeLeft(nextLaunch));
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [tomorrowLaunches]);

//   // Format number to always show two digits
//   const formatNumber = (num: number): string => {
//     return num.toString().padStart(2, '0');
//   };

//   return (
//     <div className="py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex items-center justify-between mb-8">
//           <h2 className="text-3xl font-bold">Tomorrow's Launches</h2>
//           {tomorrowLaunches.length > 0 && (
//             <div className="flex items-center gap-4">
//               <Clock className="w-5 h-5 text-blue-600" />
//               <div className="text-2xl font-mono font-bold text-blue-600">
//                 {formatNumber(countdown.hours)}:{formatNumber(countdown.minutes)}:{formatNumber(countdown.seconds)}
//               </div>
//             </div>
//           )}
//         </div>

//         {tomorrowLaunches.length > 0 ? (
//           <div className="space-y-6">
//             {tomorrowLaunches.map((product) => (
//               <div key={product.id} className="max-w-7xl mx-5">
//                 <ProductCard 
//                   product={{
//                     ...product,
//                     createdAt: new Date(product.createdAt),
//                     launchDate: new Date(product.launchDate),
//                     categories: product.categories
//                   }}
//                   variant="upcoming"
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-gray-500">
//             No launches scheduled for tomorrow.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";
import { trpc } from "@/app/_trpc/client";
import ProductCard from "./ProductCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { Rocket, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UpcomingLaunches() {
  const { data: products, isLoading } = trpc.product.getUpcoming.useQuery(
    undefined,
    { 
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    }
  );

  // Check if voting is closed (after 21:00 UTC)
  const isVotingClosed = () => {
    const now = new Date();
    return now.getUTCHours() >= 21;
  };

  if (isLoading) {
    return <LoadingSkeleton variant="upcoming" />;
  }

  // Sort and calculate rankings
  const sortedProducts = products?.sort((a, b) => {
    if (isVotingClosed()) {
      // After 21:00 UTC, sort by votes (highest to lowest)
      const votesDiff = (b._count?.votes || 0) - (a._count?.votes || 0);
      if (votesDiff === 0) {
        // If votes are tied, sort by earliest launch time
        return new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
      }
      return votesDiff;
    }
    // Before 21:00 UTC, sort by launch time
    return new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
  }) ?? [];

  // Calculate rankings and ties for winners
  const getProductRank = (product: typeof sortedProducts[0], index: number) => {
    if (!isVotingClosed() || !product) return undefined;
    
    // Only show ranks for top 3
    if (index >= 3) return undefined;

    // Find all products with the same vote count
    const sameVoteProducts = sortedProducts.filter(
      p => (p._count?.votes || 0) === (product._count?.votes || 0)
    );

    // Check if there's a tie
    const isTied = sameVoteProducts.length > 1;

    // Find the actual rank (1, 2, or 3)
    const rank = sortedProducts.findIndex(
      p => (p._count?.votes || 0) === (product._count?.votes || 0)
    ) + 1;

    return { rank, isTied };
  };

  return (
    <div className="py-12 relative">
      {/* Subtle gradient background effect */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6E3AFF]/5 to-transparent pointer-events-none" /> */}

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center max-w-4xl mx-auto justify-between mb-9">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className={cn(
                  "absolute -inset-1 rounded-full blur opacity-30 animate-pulse",
                  isVotingClosed() ? "bg-[#FFD700]" : "bg-[#6E3AFF]"
                )} />
                {isVotingClosed() ? (
                  <Trophy className="h-8 w-8 text-[#FFD700] relative" />
                ) : (
                  <Rocket className="h-8 w-8 text-[#6E3AFF] relative" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white">
                {isVotingClosed() ? "Today's Winners" : "Launching Today"}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-400 text-sm">
                {isVotingClosed() 
                  ? "Final results for today's launches" 
                  : "Vote for the product that you like the most!"}
              </span>
              <div className={cn(
                "h-1 w-20 bg-gradient-to-r rounded-full",
                isVotingClosed() 
                  ? "from-[#FFD700] to-transparent"
                  : "from-[#6E3AFF] to-transparent"
              )} />
              
            </div>
          </div>
        </div>

        {sortedProducts.length > 0 ? (
          <div className="space-y-6">
            {sortedProducts.map((product, index) => {
              const ranking = getProductRank(product, index);
              
              return (
                <div
                  key={product.id}
                  className="transform transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <ProductCard
                    product={{
                      ...product,
                      createdAt: new Date(product.createdAt),
                      launchDate: new Date(product.launchDate),
                      categories: product.categories,
                      _count: {
                        votes: product._count?.votes || 0,
                        comments: product._count?.comments || 0,
                      }
                    }}
                    variant={isVotingClosed() ? "winner" : "upcoming"}
                    rank={ranking?.rank}
                    isTied={ranking?.isTied}
                    showVoting={!isVotingClosed()}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto rounded-xl border border-[#2A2B3C] bg-[#151725] p-8 text-center">
            {isVotingClosed() ? (
              <>
                <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No winners yet today</p>
                <p className="text-gray-500 mt-2">Check back tomorrow for new launches!</p>
              </>
            ) : (
              <>
                <Rocket className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No launches scheduled for today</p>
                <p className="text-gray-500 mt-2">Check back soon for new products!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}