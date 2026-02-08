import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, MapPin, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IncidentMap } from '@/components/IncidentMap';
import { useAuth } from '@/contexts/AuthContext';

export default function MapViewPage() {
  const { user } = useAuth();
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  // Fetch all reports from API
  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const response = await fetch('http://localhost:8080/getReports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('All Reports for Map:', data);
        setAllReports(data);
      } catch (error) {
        console.error('Error fetching all reports:', error);
        setAllReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  // Simple filtering based on search and priority
  const filteredReports = allReports.filter((report) => {
    const matchesSearch =
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

    // Filter by priority if selected (using the priority number field)
    const matchesPriority = !selectedPriority || report.priority?.toString() === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const categories = [
    { id: 'power', label: 'Power' },
    { id: 'water', label: 'Water' },
    { id: 'roads', label: 'Roads' },
    { id: 'sanitation', label: 'Sanitation' },
    { id: 'streetlights', label: 'Streetlights' },
  ];

  const priorities = [
    { id: '1', label: 'Low' },
    { id: '2', label: 'Medium' },
    { id: '3', label: 'High' },
    { id: '4', label: 'Critical' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              Incident Map View
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize all incidents reported in your area
            </p>
          </div>
        </motion.div>

        {/* Filtering Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl space-y-4"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority || ''}
              onChange={(e) => setSelectedPriority(e.target.value || null)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
            >
              <option value="">All Priorities</option>
              {priorities.map((pri) => (
                <option key={pri.id} value={pri.id}>
                  {pri.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {filteredReports.length} incident{filteredReports.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 rounded-2xl overflow-hidden"
        >
          {!loading ? (
            filteredReports.length > 0 ? (
              <div className="rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <IncidentMap incidents={filteredReports} height="600px" />
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center flex-col gap-4">
                <AlertTriangle className="w-12 h-12 text-muted-foreground opacity-50" />
                <div className="text-center">
                  <h3 className="font-semibold mb-2">No incidents found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h3 className="font-semibold mb-4">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary/30" />
                <span className="text-sm text-muted-foreground">{cat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
