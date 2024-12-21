// "use client";

// import { trpc } from "@/app/_trpc/client";
// import { Card, CardContent } from "./ui/card";
// import { Skeleton } from "./ui/skeleton";
// import Link from "next/link";

// export default function FeaturedCategories() {
//   const { data: categories, isLoading } = trpc.category.getAll.useQuery();

//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
//         {Array(8).fill(0).map((_, i) => (
//           <Skeleton key={i} className="h-32 w-full" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="py-12">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl font-bold mb-8">Browse Categories</h2>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {categories?.map((category) => (
//             <Link 
//               href={`/categories/${category.name.toLowerCase()}`} 
//               key={category.id}
//             >
//               <Card className="hover:shadow-lg transition-shadow">
//                 <CardContent className="p-6">
//                   <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
//                   <p className="text-sm text-gray-600">
//                     {category._count.products} products
//                   </p>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// } 