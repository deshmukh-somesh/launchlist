import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatDistance, isFuture, isPast, isToday } from "date-fns";
import { Clock, Trophy } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    thumbnail: string | null;
    createdAt: Date;
    launchDate: Date;
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
    <Link href={`/products/${product.slug}`}>
      <Card className={`hover:shadow-lg transition-shadow ${
        variant === 'winner' ? 'border-yellow-400 bg-yellow-50' : 
        variant === 'upcoming' ? 'border-blue-400 bg-blue-50' : ''
      }`}>
        <CardHeader className="relative">
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          )}
          {/* Status Badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            {isUpcoming && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Clock className="w-4 h-4 mr-1" />
                Launches in {timeUntilLaunch}
              </Badge>
            )}
            {variant === 'winner' && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Trophy className="w-4 h-4 mr-1" />
                Winner
              </Badge>
            )}
          </div>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{product.tagline}</p>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
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

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={product.maker.avatarUrl || '/default-avatar.png'}
                alt={product.maker.name || 'Maker'}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm text-gray-500">
                {product.maker.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {product._count && (
                <Badge variant="secondary" className="text-sm">
                  ❤️ {product._count.votes}
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                {formatDistance(product.createdAt, new Date(), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 