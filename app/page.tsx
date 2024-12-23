"use client"
import { useEffect } from 'react';
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button , buttonVariants} from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
// import TrendingProducts from "@/components/TrendingProducts";
// import FeaturedCategories from "@/components/FeaturedCategories";
import TodaysWinners from "@/components/TodaysWinners";
import YesterdayLaunches from "@/components/YesterdayLaunches";
import UpcomingLaunches from "@/components/UpcomingLaunches";
// import { Suspense } from 'react';
// import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Home() {
  // Pre-fetch data
  const utils = trpc.useContext();
  
  useEffect(() => {
    // Pre-fetch all product lists
    utils.product.getUpcoming.prefetch();
    utils.product.getTodaysWinners.prefetch();
    utils.product.getYesterday.prefetch();
  }, []);

  return (
    <>
     <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
       <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
         <p className="text-sm font-semibold text-gray-700">
          Product Launches is now Public!
         </p>
       </div>
       <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
         Discover & Share Amazing{' '}
         <span className="text-blue-600">Digital Products</span>
       </h1>
       <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
         Join the community of makers and discover the next big thing. Share your products and get valuable feedback.
       </p>
        <Link
         className={buttonVariants({
           size: 'lg',
           className: 'mt-5',
         })}
         href="/dashboard"
       >
         Get Started <ArrowRight className="ml-2 h-5 w-5" />
       </Link>
     </MaxWidthWrapper>
      {/* <TrendingProducts /> */}
     {/* <FeaturedCategories /> */}
     <div className="max-w-7xl mx-auto px-4 space-y-16">
       {/* <Suspense fallback={<LoadingSkeleton />}> */}
         <section className="bg-white rounded-xl shadow-sm">
           <UpcomingLaunches />
         </section>
       {/* </Suspense> */}

       {/* <Suspense fallback={<LoadingSkeleton />}> */}
         <section className="bg-white rounded-xl shadow-sm">
           <TodaysWinners />
         </section>
       {/* </Suspense> */}

       {/* <Suspense fallback={<LoadingSkeleton />}> */}
         <section className="bg-white rounded-xl shadow-sm">
           <YesterdayLaunches />
         </section>
       {/* </Suspense> */}
     </div>
   </>
  );
}
