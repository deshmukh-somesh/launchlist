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
    const [hasVoted, setHasVoted] = useState(false);
    const { isAuthenticated } = useKindeBrowserClient();
    const router = useRouter();

    const toggleVote = trpc.product.toggleVote.useMutation({
        onMutate: async () => {
            if (!isAuthenticated) {
                toast({
                    title: "Login Required",
                    description: "Please login to vote",
                    variant: "destructive"
                });
                return;
            }

            setOptimisticVotes(prev => hasVoted ? prev - 1 : prev + 1);
            setHasVoted(prev => !prev);
        },
        onError: (error) => {
            setOptimisticVotes(prev => hasVoted ? prev + 1 : prev - 1);
            setHasVoted(prev => !prev);
            
            toast({
                title: "Error",
                description: error.message || "Failed to vote",
                variant: "destructive"
            });
        },
        onSuccess: () => {
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

    return (
        <div className="relative flex items-center space-x-6 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full max-w-6xl mx-auto border border-gray-200">
            {getWinnerBadge()}
            {/* Left side - Thumbnail */}
            <div className="flex-shrink-0 w-32 h-32">
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
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
                                className="flex items-center justify-center flex-col hover:scale-110 transition-transform"
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
                        <div>
                            <MessageCircle className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            {product._count?.comments || 0}
                        </div>
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
    );
} 