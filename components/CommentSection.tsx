"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useInView } from "react-intersection-observer";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, Edit, Trash2, Send, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

    // TRPC mutations [unchanged]
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

    // Event handlers [unchanged]
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

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="mt-8 space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                Comments
                {/* Optional: Add comment count badge */}
                <span className="text-sm px-2 py-1 rounded-full bg-[#2A2B3C] text-gray-400">
                    {data?.pages[0]?.totalComments || 0}
                </span>
            </h3>

            {/* Comment Form - Enhanced */}
            {isAuthenticated && currentUser && (
                <div className="flex gap-3 items-start transition-all duration-200 group">
                    <div className="flex-shrink-0 transition-transform group-focus-within:scale-105">
                        {currentUser.imageUrl ? (
                            <img
                                src={currentUser.imageUrl}
                                alt={currentUser.name}
                                className="w-8 h-8 rounded-full ring-2 ring-[#6E3AFF]/20"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1C2E] to-[#2A2B3C] flex items-center justify-center">
                                <span className="text-[#6E3AFF] text-sm font-medium">
                                    {currentUser.name[0]?.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Share your thoughts..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className={cn(
                                "bg-[#1A1C2E] border-[#2A2B3C] text-white resize-none transition-all duration-200",
                                "placeholder:text-gray-500 min-h-[100px] rounded-xl",
                                "focus:border-[#6E3AFF] focus:ring-2 focus:ring-[#6E3AFF]/20",
                                "hover:border-[#6E3AFF]/50"
                            )}
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={!comment.trim() || addComment.isPending}
                                className={cn(
                                    "bg-gradient-to-r from-[#6E3AFF] to-[#2563EB]",
                                    "text-white font-medium px-6 rounded-xl",
                                    "transition-all duration-200 transform",
                                    "hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#6E3AFF]/20",
                                    "disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none",
                                    "flex items-center gap-2"
                                )}
                            >
                                {addComment.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Post Comment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments List - Enhanced */}
            <div className="relative">
                <div className="absolute top-0 left-0 right-4 h-8 bg-gradient-to-b from-[#151725] to-transparent pointer-events-none z-10" />

                {/* Bottom fade gradient */}
                <div className="absolute bottom-0 left-0 right-4 h-8 bg-gradient-to-t from-[#151725] to-transparent pointer-events-none z-10" />
                <div className="relative max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                    <div className="space-y-4">
                        {data?.pages.map((page, pageIndex) =>
                            page.items.map((comment, commentIndex) => (
                                <div
                                    key={comment.id}
                                    className={cn(
                                        "p-4 rounded-xl transition-all duration-200",
                                        "bg-gradient-to-br from-[#151725] to-[#1A1C2E]",
                                        "border border-[#2A2B3C] hover:border-[#6E3AFF]/30",
                                        "group animate-fade-in-up",
                                        "hover:shadow-lg hover:shadow-[#6E3AFF]/5",
                                        `animation-delay-${(pageIndex * page.items.length + commentIndex) % 5}`
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 transition-transform group-hover:scale-105">
                                            {comment.user.avatarUrl ? (
                                                <img
                                                    src={comment.user.avatarUrl}
                                                    alt={comment.user.name || ''}
                                                    className="w-8 h-8 rounded-full ring-2 ring-[#2A2B3C] group-hover:ring-[#6E3AFF]/30"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1C2E] to-[#2A2B3C] flex items-center justify-center">
                                                    <span className="text-[#6E3AFF] text-sm font-medium">
                                                        {comment.user.name?.[0]?.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white group-hover:text-[#6E3AFF] transition-colors">
                                                        {comment.user.name}
                                                    </p>
                                                    <span className="text-xs text-gray-400">
                                                        {format(new Date(comment.createdAt), 'MMM d, yyyy, h:mm a')}
                                                    </span>
                                                </div>

                                                {comment.user.id === currentUser?.id && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(comment.id);
                                                                setEditContent(comment.content);
                                                            }}
                                                            className="p-1 rounded-lg hover:bg-[#2A2B3C] text-gray-400 hover:text-[#6E3AFF] transition-all"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(comment.id)}
                                                            className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {editingId === comment.id ? (
                                                <div className="space-y-2 animate-fade-in">
                                                    <Textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="bg-[#1A1C2E] border-[#2A2B3C] text-white min-h-[100px] rounded-xl
                          focus:border-[#6E3AFF] focus:ring-2 focus:ring-[#6E3AFF]/20"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setEditingId(null)}
                                                            className="border-[#2A2B3C] text-gray-400 hover:text-white
                            hover:bg-[#2A2B3C] rounded-xl gap-2"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleEdit(comment.id)}
                                                            disabled={!editContent.trim()}
                                                            className="bg-gradient-to-r from-[#6E3AFF] to-[#2563EB] text-white
                            hover:shadow-lg hover:shadow-[#6E3AFF]/20 rounded-xl gap-2"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-300 group-hover:text-white transition-colors">
                                                    {comment.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            ))
                        )}

                        {/* Load More Button - Enhanced */}
                        {hasNextPage && (
                            <div ref={ref} className="flex justify-center py-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className={cn(
                                        "text-gray-400 hover:text-white rounded-xl",
                                        "hover:bg-[#2A2B3C] transition-all duration-200",
                                        "hover:shadow-lg hover:shadow-[#6E3AFF]/10"
                                    )}
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading more comments...
                                        </>
                                    ) : (
                                        'Load More Comments'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation Dialog - Enhanced */}
                    <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
                        <AlertDialogContent className={cn(
                            "custom-scrollbar max-h-[80vh] overflow-y-auto",
                            "bg-gradient-to-br from-[#151725] to-[#1A1C2E]",
                            "border border-[#2A2B3C] rounded-xl",
                            "shadow-2xl shadow-black/50",
                            "animate-fade-in-up",
                            "pr-6" // Extra padding for scrollbar
                        )}>
                            <AlertDialogHeader className="space-y-3">
                                <AlertDialogTitle className="text-white text-xl">
                                    Delete Comment?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400 text-base">
                                    This action cannot be undone. The comment will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel className={cn(
                                    "bg-[#1A1C2E] text-white border-[#2A2B3C]",
                                    "hover:bg-[#2A2B3C] hover:border-[#6E3AFF]/30",
                                    "rounded-xl transition-all duration-200"
                                )}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmDelete}
                                    className={cn(
                                        "bg-gradient-to-r from-red-500 to-red-600",
                                        "text-white rounded-xl",
                                        "hover:shadow-lg hover:shadow-red-500/20",
                                        "transition-all duration-200"
                                    )}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
