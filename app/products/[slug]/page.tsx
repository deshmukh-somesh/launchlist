"use client";

import { trpc } from "@/app/_trpc/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle, Heart, ArrowLeft, Twitter, Linkedin, Instagram, Share2 } from "lucide-react";
import { formatDistance } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useState } from "react";
import CommentSection from "@/components/CommentSection";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { toast } from "@/components/ui/use-toast";
import { ShareButtons } from "@/components/ShareButtons";

export default function ProductPage() {
    const { slug } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from'); // Get the 'from' parameter
    const { isAuthenticated, user } = useKindeBrowserClient();
    const [showComments, setShowComments] = useState(false);

    const { data: product, isLoading } = trpc.product.getProduct.useQuery(
        { slug: slug as string },
        {
            enabled: !!slug,
        }
    );

    const utils = trpc.useContext();

    const toggleVote = trpc.product.toggleVote.useMutation({
        onSuccess: () => {
            utils.product.getProduct.invalidate({ slug: slug as string });
        },
    });

    // const handleShare = async (platform: 'twitter' | 'linkedin' | 'instagram' | 'copy') => {
    //     const url = window.location.href;
    //     const text = `Check out ${product?.name} - ${product?.tagline}`;
        

    //     switch (platform) {
    //         case 'twitter':
    //             window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    //             break;
    //         case 'linkedin':
    //             window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    //             break;
    //         case 'instagram':
    //             // Instagram doesn't have a direct share URL, so we'll copy the link
    //             await navigator.clipboard.writeText(url);
    //             toast({
    //                 title: "Link copied!",
    //                 description: "Share this link on Instagram",
    //             });
    //             break;
    //         case 'copy':
    //             await navigator.clipboard.writeText(url);
    //             toast({
    //                 title: "Link copied!",
    //                 description: "Link copied to clipboard",
    //             });
    //             break;
    //     }
    // };

    if (isLoading) return <LoadingSkeleton variant="product" />;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="min-h-screen bg-[#151725]">
            <MaxWidthWrapper className="py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(from === 'dashboard' ? '/dashboard' : '/')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {from === 'dashboard' ? 'Back to Dashboard' : 'Back'}
                    </Button>
                </div>

                <div className="bg-[#1A1C2E] border border-[#2A2B3C] rounded-xl p-6">
                    <div className="flex justify-end mb-4">
                        <ShareButtons title={product.name} description={product.tagline} />
                    </div>
                    {/* Product Header */}
                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Thumbnail */}

                        <div className="w-full md:w-1/3">
                            {product.thumbnail ? (
                                <Image
                                    src={product.thumbnail}
                                    alt={product.name}
                                    width={400}
                                    height={300}
                                    className="rounded-lg object-contain w-full aspect-video"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-[#1A1C2E] rounded-lg" />
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                            <p className="text-xl text-gray-400 mb-4">{product.tagline}</p>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.categories.map((cat) => (
                                    <Badge
                                        key={cat.category.id}
                                        variant="outline"
                                        className="border-[#2A2B3C] bg-[#1A1C2E] text-gray-300"
                                    >
                                        {cat.category.name}
                                    </Badge>
                                ))}
                            </div>

                            {/* Maker Info */}
                            <div className="flex items-center gap-3 mb-6">
                                <Avatar className="h-10 w-10 border border-[#2A2B3C]">
                                    <AvatarImage src={product.maker.avatarUrl || ''} />
                                    <AvatarFallback className="bg-[#1A1C2E] text-[#6E3AFF]">
                                        {product.maker.name?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-white">{product.maker.name}</div>
                                    {product.maker.twitter && (
                                        <a
                                            href={`https://twitter.com/${product.maker.twitter}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#1DA1F2] hover:underline"
                                        >
                                            @{product.maker.twitter}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={() => toggleVote.mutate({ productId: product.id })}
                                    variant={product.hasVoted ? "default" : "outline"}
                                    className="gap-2"
                                    disabled={!isAuthenticated}
                                >
                                    <Heart className={product.hasVoted ? "fill-current" : ""} />
                                    {product._count?.votes || 0} votes
                                </Button>

                                <Button
                                    onClick={() => setShowComments(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <MessageCircle />
                                    {product._count?.comments || 0} comments
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <a href={product.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink />
                                        Visit Website
                                    </a>
                                </Button>
                            </div>

                            {/* <div className="flex items-center gap-2 mt-4">
                                <span className="text-sm text-gray-400">Share:</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare('twitter')}
                                    className="hover:text-[#1DA1F2]"
                                >
                                    <Twitter className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare('linkedin')}
                                    className="hover:text-[#0A66C2]"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare('instagram')}
                                    className="hover:text-[#E4405F]"
                                >
                                    <Instagram className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare('copy')}
                                    className="hover:text-[#6E3AFF]"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div> */}

                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                        <div className="prose prose-invert max-w-none">
                            {product.description}
                        </div>
                    </div>

                    {/* Product Images */}
                    {product.images && product.images.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.images.map((image) => (
                                    <Image
                                        key={image.id}
                                        src={image.url}
                                        alt={product.name}
                                        width={600}
                                        height={400}
                                        className="rounded-lg object-cover w-full aspect-video"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
                            <CommentSection
                                productId={product.id}
                                currentUser={{
                                    id: user?.id || '',
                                    email: user?.email || '',
                                    name: user?.given_name || user?.family_name || user?.email?.split('@')[0] || 'User',
                                    imageUrl: user?.picture || null
                                }}
                            />
                        </div>
                    )}
                </div>
            </MaxWidthWrapper>
        </div>
    );
} 