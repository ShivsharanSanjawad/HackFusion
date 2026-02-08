import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Clock, MoreVertical, MapPin, X, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Incident, categoryConfig, statusConfig } from '@/data/mockData';
import { GlassCard } from './ui/cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Support both Incident (mockData) and Report (API) types
type IncidentLike = Incident | {
  id: string;
  description: string;
  status: string;
  priority: number;
  upvotes: number;
  entryDate: string;
  department?: { name: string };
};

interface IncidentCardProps {
  incident: IncidentLike;
  delay?: number;
  hasUpvoted?: boolean;
  onUpvote?: () => void;
  onClose?: () => void;
  onDownload?: () => void;
  isClosed?: boolean;
  isClosing?: boolean;
}

export function IncidentCard({ incident, delay = 0, hasUpvoted, onUpvote, onClose, onDownload, isClosed, isClosing }: IncidentCardProps) {
  // Handle both Incident and Report types
  const isIncident = 'title' in incident;
  const title = isIncident ? (incident as Incident).title : (incident as any).description?.split('.')[0] || 'Untitled';
  const description = isIncident ? (incident as Incident).description : (incident as any).description;
  const dateStr = isIncident ? (incident as Incident).createdAt : (incident as any).entryDate;
  const timeAgo = formatDistanceToNow(new Date(dateStr), { addSuffix: true });

  let categoryLabel = 'General';
  let statusLabel = 'Reported';
  let statusColorClass = 'bg-blue-100 text-blue-700';
  let priorityDisplay = 'Medium';

  if (isIncident) {
    const inc = incident as Incident;
    categoryLabel = categoryConfig[inc.category].label;
    statusLabel = statusConfig[inc.status].label;
    statusColorClass = inc.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
    priorityDisplay = inc.priority.charAt(0).toUpperCase() + inc.priority.slice(1);
  } else {
    const rep = incident as any;
    categoryLabel = rep.department?.name || 'General';
    statusLabel = rep.status === 'RESOLVED' ? 'Resolved' : rep.status;
    statusColorClass = rep.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : rep.status === 'CLOSED' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
    priorityDisplay = `P${rep.priority || 0}`;
  }

  // When closed, show download button instead of upvote
  if (isClosed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.01 }}
        className="group"
      >
        <GlassCard className="relative overflow-hidden border-l-4 border-l-purple-500 p-5 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] uppercase">{categoryLabel}</Badge>
                <span className="text-[10px] text-muted-foreground font-mono">#{incident.id.slice(0, 8)}</span>
              </div>
              <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px]", "bg-purple-100 text-purple-700")}>
                CLOSED
              </Badge>
              <Badge variant="outline" className="text-[10px]">{priorityDisplay}</Badge>
            </div>

            <Button
              onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
              disabled={isClosing}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              {isClosing ? 'Downloading...' : 'Download Report'}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <GlassCard className="relative overflow-hidden border-l-4 border-l-blue-500 p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase">{categoryLabel}</Badge>
              <span className="text-[10px] text-muted-foreground font-mono">#{incident.id.slice(0, 8)}</span>
            </div>
            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
          </div>
          <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px]", statusColorClass)}>
              {statusLabel}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{priorityDisplay}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {statusLabel === 'Resolved' && (
              <Button
                onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                disabled={isClosing}
                size="sm"
                variant="destructive"
                className="h-7 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                {isClosing ? 'Closing...' : 'Close'}
              </Button>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button
                onClick={(e) => { e.stopPropagation(); onUpvote?.(); }}
                className={cn("flex items-center gap-1 transition-colors", hasUpvoted && "text-blue-600 font-bold")}
              >
                <ThumbsUp className={cn("w-3 h-3", hasUpvoted && "fill-current")} />
                {incident.upvotes + (hasUpvoted ? 1 : 0)}
              </button>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}