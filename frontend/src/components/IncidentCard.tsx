import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Clock, MoreVertical, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Report } from '../pages/CitizenDashboard'; 
import { GlassCard } from './ui/cards';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface IncidentCardProps {
  incident: Report;
  delay?: number;
  hasUpvoted?: boolean;
  onUpvote?: () => void;
}

export function IncidentCard({ incident, delay = 0, hasUpvoted, onUpvote }: IncidentCardProps) {
  const timeAgo = formatDistanceToNow(new Date(incident.entryDate), { addSuffix: true });
  const category = incident.department?.name || "General";

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
              <Badge variant="secondary" className="text-[10px] uppercase">{category}</Badge>
              <span className="text-[10px] text-muted-foreground font-mono">#{incident.id.slice(0, 8)}</span>
            </div>
            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
              {incident.description.split('.')[0]}
            </h3>
          </div>
          <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {incident.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-[10px]",
              incident.status === 'RESOLVED' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            )}>
              {incident.status}
            </Badge>
            <Badge variant="outline" className="text-[10px]">P{incident.priority}</Badge>
          </div>

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
      </GlassCard>
    </motion.div>
  );
}