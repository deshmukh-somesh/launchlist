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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

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
            username: string | null;
            twitter: string | null;
        };
        _count?: {
            votes: number;
            comments: number;
        }
        hasVoted?: boolean;
    };
    variant?: 'upcoming' | 'winner' | 'yesterday' | 'default';
    rank?: number;
    isTied?: boolean;
    showVoting?: boolean;
    disableVoting?: boolean;
}

const voteQueue = new Set<string>();
let isProcessingQueue = false;

export default function ProductCard({ product, variant = 'default', rank, isTied, showVoting, disableVoting }: ProductCardProps) {
    const utils = trpc.useContext();
    const [optimisticVotes, setOptimisticVotes] = useState(product._count?.votes || 0);
    const [hasVoted, setHasVoted] = useState(product.hasVoted || false);
    const { user, isAuthenticated } = useKindeBrowserClient();
    const router = useRouter();
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [commentCount, setCommentCount] = useState(product._count?.comments || 0);

    const toggleVote = trpc.product.toggleVote.useMutation({
        onMutate: async () => {
            if (!isAuthenticated) return;
            const previousVotes = optimisticVotes;
            const previousVoteStatus = hasVoted;
            setOptimisticVotes(current => hasVoted ? current - 1 : current + 1);
            setHasVoted(current => !current);
            return { previousVotes, previousVoteStatus };
        },
        onError: (error, variables, context) => {
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
            setOptimisticVotes(data.count);
            setHasVoted(data.hasVoted);
            utils.product.getVoteCount.invalidate({ productId: product.id });
        }
    });

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

    const getWinnerBadge = () => {
        if (variant !== 'winner' || !rank) return null;

        const badges = {
            1: isTied ? '🏆 Tied #1' : '🥇 #1',
            2: isTied ? '🏆 Tied #2' : '🥈 #2',
            3: isTied ? '🏆 Tied #3' : '🥉 #3'
        };

        return (
            <div className={cn(
                "absolute -top-4 right-4",
                "px-3 py-1.5 rounded-full",
                "font-medium text-sm",
                "shadow-lg transform",
                rank === 1 && "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white",
                rank === 2 && "bg-gradient-to-r from-[#C0C0C0] to-[#A0A0A0] text-white",
                rank === 3 && "bg-gradient-to-r from-[#CD7F32] to-[#A0522D] text-white"
            )}>
                {badges[rank as 1 | 2 | 3]}
            </div>
        );
    };

    const { data: commentData } = trpc.comment.getProductComments.useQuery(
        { productId: product.id, limit: 1 },
        {
            select: (data) => ({ totalComments: data.totalComments }),
            refetchOnWindowFocus: true
        }
    );

    useEffect(() => {
        if (commentData?.totalComments !== undefined) {
            setCommentCount(commentData.totalComments);
        }
    }, [commentData?.totalComments]);

    const name = product.maker.name
    console.log(name)

    return (
        <>
            <div className={cn(
                "relative flex items-start gap-6",
                "p-4 sm:p-5 rounded-xl",
                "bg-[#151725] border border-[#2A2B3C]",
                "hover:border-[#6E3AFF]/30 hover:bg-[#1A1C2E]",
                "group transition-all duration-200",
                "w-full max-w-4xl mx-auto"
            )}>
                {getWinnerBadge()}

                {/* Product Image */}
                <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                    {product.thumbnail ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                                src={product.thumbnail}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                                sizes="(max-width: 768px) 80px, 96px"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-lg bg-[#1A1C2E] flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-[#2A2B3C]" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0">
                            <Link
                                href={`/products/${product.slug}`}
                                className="inline-block text-lg sm:text-xl font-semibold text-white hover:text-[#6E3AFF] transition-colors line-clamp-1"
                            >
                                {product.name}
                            </Link>
                            <Link href={`https://twitter.com/${product.maker.twitter}`} target="_blank" rel="noopener noreferrer" className=" hover:text-[#6E3AFF] mt-1.3 block text-gray-400 text-xs sm:text-xs">{product.maker.twitter ? `@${product.maker.twitter}` : ''}</Link>
                            <p className="mt-1.5 text-gray-400 text-sm sm:text-base line-clamp-2">{product.tagline}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 sm:gap-1">
                            {showVoting && (
                                isAuthenticated ? (
                                    <button
                                        onClick={handleVoteClick}
                                        disabled={toggleVote.isPending || disableVoting}
                                        className={cn(
                                            "flex flex-col items-center gap-1 py-1 px-2",
                                            "rounded-lg transition-all duration-200",
                                            disableVoting
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-[#2A2B3C]/50"
                                        )}
                                    >
                                        <Heart
                                            className={cn(
                                                "w-5 h-5",
                                                hasVoted ? "fill-[#6E3AFF] text-[#6E3AFF]" : "text-gray-400"
                                            )}
                                        />
                                        <span className={cn(
                                            "text-xs",
                                            hasVoted ? "text-[#6E3AFF]" : "text-gray-400"
                                        )}>
                                            {optimisticVotes}
                                        </span>
                                    </button>
                                ) : (
                                    <LoginLink className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg hover:bg-[#2A2B3C]/50 transition-all duration-200">
                                        <Heart className="w-5 h-5 text-gray-400" />
                                        <span className="text-xs text-gray-400">{optimisticVotes}</span>
                                    </LoginLink>
                                )
                            )}

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowCommentDialog(true);
                                }}
                                className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg hover:bg-[#2A2B3C]/50 transition-all duration-200"
                            >
                                <MessageCircle className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-400">{commentCount}</span>
                            </button>

                            <a
                                href={product.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[#2A2B3C]/50 transition-all mb-5 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-5 h-5 text-gray-400 hover:text-[#6E3AFF]" />
                            </a>
                        </div>
                    </div>

                    {/* Categories and Maker Info */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            {product.categories.map((cat) => (
                                <Badge
                                    key={cat.category.id}
                                    variant="outline"
                                    className={cn(
                                        "px-2 py-0.5 text-xs",
                                        "border-[#2A2B3C] bg-[#1A1C2E]",
                                        "text-gray-300 hover:text-white",
                                        "transition-colors"
                                    )}
                                >
                                    {cat.category.name}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-[#2A2B3C]">
                                {product.maker.avatarUrl ? (
                                    <AvatarImage
                                        src={product.maker.avatarUrl}
                                        alt={product.maker.name || ''}
                                        className="object-cover"
                                    />
                                ) : (
                                    <AvatarFallback className="bg-[#1A1C2E] text-[#6E3AFF] text-xs font-medium">
                                        {product.maker.name
                                            ? product.maker.name[0].toUpperCase()
                                            : product.maker.username ? product.maker.username[0].toUpperCase() : '?'}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <span className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
                                {/* {product.maker.name || product.maker.username || 'Anonymous'} */}
                                {product.maker.name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Dialog */}
            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#151725] border-[#2A2B3C]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <span>Comments on {product.name}</span>
                            <span className="text-sm text-gray-400">({commentCount})</span>
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
                            <p className="text-gray-400 mb-4">Please sign in to join the discussion</p>
                            <LoginLink className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#6E3AFF] text-white hover:bg-[#5B2FD9] transition-colors">
                                Sign In
                            </LoginLink>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}