import { Link, useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Wallet, Plus, Clock, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/auction/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Product, type Bid } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchUserProducts = async (userId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Product[];
};

const fetchUserBids = async (userId: string): Promise<(Bid & { product: Product })[]> => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      product:products(*, category:categories(*))
    `)
    .eq('bidder_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as (Bid & { product: Product })[];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { data: myProducts = [] } = useQuery({
    queryKey: ['my-products', user?.id],
    queryFn: () => fetchUserProducts(user!.id),
    enabled: !!user,
  });

  const { data: myBids = [] } = useQuery({
    queryKey: ['my-bids', user?.id],
    queryFn: () => fetchUserBids(user!.id),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your dashboard.</p>
          <Button variant="gold" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Get unique products I've bid on
  const uniqueBiddedProducts = myBids.reduce((acc: Product[], bid) => {
    if (!acc.find(p => p.id === bid.product.id)) {
      acc.push(bid.product);
    }
    return acc;
  }, []);

  const activeListings = myProducts.filter(p => p.status === 'active' && new Date(p.auction_end) > new Date());
  const totalEarnings = myProducts.filter(p => p.status === 'sold').reduce((sum, p) => sum + p.current_price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name || 'User'}
            </h1>
            <p className="text-muted-foreground">
              Manage your auctions and bids
            </p>
          </div>
          <Link to="/sell">
            <Button variant="gold">
              <Plus className="h-4 w-4 mr-2" />
              List New Item
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Balance</p>
                  <p className="text-2xl font-bold text-primary">${profile?.balance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold text-foreground">{activeListings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids Placed</p>
                  <p className="text-2xl font-bold text-foreground">{myBids.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Listings */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              My Listings
            </h2>
          </div>

          {myProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Listings Yet</h3>
                <p className="text-muted-foreground mb-4">Start selling by listing your first item</p>
                <Link to="/sell">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* My Bids */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Items I'm Bidding On
            </h2>
          </div>

          {uniqueBiddedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uniqueBiddedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Bids</h3>
                <p className="text-muted-foreground mb-4">Browse auctions and place your first bid</p>
                <Link to="/auctions">
                  <Button variant="outline">
                    Browse Auctions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
