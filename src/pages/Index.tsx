import { Link } from 'react-router-dom';
import { ArrowRight, Gavel, Shield, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/auction/ProductCard';
import { CategoryCard } from '@/components/auction/CategoryCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('status', 'active')
    .gt('auction_end', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data || []) as unknown as Product[];
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []) as Category[];
};

export default function Index() {
  const { user } = useAuth();
  
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary animate-fade-in">
              <Zap className="h-4 w-4" />
              Live auctions happening now
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover & Bid on{' '}
              <span className="text-gradient-gold">Extraordinary</span> Items
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Join thousands of collectors and enthusiasts in the premier online auction marketplace. 
              From rare art to luxury collectibles, find your next treasure.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/auctions">
                <Button variant="hero" size="xl">
                  Explore Auctions
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link to="/auth?mode=signup">
                  <Button variant="outline" size="xl">
                    Get $1,000 to Start
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Auctions', value: '10,000+' },
              { label: 'Verified Sellers', value: '5,000+' },
              { label: 'Items Sold', value: '$50M+' },
              { label: 'Happy Customers', value: '100K+' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Browse Categories
              </h2>
              <p className="text-muted-foreground mt-2">
                Explore auctions by category
              </p>
            </div>
            <Link to="/categories">
              <Button variant="ghost">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category, i) => (
              <div key={category.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Live Auctions
              </h2>
              <p className="text-muted-foreground mt-2">
                Bid on these items before time runs out
              </p>
            </div>
            <Link to="/auctions">
              <Button variant="ghost">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, i) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50">
              <Gavel className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Active Auctions Yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to list an item for auction!</p>
              {user ? (
                <Link to="/sell">
                  <Button variant="gold">List Your Item</Button>
                </Link>
              ) : (
                <Link to="/auth?mode=signup">
                  <Button variant="gold">Sign Up to Sell</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Why Choose <span className="text-gradient-gold">BidVault</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              The most trusted platform for online auctions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Transactions',
                description: 'Your payments and personal information are protected with bank-grade encryption.',
              },
              {
                icon: Zap,
                title: 'Real-time Bidding',
                description: 'Experience live auctions with instant bid updates and countdown timers.',
              },
              {
                icon: Trophy,
                title: 'Verified Sellers',
                description: 'All sellers are verified to ensure authentic items and reliable transactions.',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl bg-card/50 border border-border/50 text-center hover:border-primary/50 transition-all duration-300 hover:glow-gold-sm animate-fade-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-card">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Ready to Start Bidding?
              </h2>
              <p className="text-xl text-muted-foreground">
                Create your free account today and receive $1,000 in starting balance to begin your auction journey.
              </p>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Gavel className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-gradient-gold">BidVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BidVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
