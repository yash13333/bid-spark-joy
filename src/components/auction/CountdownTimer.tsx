import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ endTime, onExpire, size = 'md' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onExpire?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 1000 * 60 * 60; // Less than 1 hour

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-3',
  };

  const boxClasses = {
    sm: 'px-1.5 py-0.5 min-w-[28px]',
    md: 'px-2 py-1 min-w-[40px]',
    lg: 'px-3 py-2 min-w-[56px]',
  };

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Auction Ended</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${isUrgent ? 'animate-countdown' : ''}`}>
      <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${isUrgent ? 'text-live' : 'text-primary'}`} />
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <div className={`bg-secondary rounded ${boxClasses[size]} text-center font-mono font-semibold ${isUrgent ? 'text-live' : 'text-foreground'}`}>
              {timeLeft.days}d
            </div>
          </>
        )}
        <div className={`bg-secondary rounded ${boxClasses[size]} text-center font-mono font-semibold ${isUrgent ? 'text-live' : 'text-foreground'}`}>
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <span className={isUrgent ? 'text-live' : 'text-muted-foreground'}>:</span>
        <div className={`bg-secondary rounded ${boxClasses[size]} text-center font-mono font-semibold ${isUrgent ? 'text-live' : 'text-foreground'}`}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <span className={isUrgent ? 'text-live' : 'text-muted-foreground'}>:</span>
        <div className={`bg-secondary rounded ${boxClasses[size]} text-center font-mono font-semibold ${isUrgent ? 'text-live' : 'text-foreground'}`}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
