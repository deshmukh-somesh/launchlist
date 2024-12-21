import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatDistance, isFuture, isPast, isToday } from "date-fns";
import { Clock, ExternalLink, Trophy } from "lucide-react";

interface ProductCardProps {
    product: {
        id: string;
        slug: string;
        name: string;
        tagline: string;
        thumbnail: string | null;
        createdAt: Date;
        launchDate: Date;
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
        };
    };
    variant?: 'upcoming' | 'winner' | 'yesterday' | 'default';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
    const isUpcoming = isFuture(product.launchDate);
    const isLaunchedToday = isToday(product.launchDate);
    const timeUntilLaunch = isUpcoming ? formatDistance(product.launchDate, new Date()) : null;

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
                <div className="flex items-center space-x-2">
                    <Link 
                        href={`/products/${product.slug}`}
                        className="text-2xl font-semibold hover:text-blue-600 transition-colors truncate"
                    >
                        {product.name}
                    </Link>
                    {/* Updated external link handling */}
                    <div 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(product.website, '_blank', 'noopener,noreferrer');
                        }}
                        className="cursor-pointer text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </div>
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
                    <span className="text-sm text-gray-500">
                        ❤️ {product._count?.votes || 0}
                    </span>
                    <span className="text-sm text-gray-500">
                        💬 0
                    </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        {product.maker.avatarUrl && (
                            <img
                                src={product.maker.avatarUrl}
                                alt={product.maker.name || ''}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <span className="text-sm text-gray-600">{product.maker.name}</span>
                </div>
            </div>
        </div>
    );
} 