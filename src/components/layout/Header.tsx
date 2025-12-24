import { Link, useNavigate } from 'react-router-dom';
import { Gavel, User, LogOut, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Gavel className="h-8 w-8 text-primary" />
          <span className="font-display text-2xl font-bold text-gradient-gold">
            BidVault
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/auctions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Live Auctions
          </Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/sell">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Sell Item
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-medium">{profile?.full_name || 'User'}</span>
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        ${profile?.balance?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wallet" className="cursor-pointer">
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet (${profile?.balance?.toFixed(2) || '0.00'})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="gold" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
