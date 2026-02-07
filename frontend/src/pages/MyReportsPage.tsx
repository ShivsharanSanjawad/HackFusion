import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  Layers,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident, IncidentPriority, IncidentStatus } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FilterState {
  priority: IncidentPriority | null;
  status: IncidentStatus | null;
}

export default function MyReportsPage() {
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    status: null,
  });
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Filter incidents reported by current user
  const myReports = useMemo(() => {
    return incidents.filter(
      (incident) => incident.reportedBy.id === user?.id
    );
  }, [incidents, user?.id]);

  // Apply filters and search
  const filteredReports = useMemo(() => {
    return myReports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = !filters.priority || report.priority === filters.priority;
      const matchesStatus = !filters.status || report.status === filters.status;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [myReports, searchQuery, filters]);

  const priorityColors: Record<IncidentPriority, string> = {
    critical: 'from-red-500 to-red-600',
    high: 'from-orange-500 to-orange-600',
    medium: 'from-yellow-500 to-yellow-600',
    low: 'from-green-500 to-green-600',
  };

  const statusColors: Record<IncidentStatus, string> = {
    reported: 'bg-gray-500/20 text-gray-700',
    verified: 'bg-blue-500/20 text-blue-700',
    assigned: 'bg-purple-500/20 text-purple-700',
    'in-progress': 'bg-orange-500/20 text-orange-700',
    'on-hold': 'bg-amber-500/20 text-amber-700',
    resolved: 'bg-green-500/20 text-green-700',
  };

  const statusIcons: Record<IncidentStatus, React.ElementType> = {
    reported: AlertTriangle,
    verified: CheckCircle2,
    assigned: CheckCircle2,
    'in-progress': Clock,
    'on-hold': Clock,
    resolved: CheckCircle2,
  };

  const getStatusLabel = (status: IncidentStatus): string => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const analytics = useMemo(() => {
    return {
      total: myReports.length,
      resolved: myReports.filter((r) => r.status === 'resolved').length,
      inProgress: myReports.filter(
        (r) => r.status === 'in-progress' || r.status === 'assigned'
      ).length,
      critical: myReports.filter((r) => r.priority === 'critical').length,
    };
  }, [myReports]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold">My Reports</h1>
            <p className="text-muted-foreground mt-1">
              Track all issues you've reported and their current status
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            {Object.values(filters).some((f) => f !== null) && (
              <button
                onClick={() =>
                  setFilters({
                    priority: null,
                    status: null,
                  })
                }
                className="text-xs text-primary hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={filters.priority || ''}
              onChange={(e) =>
                setFilters({ ...filters, priority: (e.target.value as IncidentPriority) || null })
              }
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({ ...filters, status: (e.target.value as IncidentStatus) || null })
              }
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Reports ({filteredReports.length})
          </h3>

          <div className="space-y-3 max-h-[800px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => {
                  const StatusIcon = statusIcons[report.status];
                  const isExpanded = expandedReportId === report.id;

                  return (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Main Report Card */}
                      <motion.div
                        onClick={() =>
                          setExpandedReportId(isExpanded ? null : report.id)
                        }
                        className="p-4 cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                                `bg-gradient-to-br ${priorityColors[report.priority]}`
                              )}
                            >
                              <StatusIcon className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-1">
                                  {report.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location.address}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  'px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap',
                                  statusColors[report.status]
                                )}
                              >
                                {getStatusLabel(report.status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mt-2">
                              <div
                                className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium text-white',
                                  `bg-gradient-to-r ${priorityColors[report.priority]}`
                                )}
                              >
                                {report.priority}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ID: {report.id}
                              </span>
                              {report.assignedTo && (
                                <span className="text-xs text-muted-foreground">
                                  👤 {report.assignedTo.name}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                📅{' '}
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-border/50 bg-muted/20 p-4 space-y-3"
                          >
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Description
                              </p>
                              <p className="text-sm text-foreground">
                                {report.description}
                              </p>
                            </div>

                            {report.images.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Photos ({report.images.length})
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  {report.images.map((img, idx) => (
                                    <motion.img
                                      key={idx}
                                      src={img}
                                      alt={`Report ${idx + 1}`}
                                      whileHover={{ scale: 1.05 }}
                                      className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {report.activityLog.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Activity Log
                                </p>
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                  {report.activityLog.map((log) => (
                                    <div
                                      key={log.id}
                                      className="text-xs bg-background/50 p-2 rounded"
                                    >
                                      <p className="font-medium text-foreground">
                                        {log.action}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                      </p>
                                      {log.details && (
                                        <p className="text-muted-foreground mt-1">
                                          {log.details}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger hover:text-danger"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center rounded-xl"
                >
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No reports found</h3>
                  <p className="text-muted-foreground text-sm">
                    {myReports.length === 0
                      ? "You haven't reported any issues yet. Start by reporting one!"
                      : 'Try adjusting your filters or search criteria'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
