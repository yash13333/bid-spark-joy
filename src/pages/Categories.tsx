import { Header } from '@/components/layout/Header';
import { CategoryCard } from '@/components/auction/CategoryCard';
import { supabase, type Category } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchCategoriesWithCounts = async (): Promise<{ category: Category; count: number }[]> => {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (catError) throw catError;

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('category_id')
    .eq('status', 'active')
    .gt('auction_end', new Date().toISOString());

  if (prodError) throw prodError;

  const counts = (products || []).reduce((acc: Record<string, number>, p) => {
    acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    return acc;
  }, {});

  return (categories || []).map((cat) => ({
    category: cat as Category,
    count: counts[cat.id] || 0,
  }));
};

export default function Categories() {
  const { data: categoriesWithCounts = [], isLoading } = useQuery({
    queryKey: ['categories-with-counts'],
    queryFn: fetchCategoriesWithCounts,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Browse Categories
          </h1>
          <p className="text-muted-foreground">
            Explore auctions by category to find what you're looking for
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesWithCounts.map(({ category, count }, i) => (
              <div key={category.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                <CategoryCard category={category} productCount={count} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
