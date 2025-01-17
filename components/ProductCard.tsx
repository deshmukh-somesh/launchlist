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
            1: '🥇 1st Place',
            2: '🥈 2nd Place',
            3: '🥉 3rd Place'
        };

        return (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white px-3 py-1 rounded-full shadow-lg transform rotate-12">
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

    return (
        <>
            <div className="relative flex items-center space-x-6 p-6 rounded-lg transition-all duration-200 w-full max-w-6xl mx-auto border border-[#2A2B3C] bg-[#151725] hover:bg-[#1A1C2E] group">
                {getWinnerBadge()}
                
                <div className="flex-shrink-0 w-32 h-32">
                    {product.thumbnail ? (
                        <Image
                            src={product.thumbnail}
                            alt={product.name}
                            className="object-cover rounded-lg transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100px, 128px"
                            width={128}
                            height={128}    
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1A1C2E] rounded-lg" />
                    )}
                </div>

                <div className="flex-grow min-w-0 px-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Link
                            href={`/products/${product.slug}`}
                            className="text-2xl font-semibold text-white hover:text-[#6E3AFF] transition-colors truncate"
                        >
                            {product.name}
                        </Link>
                    </div>

                    <p className="text-gray-400 mt-2 text-lg">{product.tagline}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {product.categories.map((cat) => (
                            <Badge
                                key={cat.category.id}
                                variant="outline"
                                className="text-xs border-[#2A2B3C] bg-[#1A1C2E] text-gray-300"
                            >
                                {cat.category.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center justify-center flex-col gap-1">
                            {isAuthenticated ? (
                                <button 
                                    onClick={handleVoteClick}
                                    disabled={toggleVote.isPending}
                                    className={`flex items-center justify-center flex-col hover:scale-110 transition-transform 
                                        ${toggleVote.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Heart 
                                        className={`w-5 h-5 ${hasVoted ? 'fill-[#6E3AFF]' : ''} text-[#6E3AFF]`} 
                                    />
                                    <span className="text-gray-400">{optimisticVotes}</span>
                                </button>
                            ) : (
                                <LoginLink 
                                    className="flex items-center justify-center flex-col hover:scale-110 transition-transform cursor-pointer"
                                >
                                    <Heart className="w-5 h-5 text-[#6E3AFF]" />
                                    <span className="text-gray-400">{optimisticVotes}</span>
                                </LoginLink>
                            )}
                        </div>

                        <div className="flex items-center justify-center flex-col gap-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowCommentDialog(true);
                                }}
                                className="flex items-center justify-center flex-col hover:scale-110 transition-transform cursor-pointer"
                            >
                                <MessageCircle className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">
                                    {commentCount}
                                </span>
                            </button>
                        </div>

                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(product.website, '_blank', 'noopener,noreferrer');
                            }}
                            className="cursor-pointer text-gray-400 hover:text-[#6E3AFF] transition-colors flex-shrink-0 mb-6"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <Avatar className={cn(
                            "h-6 w-6",
                            "border border-[#2A2B3C]"
                        )}>
                            {product.maker.avatarUrl ? (
                                <AvatarImage
                                    src={product.maker.avatarUrl}
                                    alt={product.maker.name || ''}
                                    className="object-cover"
                                />
                            ) : (
                                <AvatarFallback 
                                    className={cn(
                                        "bg-[#1A1C2E]",
                                        "text-[#6E3AFF]",
                                        "font-medium"
                                    )}
                                >
                                    {product.maker.name 
                                        ? product.maker.name[0].toUpperCase() 
                                        : product.maker.username ? product.maker.username[0].toUpperCase() : '?'}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <span className="text-sm text-gray-400">
                            {product.maker.name || ''}
                        </span>
                    </div>
                </div>
            </div>

            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#151725] border-[#2A2B3C]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <span>Comments on {product.name}</span>
                            <span className="text-sm text-gray-400">
                                ({commentCount})
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
                            <p className="text-gray-400 mb-4">
                                Please sign in to join the discussion
                            </p>
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