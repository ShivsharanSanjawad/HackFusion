import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 2,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) =>
    prefix + current.toFixed(decimals) + suffix
  );
  const [displayValue, setDisplayValue] = useState(prefix + '0' + suffix);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [value, spring, display]);

  return (
    <motion.span
      className={cn('tabular-nums font-display', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {displayValue}
    </motion.span>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  icon?: React.ReactNode;
  delay?: number;
}

export function StatCard({ title, value, suffix, prefix, trend, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-primary rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-2 rounded-lg bg-primary/10 text-primary"
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        <div className="flex items-end gap-2">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            className="text-3xl font-bold text-foreground"
          />
          
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={cn(
                'flex items-center gap-1 text-sm font-medium mb-1',
                trend.positive ? 'text-success' : 'text-danger'
              )}
            >
              <svg
                className={cn('w-3 h-3', !trend.positive && 'rotate-180')}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {trend.value}%
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    danger: 'stroke-danger',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={colorClasses[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedCounter
            value={progress}
            suffix="%"
            className="text-xl font-bold"
          />
        </div>
      )}
    </div>
  );
}

interface TimelineProps {
  items: {
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    icon?: React.ReactNode;
    status?: 'completed' | 'current' | 'pending';
  }[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative space-y-6 pl-6">
      {/* Connecting line */}
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />
      
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Node */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
            className={cn(
              'absolute -left-6 w-4 h-4 rounded-full border-2 border-background',
              item.status === 'completed' && 'bg-success',
              item.status === 'current' && 'bg-primary animate-pulse',
              item.status === 'pending' && 'bg-muted'
            )}
          />
          
          <div className="glass-card p-4 ml-4">
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span className="font-medium text-foreground">{item.title}</span>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <span className="text-xs text-muted-foreground mt-2 block">
              {new Date(item.timestamp).toLocaleString()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
