import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Minus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Transaction } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []) as Transaction[];
};

export default function WalletPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user,
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error('Not authenticated');

      // Update balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: (profile?.balance || 0) + amount })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount,
        description: 'Wallet deposit',
      });

      if (txError) throw txError;
    },
    onSuccess: () => {
      toast({
        title: 'Deposit Successful',
        description: `$${depositAmount} has been added to your wallet.`,
      });
      setDepositAmount('');
      setDepositOpen(false);
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Deposit Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !profile) throw new Error('Not authenticated');

      if (amount > profile.balance) {
        throw new Error('Insufficient balance');
      }

      // Update balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - amount })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -amount,
        description: 'Wallet withdrawal',
      });

      if (txError) throw txError;
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Successful',
        description: `$${withdrawAmount} has been withdrawn from your wallet.`,
      });
      setWithdrawAmount('');
      setWithdrawOpen(false);
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your wallet.</p>
          <Button variant="gold" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'purchase':
        return <Minus className="h-4 w-4 text-destructive" />;
      case 'sale':
        return <Plus className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">
          Your Wallet
        </h1>

        {/* Balance Card */}
        <Card className="bg-gradient-card border-primary/30 mb-8">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-4xl font-bold text-primary">${profile?.balance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gold">
                      <Plus className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit Funds</DialogTitle>
                      <DialogDescription>
                        Add funds to your wallet to start bidding
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="pl-8"
                          min="1"
                        />
                      </div>
                      <Button
                        variant="gold"
                        className="w-full"
                        onClick={() => depositMutation.mutate(parseFloat(depositAmount))}
                        disabled={!depositAmount || depositMutation.isPending}
                      >
                        {depositMutation.isPending ? 'Processing...' : 'Confirm Deposit'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Minus className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Withdraw funds from your wallet (Available: ${profile?.balance?.toFixed(2)})
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-8"
                          min="1"
                          max={profile?.balance || 0}
                        />
                      </div>
                      <Button
                        variant="gold"
                        className="w-full"
                        onClick={() => withdrawMutation.mutate(parseFloat(withdrawAmount))}
                        disabled={!withdrawAmount || withdrawMutation.isPending}
                      >
                        {withdrawMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.description || formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
