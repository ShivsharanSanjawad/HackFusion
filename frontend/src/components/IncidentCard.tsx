import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MapPin, Clock, ArrowRight, MoreVertical, Eye } from 'lucide-react';
import { Incident } from '@/data/mockData';
import { GlassCard, LayeredCard } from './ui/cards';
import { StatusBadge, PriorityBadge, CategoryBadge, UpvoteButton } from './ui/badges';
import { MiniMap } from './IncidentMap';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface IncidentCardProps {
  incident: Incident;
  variant?: 'default' | 'compact' | 'detailed';
  onUpvote?: () => void;
  onClick?: () => void;
  showMap?: boolean;
  delay?: number;
}

export function IncidentCard({
  incident,
  variant = 'default',
  onUpvote,
  onClick,
  showMap = false,
  delay = 0,
}: IncidentCardProps) {
  const timeAgo = formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true });

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        whileHover={{ x: 5 }}
        onClick={onClick}
        className="flex items-center gap-4 p-4 glass-card cursor-pointer group"
      >
        <CategoryBadge category={incident.category} showLabel={false} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate group-hover:text-primary transition-colors">
            {incident.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{incident.location.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={incident.priority} size="sm" />
          <StatusBadge status={incident.status} size="sm" />
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="relative"
      >
        <LayeredCard className="overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <CategoryBadge category={incident.category} />
              <div>
                <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                <h3 className="font-semibold text-lg">{incident.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} pulse />
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-4">{incident.description}</p>

          {/* Map */}
          {showMap && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <MiniMap lat={incident.location.lat} lng={incident.location.lng} height="150px" />
            </div>
          )}

          {/* Location & Time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{incident.location.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              {onUpvote && (
                <UpvoteButton count={incident.upvotes} onUpvote={onUpvote} />
              )}
              {incident.images.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {incident.images.length} photo{incident.images.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {incident.assignedTo && (
                <span className="text-xs text-muted-foreground">
                  Assigned to {incident.assignedTo.name}
                </span>
              )}
              {onClick && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </motion.button>
              )}
            </div>
          </div>
        </LayeredCard>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <GlassCard className="relative overflow-hidden">
        {/* Priority indicator line */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1',
            incident.priority === 'critical' && 'bg-danger',
            incident.priority === 'high' && 'bg-orange-500',
            incident.priority === 'medium' && 'bg-warning',
            incident.priority === 'low' && 'bg-success'
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3 pl-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CategoryBadge category={incident.category} showLabel={false} size="sm" />
              <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
            </div>
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {incident.title}
            </h3>
          </div>
          <button className="p-1 rounded hover:bg-muted transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 pl-4">
          {incident.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={incident.status} size="sm" pulse />
            <PriorityBadge priority={incident.priority} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {incident.upvotes}
            </div>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </GlassCard>
    </motion.div>
  );
}
