import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Filter,
  Search,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileText,
  Zap,
  Phone,
  RotateCcw,
  Download,
  Eye,
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
import { IncidentCard } from '@/components/IncidentCard';
import { IncidentMap } from '@/components/IncidentMap';
import { ReportIncidentModal } from '@/components/ReportIncidentModal';
import { cn } from '@/lib/utils';

// --- Types ---
export interface Report {
  id: string;
  senders: { id: string; name: string; role: string };
  entryDate: string;
  issueSince: string;
  media_url: string[] | null;
  description: string;
  status: string;
  priority: number;
  upvotes: number;
  lat: number;
  lon: number;
  pdf_url: string | null;
  department?: { id: string; name: string };
}

export interface ReportStatusItem {
  id?: string;
  status: string;
  timestamp: string;
  description?: string;
}

// --- Sub-components ---
function UniqueMetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -5, y: 20 }}
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ rotate: 2, y: -5 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 group cursor-pointer',
        'bg-gradient-to-br from-white/50 to-white/20 dark:from-white/5 dark:to-white/0',
        'border border-white/20 backdrop-blur-xl',
        'hover:shadow-xl transition-shadow'
      )}
    >
      <div className={cn(
        'absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity',
        color
      )} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
            <motion.div className={cn('text-4xl font-display font-black', color)}>{value}</motion.div>
          </div>
          <div className={cn('p-3 rounded-full', color, 'bg-opacity-20')}>
            <Icon className={cn('w-6 h-6', color)} />
          </div>
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function CitizenDashboard() {
  const storedUser = localStorage.getItem('urbanflow_user');
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const [reports, setReports] = useState<Report[]>([]);
  const [inProgressReports, setInProgressReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);
  const [upvotes, setUpvotes] = useState(0);
  const [civicScore, setCivicScore] = useState(0); // Added missing state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [upvotedIncidents, setUpvotedIncidents] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatusItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    if (!userId) return;
    try {
      // Fetch Reports
      const reportsRes = await fetch(`http://localhost:8080/getReports?userId=${userId}`);
      const reportsData = await reportsRes.json();

      // Fetch Civic Score
      const scoreRes = await fetch(`http://localhost:8080/getCivicScore?userId=${userId}`);
      const scoreData = await scoreRes.json();

      // Update State
      setReports(reportsData);
      setInProgressReports(reportsData.filter((r: Report) => r.status === 'IN_PROGRESS'));
      setResolvedReports(reportsData.filter((r: Report) => r.status === 'CLOSED' || r.status === 'RESOLVED'));
      setUpvotes(reportsData.reduce((sum: number, r: Report) => sum + r.upvotes, 0));

      // Fixed: safely set civic score based on your backend response structure
      setCivicScore(typeof scoreData === 'object' ? (scoreData.score || 0) : scoreData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Corrected the useEffect syntax
  useEffect(() => {
    fetchReports();
  }, [userId]);

  const handleReportAction = async (id: string, action: 'reOpen' | 'closeReport') => {
    try {
      const response = await fetch(`http://localhost:8080/${action}?reportID=${id}`, {
        method: action === 'reOpen' ? 'POST' : 'PUT',
      });

      if (response.ok) {
        fetchReports();
      } else {
        alert(`Failed to ${action} the report.`);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
    }
  };

  const handleDownloadPDF = async (reportId: string) => {
    setDownloadingId(reportId);
    try {
      const response = await fetch(`http://localhost:8080/closeReport?reportID=${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.text();
        if (data && data.startsWith('http')) {
          window.open(data, '_blank');
        } else {
          alert('PDF generated. Check your downloads.');
        }
      } else {
        alert('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewStatus = async (report: Report) => {
    setSelectedReport(report);
    setLoadingStatus(true);
    try {
      const response = await fetch(`http://localhost:8080/getReportStatus?reportid=${report.id}`, {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchReports();
      alert('Reports refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing reports:', error);
      alert('Failed to refresh reports');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Welcome back 👋</h1>
            <p className="text-muted-foreground">Track your reported issues and make a difference.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="hover:bg-blue-50"
            >
              <RotateCcw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => setShowReportModal(true)} className="bg-gradient-primary hover:opacity-90 shadow-glow">
              <Plus className="w-4 h-4 mr-2" /> Report New Issue
            </Button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <UniqueMetricCard title="My Reports" value={reports.length} icon={FileText} color="text-blue-500" delay={0.1} />
          <UniqueMetricCard title="In Progress" value={inProgressReports.length} icon={Clock} color="text-orange-500" delay={0.2} />
          <UniqueMetricCard title="Resolved" value={resolvedReports.length} icon={CheckCircle2} color="text-green-500" delay={0.3} />
          <UniqueMetricCard title="Total Upvotes" value={upvotes} icon={Zap} color="text-purple-500" delay={0.4} />
          <UniqueMetricCard title="Civic Score" value={civicScore} icon={TrendingUp} color="text-amber-500" trend="+12% this month" delay={0.5} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search your incidents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
            </div>

            <div className="space-y-6">
              {reports
                .filter(r => r.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((report, index) => (
                  <div key={report.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <IncidentCard
                      incident={report}
                      delay={index * 0.1}
                      hasUpvoted={upvotedIncidents.has(report.id)}
                      onUpvote={() => { }}
                    />

                    <div className="flex gap-3 px-6 pb-4 pt-2 border-t bg-muted/20">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewStatus(report)}
                        className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        View Status
                      </Button>
                      {(report.status === 'CLOSED' || report.status === 'RESOLVED') ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'reOpen')}
                            className="bg-white hover:bg-orange-50 text-orange-600 border-orange-200"
                          >
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Re-open Issue
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadPDF(report.id)}
                            disabled={downloadingId === report.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {downloadingId === report.id ? 'Downloading...' : 'Download PDF'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'closeReport')}
                          className="bg-white hover:bg-green-50 text-green-600 border-green-200"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-2" />
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-6">
            <IncidentMap incidents={reports} height="300px" />
            <Button className="w-full bg-blue-500 text-white" onClick={() => window.open('tel:+911234567890')}>
              <Phone className="w-4 h-4 mr-2" /> Call Support
            </Button>
          </div>
        </div>

        <ReportIncidentModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          onSubmit={() => {
            setShowReportModal(false);
            fetchReports();
          }}
        />

        {/* Report Status Modal */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Status Timeline</DialogTitle>
              <DialogDescription>
                {selectedReport?.description.substring(0, 50)}...
              </DialogDescription>
            </DialogHeader>

            {loadingStatus ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading status...</p>
              </div>
            ) : reportStatus.length > 0 ? (
              <div className="space-y-4">
                {reportStatus.map((status, index) => (
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