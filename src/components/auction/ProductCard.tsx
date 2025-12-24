import { Link } from 'react-router-dom';
import { Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from './CountdownTimer';
import type { Product } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isLive = new Date(product.auction_end) > new Date() && product.status === 'active';
  const priceIncrease = product.current_price - product.starting_price;
  const priceIncreasePercent = ((priceIncrease / product.starting_price) * 100).toFixed(0);

  return (
    <Link to={`/auction/${product.id}`}>
      <Card className="group overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-gold-sm">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          
          {isLive && (
            <Badge className="absolute top-3 left-3 bg-live text-foreground animate-pulse">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-foreground animate-ping inline-block" />
              LIVE
            </Badge>
          )}
          
          {product.category && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              {product.category.name}
            </Badge>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <CountdownTimer endTime={product.auction_end} size="sm" />
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
              <p className="text-xl font-bold text-primary">
                ${product.current_price.toLocaleString()}
              </p>
            </div>
            
            {priceIncrease > 0 && (
              <div className="flex items-center gap-1 text-success text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+{priceIncreasePercent}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span>Starting: ${product.starting_price.toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              View Details
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
