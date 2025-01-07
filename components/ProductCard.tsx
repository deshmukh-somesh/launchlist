import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatDistance, isFuture, isPast, isToday } from "date-fns";
import { Clock, ExternalLink, Trophy, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

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
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
    const utils = trpc.useContext();
    const [optimisticVotes, setOptimisticVotes] = useState(product._count?.votes || 0);
    const [isVoting, setIsVoting] = useState(false);

    const toggleVote = trpc.product.toggleVote.useMutation({
        onMutate: async () => {
            // Optimistically update the vote count
            setIsVoting(true);
            setOptimisticVotes(prev => prev + 1);
        },
        onSuccess: async () => {
            // Invalidate related queries to refetch latest data
            await Promise.all([
                utils.product.getUpcoming.invalidate(),
                utils.product.getTodaysWinners.invalidate(),
                utils.product.getYesterday.invalidate(),
            ]);
        },
        onError: () => {
            // Revert optimistic update on error
            setOptimisticVotes(product._count?.votes || 0);
        },
        onSettled: () => {
            setIsVoting(false);
        }
    });

    const handleVoteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVote.mutate({ productId: product.id });
    };

    const isUpcoming = isFuture(product.launchDate);
    // const isLaunchedToday = isToday(product.launchDate);
    // const timeUntilLaunch = isUpcoming ? formatDistance(product.launchDate, new Date()) : null;

    return (
        <div className="flex items-center space-x-6 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full max-w-6xl mx-auto border border-gray-200">
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
                        <button 
                            onClick={handleVoteClick}
                            disabled={isVoting}
                            className="flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            <Heart className={`w-5 h-5 ${optimisticVotes > (product._count?.votes || 0) ? 'fill-red-500' : ''} text-red-500`} />
                        </button>
                        <div>
                            {optimisticVotes}
                        </div>
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