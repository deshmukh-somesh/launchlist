// "use client";

// import { trpc } from "@/app/_trpc/client";
// import { Button } from "../ui/button";
// import { Textarea } from "../ui/textarea";
// import { useState } from "react";
// import { Skeleton } from "../ui/skeleton";
// import { formatDistanceToNow } from "date-fns";

// export function Comments({ productId }: { productId: string }) {
//   const [comment, setComment] = useState("");
//   const [replyingTo, setReplyingTo] = useState<string | null>(null);
//   const [replyContent, setReplyContent] = useState("");

//   const {
//     data: commentsData,
//     isLoading,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = trpc.comment.getProductComments.useInfiniteQuery(
//     {
//       productId,
//       limit: 10,
//     },
//     {
//       refetchOnWindowFocus: false,
//       getNextPageParam: (lastPage) => lastPage.nextCursor,
//       initialCursor: 0,
//     }
//   );

//   const utils = trpc.useContext();

//   const { mutate: createComment, isPending: isCreating } = trpc.comment.create.useMutation({
//     onSuccess: () => {
//       setComment("");
//       utils.comment.getProductComments.invalidate({ productId });
//     },
//   });

//   const { mutate: createReply, isPending: isReplying } = trpc.comment.create.useMutation({
//     onSuccess: () => {
//       setReplyContent("");
//       setReplyingTo(null);
//       utils.comment.getProductComments.invalidate({ productId });
//     },
//   });

//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <div key={i} className="border p-4 rounded-lg space-y-2">
//             <Skeleton className="h-4 w-32" />
//             <Skeleton className="h-4 w-full" />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="space-y-4">
//         <Textarea
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//           placeholder="Add a comment..."
//         />
//         <Button
//           onClick={() => createComment({ productId, content: comment })}
//           disabled={!comment.trim() || isCreating}
//         >
//           {isCreating ? "Posting..." : "Post Comment"}
//         </Button>
//       </div>

//       <div className="space-y-4">
//         {commentsData?.pages.map((page, pageIndex) =>
//           page.items.map((comment) => (
//             <div key={comment.id} className="border p-4 rounded-lg">
//               <div className="flex items-center gap-2 mb-2">
//                 <img
//                   src={comment.user.avatarUrl || "/default-avatar.png"}
//                   alt={comment.user.name || "User"}
//                   className="w-6 h-6 rounded-full"
//                 />
//                 <span className="font-medium">{comment.user.name}</span>
//                 <span className="text-gray-500 text-sm">
//                   {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
//                 </span>
//               </div>
//               <p className="mb-2">{comment.content}</p>
              
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setReplyingTo(comment.id)}
//               >
//                 Reply
//               </Button>

//               {replyingTo === comment.id && (
//                 <div className="mt-2 space-y-2">
//                   <Textarea
//                     value={replyContent}
//                     onChange={(e) => setReplyContent(e.target.value)}
//                     placeholder="Write a reply..."
//                   />
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       onClick={() => 
//                         createReply({
//                           productId,
//                           content: replyContent,
//                           parentId: comment.id,
//                         })
//                       }
//                       disabled={!replyContent.trim() || isReplying}
//                     >
//                       {isReplying ? "Replying..." : "Reply"}
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       onClick={() => setReplyingTo(null)}
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {comment.replies && comment.replies.length > 0 && (
//                 <div className="ml-6 mt-2 space-y-2">
//                   {comment.replies.map((reply) => (
//                     <div key={reply.id} className="border-l-2 pl-4">
//                       <div className="flex items-center gap-2 mb-1">
//                         <img
//                           src={reply.user.avatarUrl || "/default-avatar.png"}
//                           alt={reply.user.name || "User"}
//                           className="w-5 h-5 rounded-full"
//                         />
//                         <span className="font-medium text-sm">{reply.user.name}</span>
//                         <span className="text-gray-500 text-xs">
//                           {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
//                         </span>
//                       </div>
//                       <p className="text-sm">{reply.content}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))
//         )}

//         {hasNextPage && (
//           <Button
//             onClick={() => fetchNextPage()}
//             disabled={isFetchingNextPage}
//             variant="outline"
//             className="w-full"
//           >
//             {isFetchingNextPage ? "Loading more comments..." : "Load More Comments"}
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// } 