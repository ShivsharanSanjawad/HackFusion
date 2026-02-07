import React, { useState,useEffect } from 'react';
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
      {/* Animated background elements */}
      <div className={cn('absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity', color)} />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-accent/20 opacity-0 group-hover:opacity-30 transition-opacity blur-xl" />

      {/* Content */}
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

      {/* Decorative bottom border */}
      <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r', color, 'opacity-0 group-hover:opacity-100 transition-opacity')} />
    </motion.div>
  );
}
interface Report {
  id: string; 
  senders: { id: string; name: string; role: string };
  entryDate: string;
  issueSince: string;
  media_url: string[];
  description: string;
  status: string;
  priority: number;
  upvotes: number;
  lat: number;
  lon: number;
  pdf_url: string;
}
export default function CitizenDashboard() {
  const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
      const response = await fetch(`http://localhost:8080/getReports?userId=${userId}`);

        if (response.ok) {
            const reports = await response.json();
        } else {
            console.error("Failed to fetch reports:", response.status);
        }
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
  const [showReportModal, setShowReportModal] = useState(false);
  const [upvotedIncidents, setUpvotedIncidents] = useState<Set<string>>(new Set());

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Welcome back, Random Citizen👋
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

        {/* Unique Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UniqueMetricCard
            title="My Reports"
            value={reports.length}
            icon={FileText}
            color="text-blue-500"
            trend="Keep reporting issues"
            delay={0.1}
          />
          <UniqueMetricCard
            title="In Progress"
            value={0}
            icon={Clock}
            color="text-orange-500"
            trend="Being worked on"
            delay={0.2}
          />
          <UniqueMetricCard
            title="Resolved"
            value={0}
            icon={CheckCircle2}
            color="text-green-500"
            trend="Successfully fixed"
            delay={0.3}
          />
          <UniqueMetricCard
            title="Total Upvotes"
            value={0}
            icon={Zap}
            color="text-purple-500"
            trend="Community support"
            delay={0.4}
          />
        </div>

        {/* Main Content Grid
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
              {reports.length > 0 ? (
                reports.map((incident, index) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    delay={index * 0.1}
                    hasUpvoted={upvotedIncidents.has(incident.id)}
                    onUpvote={() => {
                      if (!upvotedIncidents.has(incident.id)) {
                        setUpvotedIncidents(new Set([...upvotedIncidents, incident.id]));
                        upvoteIncident(incident.id);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="glass-card p-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No incidents found</h3>
                  <p className="text-muted-foreground text-sm">
                    Start by reporting an issue in your area.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Your Area Map
              </h3>
              <IncidentMap incidents={userIncidents} height="300px" />
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Department Performance</h3>
              <div className="space-y-4">
                {mockDepartments.slice(0, 3).map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{dept.shortCode}</p>
                      <p className="text-xs text-muted-foreground">{dept.avgResolutionTime}h avg</p>
                    </div>
                    <div className="w-12 h-12 rounded-full relative flex items-center justify-center bg-muted">
                      <span className="text-xs font-bold text-primary">{dept.performanceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 pt-6 border-t border-border"
              >
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => window.open('tel:+911234567890')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support Team
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <ReportIncidentModal 
          open={showReportModal} 
          onOpenChange={setShowReportModal}
          onSubmit={(data) => {
            console.log('New incident report:', data);
            setShowReportModal(false);
            // In a real app, this would submit to an API
          }}
        /> */}
      </div>
    </DashboardLayout>
  );
}
