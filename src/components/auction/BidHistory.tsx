import { formatDistanceToNow } from 'date-fns';
import { User, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Bid } from '@/lib/supabase';

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
}

export function BidHistory({ bids, currentUserId }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No bids yet. Be the first to bid!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {bids.map((bid, index) => {
          const isCurrentUser = bid.bidder_id === currentUserId;
          const isHighest = index === 0;

          return (
            <div
              key={bid.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                isHighest 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-secondary/50'
              } ${isCurrentUser ? 'ring-1 ring-primary/50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isHighest ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                    {bid.bidder?.full_name || 'Anonymous'}
                    {isCurrentUser && <span className="text-xs ml-2 text-muted-foreground">(You)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${isHighest ? 'text-primary text-lg' : 'text-foreground'}`}>
                  ${bid.amount.toLocaleString()}
                </p>
                {isHighest && (
                  <span className="text-xs text-primary">Highest Bid</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
