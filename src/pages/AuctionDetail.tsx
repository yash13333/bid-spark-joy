import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CountdownTimer } from '@/components/auction/CountdownTimer';
import { BidHistory } from '@/components/auction/BidHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Product, type Bid } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchProduct = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      seller:profiles!products_seller_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as unknown as Product;
};

const fetchBids = async (productId: string): Promise<Bid[]> => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:profiles!bids_bidder_id_fkey(*)
    `)
    .eq('product_id', productId)
    .order('amount', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Bid[];
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [bidAmount, setBidAmount] = useState('');

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['bids', id],
    queryFn: () => fetchBids(id!),
    enabled: !!id,
  });

  // Subscribe to real-time bid updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`bids-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `product_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bids', id] });
          queryClient.invalidateQueries({ queryKey: ['product', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const placeBidMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !profile || !product) throw new Error('Not authenticated');
      
      if (amount > profile.balance) {
        throw new Error('Insufficient balance');
      }

      if (amount <= product.current_price) {
        throw new Error('Bid must be higher than current price');
      }

      const { error } = await supabase.from('bids').insert({
        product_id: product.id,
        bidder_id: user.id,
        amount,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Bid Placed!',
        description: `Your bid of $${bidAmount} has been placed successfully.`,
      });
      setBidAmount('');
      queryClient.invalidateQueries({ queryKey: ['bids', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bid Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Bid',
        description: 'Please enter a valid bid amount',
        variant: 'destructive',
      });
      return;
    }
    placeBidMutation.mutate(amount);
  };

  const minBid = product ? product.current_price + 1 : 0;
  const isAuctionActive = product && new Date(product.auction_end) > new Date() && product.status === 'active';
  const isOwnProduct = user && product && user.id === product.seller_id;

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="h-40 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Auction Not Found</h1>
          <p className="text-muted-foreground mb-6">This auction doesn't exist or has been removed.</p>
          <Link to="/auctions">
            <Button variant="gold">Browse Auctions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-card">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {isAuctionActive && (
                <Badge className="absolute top-4 left-4 bg-live text-foreground animate-pulse">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-foreground animate-ping inline-block" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {product.title}
            </h1>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Timer */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Remaining</span>
                  <CountdownTimer endTime={product.auction_end} size="lg" />
                </div>
              </CardContent>
            </Card>

            {/* Price Section */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-4xl font-bold text-primary">
                      ${product.current_price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Starting Price</p>
                    <p className="text-lg text-foreground">${product.starting_price.toLocaleString()}</p>
                  </div>
                </div>

                {isAuctionActive && !isOwnProduct && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder={`Min bid: $${minBid}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="pl-8"
                          min={minBid}
                          disabled={!user}
                        />
                      </div>
                      <Button
                        variant="gold"
                        onClick={handlePlaceBid}
                        disabled={!user || placeBidMutation.isPending}
                      >
                        {placeBidMutation.isPending ? 'Placing...' : 'Place Bid'}
                      </Button>
                    </div>

                    {!user && (
                      <p className="text-sm text-center text-muted-foreground">
                        <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
                        {' '}to place a bid
                      </p>
                    )}

                    {user && profile && (
                      <p className="text-sm text-center text-muted-foreground">
                        Your balance: <span className="text-primary font-semibold">${profile.balance.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                )}

                {isOwnProduct && (
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <p className="text-muted-foreground">This is your listing</p>
                  </div>
                )}

                {!isAuctionActive && (
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <p className="text-muted-foreground">This auction has ended</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            {product.seller && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seller</p>
                      <p className="font-medium text-foreground">{product.seller.full_name || 'Anonymous'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Bid History ({bids.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BidHistory bids={bids} currentUserId={user?.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
