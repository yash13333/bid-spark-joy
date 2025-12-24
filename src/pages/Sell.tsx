import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, DollarSign, Clock, Tag } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Category } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []) as Category[];
};

export default function Sell() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    startingPrice: '',
    imageUrl: '',
    duration: '7', // days
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to list an item',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!formData.title || !formData.categoryId || !formData.startingPrice) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const startingPrice = parseFloat(formData.startingPrice);
      const auctionEnd = new Date();
      auctionEnd.setDate(auctionEnd.getDate() + parseInt(formData.duration));

      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        category_id: formData.categoryId,
        title: formData.title,
        description: formData.description || null,
        image_url: formData.imageUrl || null,
        starting_price: startingPrice,
        current_price: startingPrice,
        auction_end: auctionEnd.toISOString(),
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: 'Item Listed!',
        description: 'Your item is now live for bidding.',
      });

      navigate('/auctions');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to list item',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to list items for auction.</p>
          <Button variant="gold" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-2xl">List an Item for Auction</CardTitle>
            <CardDescription>
              Fill in the details below to create your auction listing
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Vintage Rolex Submariner 1965"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startingPrice">Starting Price ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startingPrice"
                      type="number"
                      placeholder="100"
                      value={formData.startingPrice}
                      onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                      className="pl-10"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Auction Duration *</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a direct link to your item image
                </p>
              </div>

              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? 'Creating Listing...' : 'Create Auction Listing'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
