import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Gavel, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;
        
        toast({
          title: 'Welcome to BidVault!',
          description: 'Your account has been created. You now have $1,000 starting balance!',
        });
        navigate('/');
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <Gavel className="h-10 w-10 text-primary" />
              <span className="font-display text-3xl font-bold text-gradient-gold">BidVault</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSignUp 
                ? 'Join the premier auction platform and start bidding today' 
                : 'Sign in to access your bids and auctions'}
            </p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-10"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </span>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>

              {isSignUp && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-center text-muted-foreground">
                    🎉 New users receive <span className="text-primary font-semibold">$1,000</span> starting balance!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image/Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-card items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-8 animate-float">
            <Gavel className="h-12 w-12 text-primary" />
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground">
            The Premier Online <span className="text-gradient-gold">Auction</span> Platform
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover rare collectibles, luxury items, and unique treasures. 
            Bid with confidence on thousands of verified listings.
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Active Auctions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Happy Bidders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">$5M+</p>
              <p className="text-sm text-muted-foreground">Items Sold</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
