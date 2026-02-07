import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  IncidentStatus, 
  IncidentPriority, 
  IncidentCategory, 
  statusConfig, 
  priorityConfig, 
  categoryConfig 
} from '@/data/mockData';
import { Zap, Droplets, Construction, Trash2, Lightbulb } from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const categoryIcons = {
  power: Zap,
  water: Droplets,
  roads: Construction,
  sanitation: Trash2,
  streetlights: Lightbulb,
};

export function StatusBadge({ status, pulse = false, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const isActive = status === 'in-progress' || status === 'reported';

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        config.bgColor,
        config.color,
        pulse && isActive && 'animate-pulse-slow'
      )}
    >
      {isActive && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              status === 'in-progress' ? 'bg-warning' : 'bg-gray-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              status === 'in-progress' ? 'bg-warning' : 'bg-gray-400'
            )}
          />
        </span>
      )}
      {config.label}
    </motion.span>
  );
}

interface PriorityBadgeProps {
  priority: IncidentPriority;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        sizeClasses[size],
        config.bgColor,
        config.color,
        priority === 'critical' && 'animate-pulse'
      )}
    >
      {priority === 'critical' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
        </span>
      )}
      {config.label}
    </motion.span>
  );
}

interface CategoryBadgeProps {
  category: IncidentCategory;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryBadge({ category, showLabel = true, size = 'md' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = categoryIcons[category];
  
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-muted',
        sizeClasses[size]
      )}
    >
      <Icon className={cn(iconSizes[size], config.color)} />
      {showLabel && (
        <span className="font-medium text-foreground">{config.label}</span>
      )}
    </motion.div>
  );
}

interface UpvoteButtonProps {
  count: number;
  onUpvote: () => void;
  upvoted?: boolean;
}

export function UpvoteButton({ count, onUpvote, upvoted = false }: UpvoteButtonProps) {
  return (
    <motion.button
      whileHover={!upvoted ? { scale: 1.05 } : {}}
      whileTap={!upvoted ? { scale: 0.95 } : {}}
      onClick={() => !upvoted && onUpvote()}
      disabled={upvoted}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer',
        upvoted
          ? 'bg-primary text-primary-foreground cursor-not-allowed'
          : 'bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary'
      )}
    >
      <svg
        className={cn('w-4 h-4 transition-transform', upvoted && 'animate-bounce')}
        fill={upvoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="font-semibold tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      {upvoted && <span className="text-xs font-medium">Voted</span>}
    </motion.button>
  );
}
