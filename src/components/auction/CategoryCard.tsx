import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/lib/supabase';

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

export function CategoryCard({ category, productCount = 0 }: CategoryCardProps) {
  return (
    <Link to={`/auctions?category=${category.id}`}>
      <Card className="group overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-gold-sm h-full">
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={category.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {productCount} {productCount === 1 ? 'item' : 'items'}
          </span>
          <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
            Browse
            <ArrowRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
