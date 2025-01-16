import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatDistance, isFuture, isPast, isToday } from "date-fns";
import { Clock, ExternalLink, Trophy, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { trpc } from "@/app/_trpc/client";
import { useState, useEffect } from "react";

import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useKindeBrowserClient, LoginLink } from "@kinde-oss/kinde-auth-nextjs";
import CommentSection from './CommentSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ProductCardProps {
    product: {
        id: string;
        slug: string;
        name: string;
        tagline: string;
        thumbnail: string | null;
        createdAt: Date;
        launchDate: Date;
        isLaunched: boolean;
        website: string;
        categories: {
            category: {
                id: string;
                name: string;
            };
        }[];
        maker: {
            name: string | null;
            avatarUrl: string | null;
        };
        _count?: {
            votes: number;
            comments: number;
        };
        hasVoted?: boolean;
    };
    variant?: 'upcoming' | 'winner' | 'yesterday' | 'default';
    rank?: number;
}

// Create a vote queue to handle background processing
const voteQueue = new Set<string>();
let isProcessingQueue = false;

export default function ProductCard({ product, variant = 'default', rank }: ProductCardProps) {
    const utils = trpc.useContext();
    const [optimisticVotes, setOptimisticVotes] = useState(product._count?.votes || 0);
    const [hasVoted, setHasVoted] = useState(product.hasVoted || false);
    const { user, isAuthenticated } = useKindeBrowserClient();
    const router = useRouter();
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [commentCount, setCommentCount] = useState(product._count?.comments || 0);

    const toggleVote = trpc.product.toggleVote.useMutation({
        onMutate: async () => {
            // Don't perform optimistic update if not authenticated
            if (!isAuthenticated) {
                return;
            }

            // Store previous values
            const previousVotes = optimisticVotes;
            const previousVoteStatus = hasVoted;

            // Perform optimistic update
            setOptimisticVotes(current => hasVoted ? current - 1 : current + 1);
            setHasVoted(current => !current);

            // Return previous values for rollback
            return { previousVotes, previousVoteStatus };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context) {
                setOptimisticVotes(context.previousVotes);
                setHasVoted(context.previousVoteStatus);
            }
            
            toast({
                title: "Error",
                description: error.message || "Failed to vote",
                variant: "destructive"
            });
        },
        onSuccess: (data) => {
            // Update with actual server data
            setOptimisticVotes(data.count);
            setHasVoted(data.hasVoted);
            
            // Invalidate relevant queries
            utils.product.getVoteCount.invalidate({ productId: product.id });
        }
    });

    // Periodically refresh vote count
    useEffect(() => {
        const interval = setInterval(() => {
            utils.product.getVoteCount.fetch({ productId: product.id })
                .then(count => {
                    if (count !== optimisticVotes) {
                        setOptimisticVotes(count);
                    }
                });
        }, 5000);

        return () => clearInterval(interval);
    }, [product.id]);

    const handleVoteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            const loginLink = document.querySelector('[data-kinde-login-link]') as HTMLElement;
            if (loginLink) {
                loginLink.click();
            }
            return;
        }
        
        toggleVote.mutate({ productId: product.id });
    };

    const isUpcoming = isFuture(product.launchDate);
    // const isLaunchedToday = isToday(product.launchDate);
    // const timeUntilLaunch = isUpcoming ? formatDistance(product.launchDate, new Date()) : null;

    const getWinnerBadge = () => {
        if (variant !== 'winner' || !rank) return null;
        
        const badges = {
            1: '🥇 1st Place',
            2: '🥈 2nd Place',
            3: '🥉 3rd Place'
        };

        return (
            <div className="absolute -top-3 -right-3 bg-yellow-400 text-white px-3 py-1 rounded-full shadow-lg transform rotate-12">
                {badges[rank as 1 | 2 | 3]}
            </div>
        );
    };

    // Add state for showing comments
    const [showComments, setShowComments] = useState(false);

    // Get comment count
    const { data: commentData } = trpc.comment.getProductComments.useQuery(
        { productId: product.id, limit: 1 },
        {
            select: (data) => ({ totalComments: data.totalComments }),
            refetchOnWindowFocus: true
        }
    );

    // Update comment count when data changes
    useEffect(() => {
        if (commentData?.totalComments !== undefined) {
            setCommentCount(commentData.totalComments);
        }
    }, [commentData?.totalComments]);

    return (
        <>
            <div className="relative flex items-center space-x-6 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full max-w-6xl mx-auto border border-gray-200">
                {getWinnerBadge()}
                {/* Left side - Thumbnail */}
                <div className="flex-shrink-0 w-32 h-32">
                    {product.thumbnail ? (
                        <Image
                            src={product.thumbnail}
                            alt={product.name}
                            className=" object-cover rounded-lg"
                            sizes="(max-width: 768px) 100px, 128px"
                            width={128}
                            height={128}    
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg" />
                    )}
                </div>

                {/* Middle - Product Info */}
                <div className="flex-grow min-w-0 px-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Link
                            href={`/products/${product.slug}`}
                            className="text-2xl font-semibold hover:text-blue-600 transition-colors truncate"
                        >
                            {product.name}
                        </Link>
                        {/* Updated external link handling */}
                        {/* <div 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(product.website, '_blank', 'noopener,noreferrer');
                            }}
                            className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </div> */}
                    </div>

                    <p className="text-gray-600 mt-2 text-lg">{product.tagline}</p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {product.categories.map((cat) => (
                            <Badge
                                key={cat.category.id}
                                variant="outline"
                                className="text-xs"
                            >
                                {cat.category.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Right side - Metadata */}
                <div className="flex flex-col items-end gap-2">
                    <div className="mt-2 flex items-center gap-2">
                        {/* <span className="text-sm text-gray-500"> */}
                        {/* <div className="flex items-center gap-1">
                            <Heart className="w-5 h-5 text-red-500" /> 
                            {product._count?.votes || 0}
                        </div> */}
                        <div className="flex items-center justify-center flex-col gap-1">
                            {isAuthenticated ? (
                                <button 
                                    onClick={handleVoteClick}
                                    disabled={toggleVote.isPending}
                                    className={`flex items-center justify-center flex-col hover:scale-110 transition-transform 
                                        ${toggleVote.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Heart 
                                        className={`w-5 h-5 ${hasVoted ? 'fill-red-500' : ''} text-red-500`} 
                                    />
                                    <span className="ml-1">{optimisticVotes}</span>
                                </button>
                            ) : (
                                <LoginLink 
                                    className="flex items-center justify-center flex-col hover:scale-110 transition-transform cursor-pointer"
                                >
                                    <Heart className="w-5 h-5 text-red-500" />
                                    <span className="ml-1">{optimisticVotes}</span>
                                </LoginLink>
                            )}
                        </div>

                        {/* </span> */}
                        {/* <span className="text-sm text-gray-500"> */}
                        <div className="flex items-center justify-center flex-col gap-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowCommentDialog(true);
                                }}
                                className="flex items-center justify-center flex-col hover:scale-110 transition-transform cursor-pointer"
                            >
                                <MessageCircle className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                    {product._count?.comments || 0}
                                </span>
                            </button>
                        </div>
                        {/* </span> */}
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(product.website, '_blank', 'noopener,noreferrer');
                            }}
                            className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0 mb-6"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                            {product.maker.avatarUrl && (
                                <img
                                    // width={24}
                                    // height={24}
                                    // quality={100}
                                    src={product.maker.avatarUrl}
                                    alt={product.maker.name || ''}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <span className="text-sm text-gray-600">{product.maker.name || ''}</span>
                    </div>
                </div>
            </div>

            {/* Comment Dialog */}
            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span>Comments on {product.name}</span>
                            <span className="text-sm text-gray-500">
                                ({product._count?.comments || 0})
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {isAuthenticated ? (
                        <CommentSection 
                            productId={product.id} 
                            currentUser={{
                                id: user?.id || '',
                                email: user?.email || '',
                                name: user?.given_name || user?.family_name || user?.email?.split('@')[0] || 'User',
                                imageUrl: user?.picture || null
                            }}
                        />
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600 mb-4">
                                Please sign in to join the discussion
                            </p>
                            <LoginLink className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Sign In
                            </LoginLink>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
} 