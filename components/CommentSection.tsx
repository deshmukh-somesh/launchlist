"use client";

import { useState ,useEffect} from "react";
import { trpc } from "@/app/_trpc/client";
import { useInView } from "react-intersection-observer";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



interface CommentSectionProps {
  productId: string;
  currentUser: {
    id: string;
    email: string;
    name: string;
    imageUrl: string | null;
  };
}

export default function CommentSection({ productId, currentUser }: CommentSectionProps) {
  const { isAuthenticated } = useKindeBrowserClient();
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { ref, inView } = useInView();
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = trpc.comment.getProductComments.useInfiniteQuery(
    {
      productId,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const utils = trpc.useContext();

  const addComment = trpc.comment.create.useMutation({
    onSuccess: () => {
      setComment("");
      utils.comment.getProductComments.invalidate({ productId });
    }
  });

  const deleteComment = trpc.comment.delete.useMutation({
    onSuccess: () => {
      utils.comment.getProductComments.invalidate({ productId });
    }
  });

  const editComment = trpc.comment.edit.useMutation({
    onSuccess: () => {
      setEditingId(null);
      utils.comment.getProductComments.invalidate({ productId });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment.mutate({
      productId,
      content: comment.trim()
    });
  };

  const handleEdit = (commentId: string) => {
    editComment.mutate({
      commentId,
      content: editContent.trim()
    });
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate({ commentId });
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      deleteComment.mutate({ commentId: commentToDelete });
      setCommentToDelete(null);
    }
  };

  // Load more comments when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>

      {/* Comment Form */}
      {isAuthenticated && currentUser && (
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0">
            {currentUser.imageUrl ? (
              <img
                src={currentUser.imageUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  {currentUser.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={!comment.trim() || addComment.isPending}
              >
                {addComment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {data?.pages.map((page) =>
          page.items.map((comment) => (
            <div key={comment.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {comment.user.avatarUrl ? (
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.name || ''}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {comment.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{comment.user.name}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy, h:mm a')}
                      </span>
                    </div>
                    
                    {/* Edit/Delete buttons */}
                    {comment.user.id === currentUser?.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(comment.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleEdit(comment.id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-700">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div ref={ref} className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 