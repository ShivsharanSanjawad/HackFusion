import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {ArrowRight,Zap,Droplets,Construction,Trash2,Lightbulb,Shield,Users,Clock,
  CheckCircle2,TrendingUp,MapPin,ThumbsUp,BarChart3,Award,AlertCircle,} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { GlassCard, HexagonCard, FloatingActionButton } from '@/components/ui/cards';
import { StatCard, AnimatedCounter, ProgressRing } from '@/components/ui/animations';
import { IncidentMap } from '@/components/IncidentMap';
import { IncidentCard } from '@/components/IncidentCard';
import { StatusBadge } from '@/components/ui/badges';
import { mockIncidents, mockDepartments, dashboardStats, IncidentStatus } from '@/data/mockData';
import { useIncidents } from '@/contexts/IncidentContext';
import { cn } from '@/lib/utils';

const categoryIcons = [
  { icon: Zap, label: 'Power', count: dashboardStats.incidentsByCategory.power, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { icon: Droplets, label: 'Water', count: dashboardStats.incidentsByCategory.water, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Construction, label: 'Roads', count: dashboardStats.incidentsByCategory.roads, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Trash2, label: 'Sanitation', count: dashboardStats.incidentsByCategory.sanitation, color: 'text-green-500', bg: 'bg-green-500/10' },
  { icon: Lightbulb, label: 'Streetlights', count: dashboardStats.incidentsByCategory.streetlights, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

// Animated blob background component
function BlobBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-success/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
    </div>
  );
}

// Hero Section
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <BlobBackground />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 dark:opacity-10" />
      
      <motion.div style={{ y, opacity }} className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center mt-4 gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live Infrastructure Monitoring
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
            >
              Your City's{' '}
              <span className="text-gradient">Infrastructure</span>
              <br />
              At Your Fingertips
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg"
            >
              Report, track, and resolve urban infrastructure issues with complete 
              transparency. From power outages to road repairs — we bring citizens 
              and authorities together.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                  Report an Issue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="group">
                  View Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-8 pt-2 mb-10"
            >
              <div>
                <AnimatedCounter value={2847} className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">Issues Resolved</p>
              </div>
              <div>
                <AnimatedCounter value={98} suffix="%" className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </div>
              <div>
                <AnimatedCounter value={4.5} suffix="h" decimals={1} className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">Avg. Resolution</p>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Interactive City Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            {/* Floating category cards */}
            <div className="relative h-[500px]">
              {categoryIcons.map((cat, index) => {
                const positions = [
                  { top: '5%', left: '10%' },
                  { top: '15%', right: '5%' },
                  { top: '45%', left: '0%' },
                  { top: '55%', right: '10%' },
                  { bottom: '10%', left: '20%' },
                ];
                const pos = positions[index];
                
                return (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="absolute glass-card p-4 cursor-pointer group"
                    style={pos as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', cat.bg)}>
                        <cat.icon className={cn('w-5 h-5', cat.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat.count} active
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}

              {/* Central hexagon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <HexagonCard size="lg" color="primary">
                  <div className="text-center text-white transform">
                    <AnimatedCounter value={dashboardStats.totalActiveIncidents} className="text-3xl font-bold" />
                    <p className="text-xs opacity-80">Active</p>
                  </div>
                </HexagonCard>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Live Map Section
function LiveMapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { incidents, upvoteIncident } = useIncidents();
  const [upvotedIncidents, setUpvotedIncidents] = useState<Set<string>>(new Set());

  const handleUpvote = (incidentId: string) => {
    if (!upvotedIncidents.has(incidentId)) {
      setUpvotedIncidents(new Set([...upvotedIncidents, incidentId]));
      upvoteIncident(incidentId);
    }
  };

  return (
    <section ref={ref} id="map" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Real-Time Incident Map
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track all reported infrastructure issues across the city. Click on any 
            marker to view details and show your support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-card p-4 overflow-hidden"
        >
          <IncidentMap
            incidents={incidents}
            showHeatmap
            height="500px"
          />
        </motion.div>

        {/* Recent incidents list */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {incidents.slice(0, 3).map((incident, index) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              delay={0.5 + index * 0.1}
              onUpvote={() => handleUpvote(incident.id)}
              hasUpvoted={upvotedIncidents.has(incident.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Statistics Section
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [stats, setStats] = useState({
    reportsThisWeek: 0,
    totalResolved: 0,
    avgResolutionTimeInDays: 0,
    totalUnresolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8080/getStats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        setStats({
          reportsThisWeek: data.reportsThisWeek || 0,
          totalResolved: data.totalResolved || 0,
          avgResolutionTimeInDays: data.avgResolutionTimeInDays || 0,
          totalUnresolved: data.totalUnresolved || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section ref={ref} id="stats" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            City Infrastructure at a Glance
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time statistics showing the health of our city's infrastructure 
            and the responsiveness of municipal departments.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="col-span-full glass-card p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400">Error loading statistics</h3>
                <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
              </div>
            </motion.div>
          ) : loading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 rounded-lg h-32 animate-pulse bg-muted" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Reports This Week"
                value={stats.reportsThisWeek}
                icon={<MapPin className="w-5 h-5" />}
                delay={0.1}
              />
              <StatCard
                title="Total Resolved"
                value={stats.totalResolved}
                trend={{ value: 12, positive: true }}
                icon={<CheckCircle2 className="w-5 h-5" />}
                delay={0.2}
              />
              <StatCard
                title="Avg. Resolution Time"
                value={stats.avgResolutionTimeInDays}
                suffix=" days"
                icon={<Clock className="w-5 h-5" />}
                delay={0.3}
              />
              <StatCard
                title="Unresolved Issues"
                value={stats.totalUnresolved}
                icon={<AlertCircle className="w-5 h-5" />}
                delay={0.4}
              />
            </>
          )}
        </div>

        {/* Department Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-warning" />
            <h3 className="text-xl font-display font-semibold">Department Performance</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDepartments.slice(0, 3).map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="glass-card p-6 relative overflow-hidden"
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-accent text-white text-xs font-semibold rounded-bl-xl">
                    #1
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{dept.name}</h4>
                    <p className="text-sm text-muted-foreground">{dept.staffCount} staff members</p>
                  </div>
                  <ProgressRing
                    progress={dept.performanceScore}
                    size={60}
                    color={dept.performanceScore >= 90 ? 'success' : dept.performanceScore >= 80 ? 'primary' : 'warning'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active</p>
                    <p className="font-semibold">{dept.activeIncidents}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Resolved</p>
                    <p className="font-semibold">{dept.resolvedThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. Time</p>
                    <p className="font-semibold">{dept.avgResolutionTime}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className="font-semibold text-primary">{dept.performanceScore}%</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Shield,
      title: 'Complete Transparency',
      description: 'Track every step of the resolution process. No hidden status updates.',
    },
    {
      icon: Users,
      title: 'Citizen Powered',
      description: 'Support issues with upvotes. Popular concerns get prioritized.',
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get instant notifications as your reported issue progresses.',
    },
    {
      icon: BarChart3,
      title: 'Performance Metrics',
      description: 'Hold departments accountable with public performance dashboards.',
    },
    {
      icon: TrendingUp,
      title: 'Data-Driven Insights',
      description: 'Identify patterns and prevent recurring infrastructure issues.',
    },
    {
      icon: MapPin,
      title: 'Location Intelligence',
      description: 'Smart heatmaps show issue concentration across the city.',
    },
  ];

  return (
    <section ref={ref} id="about" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Built for Accountability
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            UrbanFlow bridges the gap between citizens and municipal authorities,
            ensuring every infrastructure issue is addressed with transparency.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <GlassCard className="h-full">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// // CTA Section
// function CTASection() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: '-100px' });

//   return (
//     <section ref={ref} className="py-20">
//       <div className="container mx-auto px-6">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={isInView ? { opacity: 1, scale: 1 } : {}}
//           transition={{ duration: 0.7 }}
//           className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16 text-center"
//         >
//           {/* Background decorations */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
//           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ delay: 0.2 }}
//             className="text-3xl md:text-4xl font-display font-bold text-white mb-4 relative"
//           >
//             Ready to Make Your City Better?
//           </motion.h2>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ delay: 0.3 }}
//             className="text-white/80 max-w-xl mx-auto mb-8 relative"
//           >
//             Join thousands of citizens who are actively improving their urban 
//             infrastructure. Report an issue today.
//           </motion.p>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ delay: 0.4 }}
//             className="flex flex-wrap justify-center gap-4 relative"
//           >
//             <Link to="/signup">
//               <Button size="lg" variant="secondary" className="font-semibold">
//                 Get Started Free
//                 <ArrowRight className="ml-2 w-4 h-4" />
//               </Button>
//             </Link>
//             <Link to="/login">
//               <Button size="lg" variant="outline" className="border-white/30 text-blue hover:bg-white/10">
//                 Login as Authority
//               </Button>
//             </Link>
//           </motion.div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold">UrbanFlow</h3>
              <p className="text-xs text-muted-foreground">Infrastructure Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 UrbanFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LiveMapSection />
      <StatsSection />
      <FeaturesSection />
      {/* <CTASection /> */}
      <Footer />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/signup">
          <FloatingActionButton size="lg">
            <MapPin className="w-6 h-6" />
          </FloatingActionButton>
        </Link>
      </div>
    </div>
  );
}
