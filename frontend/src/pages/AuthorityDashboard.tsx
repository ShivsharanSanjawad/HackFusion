import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  ChevronDown,
  GripVertical,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident, IncidentPriority, IncidentStatus, mockDepartments } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FilterState {
  priority: IncidentPriority | null;
  status: IncidentStatus | null;
  category: string | null;
  assignmentStatus: 'assigned' | 'unassigned' | null;
}

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    status: null,
    category: null,
    assignmentStatus: null,
  });
  const [expandedMetrics, setExpandedMetrics] = useState<string | null>(null);

  const userDepartment = user?.department;
  const departmentIncidents = incidents.filter(
    i => i.department === userDepartment || !i.department
  );

  const filteredIncidents = useMemo(() => {
    return departmentIncidents.filter(incident => {
      const matchesSearch =
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = !filters.priority || incident.priority === filters.priority;
      const matchesStatus = !filters.status || incident.status === filters.status;
      const matchesCategory = !filters.category || incident.category === filters.category;
      const matchesAssignment =
        !filters.assignmentStatus ||
        (filters.assignmentStatus === 'assigned' ? !!incident.assignedTo : !incident.assignedTo);

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesCategory &&
        matchesAssignment
      );
    });
  }, [departmentIncidents, searchQuery, filters]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const criticalCount = departmentIncidents.filter(i => i.priority === 'critical').length;
    const highCount = departmentIncidents.filter(i => i.priority === 'high').length;
    const inProgressCount = departmentIncidents.filter(i => i.status === 'in-progress').length;
    const resolvedCount = departmentIncidents.filter(i => i.status === 'resolved').length;
    const assignedCount = departmentIncidents.filter(i => i.assignedTo).length;
    
    return {
      critical: criticalCount,
      high: highCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      assigned: assignedCount,
      avgResolutionTime: 5.2,
      staffWorkload: 78,
    };
  }, [departmentIncidents]);

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

  const MetricWidget = ({
    title,
    value,
    icon: Icon,
    trend,
    id,
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: string;
    id: string;
  }) => (
    <motion.div
      layout
      onClick={() => setExpandedMetrics(expandedMetrics === id ? null : id)}
      className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
      whileHover={{ scale: 1.02 }}
    >
      {/* Geometric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <motion.div className="text-3xl font-bold font-display text-foreground">
            {value}
          </motion.div>
          {trend && <p className="text-xs text-muted-foreground mt-2">{trend}</p>}
        </div>
        <div className="p-3 rounded-xl bg-gradient-primary/20 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <AnimatePresence>
        {expandedMetrics === id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-primary/20"
          >
            <p className="text-xs text-muted-foreground">Additional metrics would appear here</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

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
            <h1 className="text-3xl font-display font-bold">Authority Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage incidents and coordinate team response for {userDepartment}
            </p>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricWidget
            id="critical"
            title="Critical Issues"
            value={analytics.critical}
            icon={AlertTriangle}
            trend="Requires immediate attention"
          />
          <MetricWidget
            id="high"
            title="High Priority"
            value={analytics.high}
            icon={TrendingUp}
            trend="Next in queue"
          />
          <MetricWidget
            id="inProgress"
            title="In Progress"
            value={analytics.inProgress}
            icon={Clock}
            trend="Currently being handled"
          />
          <MetricWidget
            id="resolved"
            title="Resolved This Month"
            value={analytics.resolved}
            icon={CheckCircle2}
            trend="Completed successfully"
          />
        </div>

        {/* Advanced Filtering */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filtering
            </h3>
            {Object.values(filters).some(f => f !== null) && (
              <button
                onClick={() =>
                  setFilters({
                    priority: null,
                    status: null,
                    category: null,
                    assignmentStatus: null,
                  })
                }
                className="text-xs text-primary hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
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

            {/* Assignment Filter */}
            <select
              value={filters.assignmentStatus || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  assignmentStatus: (e.target.value as 'assigned' | 'unassigned') || null,
                })
              }
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
            >
              <option value="">All Assignments</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </motion.div>

        {/* Incident Queue with Drag-Drop Interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Incident Queue ({filteredIncidents.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident, index) => (
                    <motion.div
                      key={incident.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-4 rounded-xl hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start gap-4">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {incident.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {incident.location.address}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap',
                                statusColors[incident.status]
                              )}
                            >
                              {incident.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <div
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium text-white',
                                `bg-gradient-to-r ${priorityColors[incident.priority]}`
                              )}
                            >
                              {incident.priority}
                            </div>
                            {incident.assignedTo ? (
                              <span className="text-xs text-muted-foreground">
                                📍 {incident.assignedTo.name}
                              </span>
                            ) : (
                              <span className="text-xs text-orange-600 font-medium">Unassigned</span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {incident.upvotes} 👍
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-12 text-center rounded-xl"
                  >
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No incidents found</h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your filters or check back later
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            {/* Performance Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl space-y-4"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Team Performance
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Staff Workload</span>
                    <span className="text-sm font-medium">{analytics.staffWorkload}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analytics.staffWorkload}%` }}
                      transition={{ delay: 0.3, duration: 1 }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Department Heads</p>
                  {mockDepartments.slice(0, 3).map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium">{dept.shortCode}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{dept.performanceScore}%</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary"
                            style={{ width: `${dept.performanceScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl space-y-3"
            >
              <h3 className="font-semibold">Quick Actions</h3>
              <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-glow">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
              <Button variant="outline" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Escalate Issues
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
