import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { IncidentCard } from '@/components/IncidentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIncidents } from '@/contexts/IncidentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig = {
  'road-damage': { label: 'Road Damage', color: 'from-red-500 to-orange-500' },
  'pothole': { label: 'Pothole', color: 'from-orange-500 to-yellow-500' },
  'water-leak': { label: 'Water Leak', color: 'from-blue-500 to-cyan-500' },
  'broken-light': { label: 'Broken Light', color: 'from-yellow-500 to-orange-500' },
  'garbage': { label: 'Garbage', color: 'from-green-500 to-emerald-500' },
  'drainage': { label: 'Drainage', color: 'from-cyan-500 to-blue-500' },
  'other': { label: 'Other', color: 'from-gray-500 to-slate-500' },
};

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
  const { incidents } = useIncidents();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Filter incidents for current user's department
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((incident) =>
        user?.department ? incident.department === user.department : true
      )
      .filter((incident) => {
        const matchesSearch = incident.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          incident.location.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || incident.category === selectedCategory;
        const matchesStatus =
          selectedStatus === 'all' || incident.status === selectedStatus;
        const matchesPriority =
          selectedPriority === 'all' || incident.priority === selectedPriority;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesPriority
        );
      });
  }, [incidents, searchQuery, selectedCategory, selectedStatus, selectedPriority, user?.department]);

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
            Manage and track all incidents in your department
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
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
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
            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
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
            Showing {filteredIncidents.length} of {incidents.filter((i) =>
              user?.department ? i.department === user.department : true
            ).length} incidents
          </div>
        </motion.div>

        {/* Incidents Grid */}
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
                >
                  <IncidentCard
                    incident={incident}
                    variant="compact"
                  />
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
                    setSelectedCategory('all');
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
      </div>
    </DashboardLayout>
  );
}
