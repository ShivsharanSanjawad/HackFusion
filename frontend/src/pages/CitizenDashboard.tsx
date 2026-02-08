import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Search,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Zap,
  Phone,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IncidentCard } from '@/components/IncidentCard';
import { IncidentMap } from '@/components/IncidentMap';
import { ReportIncidentModal } from '@/components/ReportIncidentModal';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { mockDepartments } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useSVGOverlay } from 'react-leaflet/SVGOverlay';

// Custom Metric Card Components for CitizenDashboard
function UniqueMetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay,
}: {
  title: string;
  value: number;
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
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-accent/20 opacity-0 group-hover:opacity-30 transition-opacity blur-xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {title}
            </p>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 }}
              className={cn('text-4xl font-display font-black', color)}
            >
              {value}
            </motion.div>
          </div>

          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className={cn('p-3 rounded-full', color, 'bg-opacity-20')}
          >
            <Icon className={cn('w-6 h-6', color)} />
          </motion.div>
        </div>

        {trend && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3 }}
            className="text-xs text-muted-foreground mt-3 flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3 text-success" />
            {trend}
          </motion.p>
        )}
      </div>

      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r',
        color,
        'opacity-0 group-hover:opacity-100 transition-opacity'
      )} />
    </motion.div>
  );
}

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

export default function CitizenDashboard() {
  // ✅ READ USER FROM LOCALSTORAGE
  const storedUser = localStorage.getItem('urbanflow_user');
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const [reports, setReports] = useState<Report[]>([]);
  const [inProgressReports, setInProgressReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);
  const [upvotes, setUpvotes] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [upvotedIncidents, setUpvotedIncidents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/getReports?userId=${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const inProgress = data.filter((r: Report) => r.status === 'IN_PROGRESS');
        const resolved = data.filter((r: Report) => r.status === 'RESOLVED');
        const totalUpvotes = data.reduce(
          (sum: number, r: Report) => sum + r.upvotes,
          0
        );

        setReports(data);
        setInProgressReports(inProgress);
        setResolvedReports(resolved);
        setUpvotes(totalUpvotes);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Welcome back 👋
            </h1>
            <p className="text-muted-foreground">
              Track your reported issues and make a difference in your community.
            </p>
          </div>
          <Button
            onClick={() => setShowReportModal(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report New Issue
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UniqueMetricCard title="My Reports" value={reports.length} icon={FileText} color="text-blue-500" delay={0.1} />
          <UniqueMetricCard title="In Progress" value={inProgressReports.length} icon={Clock} color="text-orange-500" delay={0.2} />
          <UniqueMetricCard title="Resolved" value={resolvedReports.length} icon={CheckCircle2} color="text-green-500" delay={0.3} />
          <UniqueMetricCard title="Total Upvotes" value={upvotes} icon={Zap} color="text-purple-500" delay={0.4} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {reports
                .filter(r =>
                  r.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((report, index) => (
                  <IncidentCard
                    key={report.id}
                    incident={report}
                    delay={index * 0.1}
                    hasUpvoted={upvotedIncidents.has(report.id)}
                    onUpvote={() => {
                      if (!upvotedIncidents.has(report.id)) {
                        setUpvotedIncidents(
                          new Set([...upvotedIncidents, report.id])
                        );
                      }
                    }}
                  />
                ))}
            </div>
          </div>

          <div className="space-y-6">
            <IncidentMap incidents={reports} height="300px" />
            <Button
              className="w-full bg-blue-500 text-white"
              onClick={() => window.open('tel:+911234567890')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Support
            </Button>
          </div>
        </div>

        <ReportIncidentModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          onSubmit={() => setShowReportModal(false)}
        />
      </div>
    </DashboardLayout>
  );
}
