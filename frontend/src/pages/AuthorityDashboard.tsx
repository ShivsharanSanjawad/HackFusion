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
  Building2,
  UserCheck,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident, IncidentPriority, IncidentStatus, mockDepartments, mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FilterState {
  priority: IncidentPriority | null;
  status: IncidentStatus | null;
  category: string | null;
  assignmentStatus: 'assigned' | 'unassigned' | null;
}

interface CollabModalState {
  isOpen: boolean;
  incident: Incident | null;
  selectedDepartment: string | null;
}

interface AssignWorkerModalState {
  isOpen: boolean;
  incident: Incident | null;
  selectedWorkers: string[];
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
  const [collabModal, setCollabModal] = useState<CollabModalState>({
    isOpen: false,
    incident: null,
    selectedDepartment: null,
  });
  const [assignWorkerModal, setAssignWorkerModal] = useState<AssignWorkerModalState>({
    isOpen: false,
    incident: null,
    selectedWorkers: [],
  });

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
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (filteredIncidents.length > 0) {
                    setCollabModal({
                      isOpen: true,
                      incident: filteredIncidents[0],
                      selectedDepartment: null,
                    });
                  }
                }}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Collab with other depts
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (filteredIncidents.length > 0) {
                    setAssignWorkerModal({
                      isOpen: true,
                      incident: filteredIncidents[0],
                      selectedWorkers: [],
                    });
                  }
                }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Workers
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Collab with other depts Modal */}
        <Dialog open={collabModal.isOpen} onOpenChange={(open) => {
          if (!open) {
            setCollabModal({ isOpen: false, incident: null, selectedDepartment: null });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Collaborate with Other Departments</DialogTitle>
              <DialogDescription>
                Select a department to collaborate on this incident
              </DialogDescription>
            </DialogHeader>
            
            {collabModal.incident && (
              <div className="space-y-4">
                {/* Incident Details */}
                <div className="glass-card p-4 rounded-lg space-y-2 border border-border">
                  <h4 className="font-semibold text-sm">{collabModal.incident.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {collabModal.incident.location.address}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium text-white',
                        `bg-gradient-to-r ${priorityColors[collabModal.incident.priority]}`
                      )}
                    >
                      {collabModal.incident.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {collabModal.incident.category}
                    </span>
                  </div>
                </div>

                {/* Department Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Available Departments</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {mockDepartments.map((dept) => (
                      <motion.div
                        key={dept.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setCollabModal({ ...collabModal, selectedDepartment: dept.id })}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer border transition-all",
                          collabModal.selectedDepartment === dept.id
                            ? "bg-primary/10 border-primary shadow-glow"
                            : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{dept.name}</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              Head: {dept.head}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Staff: {dept.staffCount} | Score: {dept.performanceScore}%
                            </p>
                          </div>
                          <div
                            className={cn(
                              "w-4 h-4 border-2 rounded transition-colors",
                              collabModal.selectedDepartment === dept.id
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            )}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setCollabModal({ isOpen: false, incident: null, selectedDepartment: null })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                    disabled={!collabModal.selectedDepartment}
                    onClick={() => {
                      if (collabModal.selectedDepartment) {
                        const selectedDept = mockDepartments.find(
                          (d) => d.id === collabModal.selectedDepartment
                        );
                        setCollabModal({ isOpen: false, incident: null, selectedDepartment: null });
                      }
                    }}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Workers Modal */}
        <Dialog open={assignWorkerModal.isOpen} onOpenChange={(open) => {
          if (!open) {
            setAssignWorkerModal({ isOpen: false, incident: null, selectedWorkers: [] });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Workers</DialogTitle>
              <DialogDescription>
                Select workers to assign to this incident
              </DialogDescription>
            </DialogHeader>

            {assignWorkerModal.incident && (
              <div className="space-y-4">
                {/* Incident Details */}
                <div className="glass-card p-4 rounded-lg space-y-2 border border-border">
                  <h4 className="font-semibold text-sm">{assignWorkerModal.incident.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {assignWorkerModal.incident.location.address}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium text-white',
                        `bg-gradient-to-r ${priorityColors[assignWorkerModal.incident.priority]}`
                      )}
                    >
                      {assignWorkerModal.incident.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {assignWorkerModal.incident.category}
                    </span>
                  </div>
                </div>

                {/* Worker Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Workers</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {mockUsers
                      .filter((u) => u.role === 'field-staff')
                      .map((worker) => (
                        <motion.div
                          key={worker.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                          onClick={() => {
                            setAssignWorkerModal((prev) => ({
                              ...prev,
                              selectedWorkers: prev.selectedWorkers.includes(worker.id)
                                ? prev.selectedWorkers.filter((id) => id !== worker.id)
                                : [...prev.selectedWorkers, worker.id],
                            }));
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={assignWorkerModal.selectedWorkers.includes(worker.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAssignWorkerModal((prev) => ({
                                    ...prev,
                                    selectedWorkers: [...prev.selectedWorkers, worker.id],
                                  }));
                                } else {
                                  setAssignWorkerModal((prev) => ({
                                    ...prev,
                                    selectedWorkers: prev.selectedWorkers.filter(
                                      (id) => id !== worker.id
                                    ),
                                  }));
                                }
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{worker.name}</h5>
                              <p className="text-xs text-muted-foreground">
                                {worker.department}
                              </p>
                              {worker.phone && (
                                <p className="text-xs text-muted-foreground">{worker.phone}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Selected Count */}
                {assignWorkerModal.selectedWorkers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                  >
                    {assignWorkerModal.selectedWorkers.length} worker(s) selected
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setAssignWorkerModal({ isOpen: false, incident: null, selectedWorkers: [] })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                    disabled={assignWorkerModal.selectedWorkers.length === 0}
                    onClick={() => {
                      setAssignWorkerModal({ isOpen: false, incident: null, selectedWorkers: [] });
                    }}
                  >
                    Assign Workers
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
