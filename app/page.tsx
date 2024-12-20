"use client"
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button , buttonVariants} from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import TrendingProducts from "@/components/TrendingProducts";
import FeaturedCategories from "@/components/FeaturedCategories";


export default function Home() {
  return (
    <>
     <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
       <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
         <p className="text-sm font-semibold text-gray-700">
           LaunchList is now Public!
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
      <TrendingProducts />
     <FeaturedCategories />
   </>
  );
}
