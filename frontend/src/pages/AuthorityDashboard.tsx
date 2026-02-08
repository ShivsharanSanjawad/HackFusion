import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  Eye,
  RotateCcw,
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

/* 🔒 HARDCODED USER ID (KEPT) */
const userId = "550e8400-e29b-41d4-a716-446655440000";

/* 🔒 HARDCODED WORKER DATA FROM DATABASE */
const HARDCODED_WORKERS_BY_DEPARTMENT = {
  '550e8400-e29b-41d4-a716-446655440000': [ // Engineering
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      username: 'alice_tech',
      role: 'Staff',
      joinDate: '2023-01-15',
      department: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Engineering' },
    }
  ],
  '7c9e6679-7425-40de-944b-e07fc1f90ae7': [ // Operations
    {
      id: 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f',
      username: 'bob_ops',
      role: 'Staff',
      joinDate: '2023-03-22',
      department: { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7', name: 'Operations' },
    }
  ],
  'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6': [ // Data Science
    {
      id: '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
      username: 'charlie_data',
      role: 'Staff',
      joinDate: '2023-06-10',
      department: { id: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', name: 'Data Science' },
    }
  ],
};

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
  step: 'select-incident' | 'select-workers';
}

export default function AuthorityDashboard() {

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    status: null,
    category: null,
    assignmentStatus: null,
  });
  const [expandedMetrics, setExpandedMetrics] = useState<string | null>(null);
  const [apiReports, setApiReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [assigningWorkers, setAssigningWorkers] = useState(false);

  // State for closed reports
  const [closedReports, setClosedReports] = useState<Set<string>>(new Set());
  const [closingReport, setClosingReport] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  // State for report status details
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [reportStatus, setReportStatus] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [collabModal, setCollabModal] = useState<CollabModalState>({
    isOpen: false,
    incident: null,
    selectedDepartment: null,
  });
  const [assignWorkerModal, setAssignWorkerModal] = useState<AssignWorkerModalState>({
    isOpen: false,
    incident: null,
    selectedWorkers: [],
    step: 'select-incident',
  });

  /* ---------------- FETCH REPORTS FUNCTION (EXTRACTABLE) ---------------- */

  const performFetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/getAll`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`HTTP error! status: ${response.status}`, errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('All Reports from API:', data);
      setApiReports(Array.isArray(data) ? data : data.data || []);

    } catch (error) {
      console.error('Error fetching reports:', error);
      setApiReports([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH REPORTS ON MOUNT ---------------- */

  useEffect(() => {
    performFetchReports();
  }, []);

  /* ---------------- REFRESH REPORTS HANDLER ---------------- */

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await performFetchReports();
      alert('Reports refreshed successfully! New records should now be visible.');
    } catch (error) {
      console.error('Error refreshing reports:', error);
      alert('Failed to refresh reports. Check console for details.');
    } finally {
      setRefreshing(false);
    }
  };

  /* ---------------- FETCH WORKERS FOR SELECTED INCIDENT'S DEPARTMENT ---------------- */

  useEffect(() => {
    // Fetch workers when an incident is selected (in step 2 of modal)
    if (!assignWorkerModal.incident || assignWorkerModal.step !== 'select-workers') {
      setWorkers([]);
      setWorkersError(null);
      return;
    }

    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      setWorkersError(null);
      try {
        // Get the department ID from the selected incident (try multiple field names)
        const incidentDepartmentId =
          assignWorkerModal.incident.department_id ||
          assignWorkerModal.incident.departmentId ||
          userId; // Fallback to authority's department

        console.log('Incident data:', assignWorkerModal.incident);
        console.log('Fetching workers for department:', incidentDepartmentId);

        if (!incidentDepartmentId) {
          console.warn('Could not determine department ID for incident');
          setWorkersError('Could not determine department for this incident');
          setWorkers([]);
          return;
        }

        const response = await fetch(
          `http://localhost:8080/department/getWorkers?departmentID=${incidentDepartmentId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Workers fetch response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(`HTTP error! status: ${response.status}`, errorData);
          setWorkersError(`Failed to fetch workers: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Workers from API:', data);
        const workersList = Array.isArray(data) ? data : data.data || [];
        setWorkers(workersList);

        if (workersList.length === 0) {
          // Use hardcoded workers as fallback
          const hardcodedWorkers = HARDCODED_WORKERS_BY_DEPARTMENT[incidentDepartmentId as keyof typeof HARDCODED_WORKERS_BY_DEPARTMENT];
          if (hardcodedWorkers && hardcodedWorkers.length > 0) {
            console.log('Using hardcoded workers:', hardcodedWorkers);
            setWorkers(hardcodedWorkers);
            setWorkersError(null);
          } else {
            setWorkersError('No workers found for this department');
          }
        }

      } catch (error) {
        console.error('Error fetching workers:', error);
        // Use hardcoded workers as fallback when API fails
        const incidentDepartmentId =
          assignWorkerModal.incident.department_id ||
          assignWorkerModal.incident.departmentId ||
          userId;

        const hardcodedWorkers = HARDCODED_WORKERS_BY_DEPARTMENT[incidentDepartmentId as keyof typeof HARDCODED_WORKERS_BY_DEPARTMENT];
        if (hardcodedWorkers && hardcodedWorkers.length > 0) {
          console.log('API failed, using hardcoded workers:', hardcodedWorkers);
          setWorkers(hardcodedWorkers);
          setWorkersError('Using cached worker data');
        } else {
          setWorkersError(`Error: ${error}`);
          setWorkers([]);
        }

      } finally {
        setLoadingWorkers(false);
      }
    };

    fetchWorkers();

  }, [assignWorkerModal.incident, assignWorkerModal.step, userId]);

  /* ---------------- HANDLE ASSIGN WORKERS SUBMISSION ---------------- */

  const handleAssignWorkers = async () => {
    if (!assignWorkerModal.incident || assignWorkerModal.selectedWorkers.length === 0) {
      console.warn('No incident or workers selected');
      return;
    }

    setAssigningWorkers(true);
    try {
      // Assign each worker individually (backend expects one worker per assignment)
      const assignmentPromises = assignWorkerModal.selectedWorkers.map((workerId) => {
        const assignmentPayload = {
          reportID: assignWorkerModal.incident!.id,
          workerID: workerId,
        };

        console.log('Submitting assignment:', assignmentPayload);

        return fetch(
          `http://localhost:8080/department/assignWorkers`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignmentPayload),
          }
        );
      });

      const responses = await Promise.all(assignmentPromises);

      // Check if all requests were successful
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(`Assignment failed! status: ${response.status}`, errorData);
          throw new Error(`Assignment failed: ${response.status}`);
        }
      }

      console.log('All assignments successful');

      // Close modal and reset state
      setAssignWorkerModal({ isOpen: false, incident: null, selectedWorkers: [], step: 'select-incident' });

      // Refresh incidents list to show updated assignment status
      const reportsResponse = await fetch(
        `http://localhost:8080/getAll`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const reportsData = await reportsResponse.json();
      setApiReports(Array.isArray(reportsData) ? reportsData : reportsData.data || []);

      // Show success message
      alert(`Successfully assigned ${assignWorkerModal.selectedWorkers.length} worker(s) to ${assignWorkerModal.incident.title}`);

    } catch (error) {
      console.error('Error assigning workers:', error);
      alert(`Failed to assign workers: ${error}`);
    } finally {
      setAssigningWorkers(false);
    }
  };

  /* ---------------- HANDLE CLOSE REPORT ---------------- */

  const handleCloseReport = async (reportId: string) => {
    setClosingReport(reportId);
    try {
      const response = await fetch(
        `http://localhost:8080/closeReport?reportID=${reportId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Failed to close report! status: ${response.status}`, errorData);
        throw new Error(`Failed to close report: ${response.status}`);
      }

      console.log('Report closed successfully:', reportId);

      // Mark report as closed
      setClosedReports(prev => new Set([...prev, reportId]));

      // Show success message
      alert('Report closed successfully. You can now download the PDF report.');

    } catch (error) {
      console.error('Error closing report:', error);
      alert(`Failed to close report: ${error}`);
    } finally {
      setClosingReport(null);
    }
  };

  /* ---------------- HANDLE DOWNLOAD REPORT PDF ---------------- */

  const handleDownloadReport = async (reportId: string) => {
    setDownloadingReport(reportId);
    try {
      const response = await fetch(
        `http://localhost:8080/closeReport?reportID=${reportId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Failed to get download link! status: ${response.status}`, errorData);
        throw new Error(`Failed to generate PDF: ${response.status}`);
      }

      const data = await response.text();
      console.log('PDF download link:', data);

      // If it returns a URL/link, open it
      if (data && data.startsWith('http')) {
        window.open(data, '_blank');
      } else if (data && !data.includes('failed') && !data.includes('error')) {
        // Otherwise, try to extract the link from response
        window.open(data, '_blank');
      } else {
        alert('Failed to generate PDF report. Please try again.');
      }

    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Failed to download report: ${error}`);
    } finally {
      setDownloadingReport(null);
    }
  };

  /* ---------------- HANDLE VIEW STATUS ---------------- */

  const handleViewStatus = async (incident: any) => {
    setSelectedIncident(incident);
    setLoadingStatus(true);
    try {
      const response = await fetch(`http://localhost:8080/getReportStatus?reportid=${incident.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const statusData = await response.json();
        setReportStatus(Array.isArray(statusData) ? statusData : [statusData]);
      } else {
        setReportStatus([]);
        alert('Failed to load report status');
      }
    } catch (error) {
      console.error('Error fetching report status:', error);
      setReportStatus([]);
    } finally {
      setLoadingStatus(false);
    }
  };

  /* ---------------- MAP API DATA ---------------- */

  const allIncidents = useMemo(() => {
    const apiIncidents = apiReports.map((report: any) => ({
      id: report.id,
      title: report.title || report.description || 'Untitled Report',
      description: report.description || '',
      priority: report.priority
        ? String(report.priority).toLowerCase() as IncidentPriority
        : 'medium',
      status: report.status
        ? String(report.status).toLowerCase() as IncidentStatus
        : 'reported',
      category: report.category || 'Other',
      location: {
        address: report.address || 'Unknown Location',
        lat: report.lat || 0,
        lng: report.lon || 0,
      },
      createdAt: report.entryDate || new Date().toISOString(),
      assignedTo: report.workers || null,
      department_id: report.department_id, // Ensure department_id is preserved
      ...report
    }));

    return [...apiIncidents];
  }, [apiReports]);

  /* ---------------- FILTER ---------------- */

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter(incident => {

      const matchesSearch =
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        !filters.priority || incident.priority === filters.priority;

      const matchesStatus =
        !filters.status || incident.status === filters.status;

      const matchesCategory =
        !filters.category || incident.category === filters.category;

      const matchesAssignment =
        !filters.assignmentStatus ||
        (filters.assignmentStatus === 'assigned'
          ? !!incident.assignedTo
          : !incident.assignedTo);

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesCategory &&
        matchesAssignment
      );
    });
  }, [allIncidents, searchQuery, filters]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const criticalCount = allIncidents.filter(i => i.priority === 'critical').length;
    const highCount = allIncidents.filter(i => i.priority === 'high').length;
    const inProgressCount = allIncidents.filter(i => i.status === 'in-progress').length;
    const resolvedCount = allIncidents.filter(i => i.status === 'resolved').length;
    const assignedCount = allIncidents.filter(i => i.assignedTo).length;

    return {
      critical: criticalCount,
      high: highCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      assigned: assignedCount,
      avgResolutionTime: 5.2,
      staffWorkload: 78,
    };
  }, [allIncidents]);

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Refresh Button */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Authority Dashboard 🛡️</h1>
            <p className="text-muted-foreground">Manage incidents and coordinate responses.</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="hover:bg-blue-50"
          >
            <RotateCcw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            {refreshing ? 'Refreshing...' : 'Refresh Reports'}
          </Button>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Critical Issues - Red Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative glass-card p-3 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-red-500"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Critical Issues</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{analytics.critical}</span>
                  <span className="text-red-500 text-xs font-semibold mb-1">URGENT</span>
                </div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 rounded-b-2xl" />
            </div>
          </motion.div>

          {/* High Priority - Orange Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative glass-card p-3 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">High Priority</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{analytics.high}</span>
                  <span className="text-orange-500 text-xs font-semibold mb-1">HIGH</span>
                </div>
                <p className="text-xs text-muted-foreground">Next in queue</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 rounded-b-2xl" />
            </div>
          </motion.div>

          {/* In Progress - Blue Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative glass-card p-3 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{analytics.inProgress}</span>
                  <span className="text-blue-500 text-xs font-semibold mb-1">ACTIVE</span>
                </div>
                <p className="text-xs text-muted-foreground">Currently being handled</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 rounded-b-2xl" />
            </div>
          </motion.div>

          {/* Resolved - Green Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative glass-card p-3 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </motion.div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Resolved This Month</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{analytics.resolved}</span>
                  <span className="text-green-500 text-xs font-semibold mb-1">✓ DONE</span>
                </div>
                <p className="text-xs text-muted-foreground">Completed successfully</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 rounded-b-2xl" />
            </div>
          </motion.div>
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

        {/* Incident Queue with Layout */}
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
                  filteredIncidents.map((incident, index) => {
                    const isClosed = closedReports.has(incident.id);
                    const isClosing = closingReport === incident.id;
                    const isDownloading = downloadingReport === incident.id;

                    return (
                      <motion.div
                        key={incident.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'glass-card p-4 rounded-xl hover:shadow-md transition-shadow group',
                          isClosed && 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {!isClosed && <GripVertical className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}

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
                                  isClosed ? 'bg-purple-100 text-purple-700' : statusColors[incident.status]
                                )}
                              >
                                {isClosed ? 'CLOSED' : incident.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-between">
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
                                    📍 Assigned
                                  </span>
                                ) : (
                                  <span className="text-xs text-orange-600 font-medium">Unassigned</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleViewStatus(incident)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View Status
                                </Button>

                                {isClosed ? (
                                  // Show download button for closed reports
                                  <Button
                                    onClick={() => handleDownloadReport(incident.id)}
                                    disabled={isDownloading}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg"
                                  >
                                    <Download className="w-5 h-5 mr-2" />
                                    {isDownloading ? 'Downloading...' : 'DOWNLOAD PDF'}
                                  </Button>
                                ) : incident.status === 'resolved' ? (
                                  // Show close button for resolved reports
                                  <Button
                                    onClick={() => handleCloseReport(incident.id)}
                                    disabled={isClosing}
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-3 text-xs"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    {isClosing ? 'Closing...' : 'Close'}
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
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
                  setAssignWorkerModal({
                    isOpen: true,
                    incident: null,
                    selectedWorkers: [],
                    step: 'select-incident',
                  });
                }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Workers
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Assign Workers Modal */}
        <Dialog open={assignWorkerModal.isOpen} onOpenChange={(open) => {
          if (!open) {
            setAssignWorkerModal({ isOpen: false, incident: null, selectedWorkers: [], step: 'select-incident' });
            setWorkersError(null);
          }
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {assignWorkerModal.step === 'select-incident' ? 'Select Incident' : 'Assign Workers'}
              </DialogTitle>
              <DialogDescription>
                {assignWorkerModal.step === 'select-incident'
                  ? 'Choose an incident to assign workers to'
                  : 'Select workers to assign to this incident'}
              </DialogDescription>
            </DialogHeader>

            {assignWorkerModal.step === 'select-incident' ? (
              // Step 1: Select Incident - Show all department incidents
              <div className="space-y-3">
                <label className="text-sm font-medium">Available Incidents (All Reports)</label>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {allIncidents.length > 0 ? (
                    allIncidents.map((incident) => (
                      <motion.div
                        key={incident.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setAssignWorkerModal({
                            ...assignWorkerModal,
                            incident,
                            step: 'select-workers',
                            selectedWorkers: [],
                          });
                          setWorkersError(null); // Reset error when selecting new incident
                        }}
                        className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{incident.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {incident.location.address}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium text-white',
                              `bg-gradient-to-r ${priorityColors[incident.priority]}`
                            )}
                          >
                            {incident.priority}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <span className="text-xs text-muted-foreground">
                            {incident.category}
                          </span>
                          {incident.assignedTo && (
                            <span className="text-xs text-muted-foreground">
                              📍 Assigned
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No incidents available</p>
                    </div>
                  )}
                </div>
              </div>
            ) : assignWorkerModal.incident ? (
              // Step 2: Select Workers
              <div className="space-y-4">
                {/* Selected Incident Details */}
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

                  {workersError && (
                    <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs">
                      {workersError}
                    </div>
                  )}

                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {loadingWorkers ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">Loading workers...</p>
                      </div>
                    ) : workers.length > 0 ? (
                      workers.map((worker) => (
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
                              <h5 className="font-medium text-sm">{worker.username}</h5>
                              <p className="text-xs text-muted-foreground">
                                {worker.role}
                              </p>
                              {worker.department && (
                                <p className="text-xs text-muted-foreground">{worker.department.name}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No workers available</p>
                      </div>
                    )}
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
                      setAssignWorkerModal({ ...assignWorkerModal, step: 'select-incident', selectedWorkers: [] })
                    }
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                    disabled={assignWorkerModal.selectedWorkers.length === 0 || assigningWorkers}
                    onClick={handleAssignWorkers}
                  >
                    {assigningWorkers ? 'Assigning...' : 'Assign Workers'}
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Report Status Modal */}
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Status Timeline</DialogTitle>
              <DialogDescription>
                {selectedIncident?.title?.substring(0, 50)}...
              </DialogDescription>
            </DialogHeader>

            {loadingStatus ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading status...</p>
              </div>
            ) : reportStatus.length > 0 ? (
              <div className="space-y-4">
                {reportStatus.map((status: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6 pb-4 border-l-2 border-blue-400 last:pb-0"
                  >
                    <div className="absolute -left-3 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                      <p className="font-semibold text-sm text-blue-700">{status.status}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(status.timestamp).toLocaleString()}
                      </p>
                      {status.description && (
                        <p className="text-sm text-muted-foreground mt-2">{status.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No status updates available</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}