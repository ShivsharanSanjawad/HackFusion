import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiIncident {
  description: string;
  id: string;
  issueSince: string;
  department: string;
  status: string;
  priority: string;
  upvotes: number;
  pdf_url?: string;
}

const statusConfig = {
  'reported': { label: 'Reported', color: '#ef4444' },
  'in-progress': { label: 'In Progress', color: '#f59e0b' },
  'resolved': { label: 'Resolved', color: '#10b981' },
  'closed': { label: 'Closed', color: '#6b7280' },
};

const priorityColors = {
  low: 'from-blue-400 to-blue-600',
  medium: 'from-yellow-400 to-yellow-600',
  high: 'from-orange-400 to-orange-600',
  critical: 'from-red-500 to-red-700',
};

export function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<ApiIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Fetch incidents from API
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://localhost:8080/getAll', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
        setError(err instanceof Error ? err.message : 'Failed to load incidents');
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Get unique departments and statuses for filters
  const departments = useMemo(() => {
    return ['all', ...new Set(incidents.map(i => i.department))];
  }, [incidents]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = incident.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        selectedDepartment === 'all' || incident.department === selectedDepartment;
      const matchesStatus =
        selectedStatus === 'all' || incident.status === selectedStatus;
      const matchesPriority =
        selectedPriority === 'all' || incident.priority === selectedPriority;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [incidents, searchQuery, selectedDepartment, selectedStatus, selectedPriority]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            All Incidents
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all reported incidents
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 rounded-lg border border-border space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-3">
            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <Input
                placeholder="Search by ID or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedDepartment !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('all');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                }}
                className="mt-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400">Error Loading Incidents</h3>
                <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Incidents Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident, index) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="glass-card rounded-lg border border-border p-5 h-full flex flex-col hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
                      {/* Header with ID and Priority */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-muted-foreground truncate">
                            ID: {incident.id}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap flex-shrink-0 ml-2',
                            `bg-gradient-to-r ${priorityColors[incident.priority as keyof typeof priorityColors] || priorityColors.medium}`
                          )}
                        >
                          {incident.priority}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground mb-4 line-clamp-3 flex-1">
                        {incident.description}
                      </p>

                      {/* Status and Department Row */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(incident.status)}
                          <span
                            className="text-xs font-medium px-2 py-1 rounded-full text-white"
                            style={{
                              backgroundColor: statusConfig[incident.status as keyof typeof statusConfig]?.color || '#6b7280',
                            }}
                          >
                            {statusConfig[incident.status as keyof typeof statusConfig]?.label || incident.status}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {incident.department}
                        </span>
                      </div>

                      {/* Date and Upvotes Row */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-t border-border pt-4">
                        <span>
                          Reported: {formatDate(incident.issueSince)}
                        </span>
                        <span className="flex items-center gap-1">
                          👍 {incident.upvotes || 0}
                        </span>
                      </div>

                      {/* PDF Link Button */}
                      {incident.pdf_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(incident.pdf_url, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                      )}
                      {!incident.pdf_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground cursor-default hover:bg-transparent"
                          disabled
                        >
                          No report attached
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-16 text-center"
                >
                  <p className="text-lg text-muted-foreground mb-4">
                    No incidents found
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDepartment('all');
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                    }}
                  >
                    Clear all filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
