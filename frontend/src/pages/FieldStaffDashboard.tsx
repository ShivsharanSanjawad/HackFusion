import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Upload,
  MessageSquare,
  Navigation,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Wifi,
  WifiOff,
  Phone,
  MapPinned,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { IncidentMap } from '@/components/IncidentMap';
import { cn } from '@/lib/utils';

interface UpdateMetadata {
  status: 'in-progress' | 'on-hold' | 'resolved';
  notes: string;
  photoCount?: number;
  timestamp: string;
}

export default function FieldStaffDashboard() {
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [updateData, setUpdateData] = useState<Partial<UpdateMetadata>>({
    notes: '',
    photoCount: 0,
  });

  const userDepartment = user?.department;
  const assignedTasks = useMemo(() => {
    return incidents.filter(
      i => i.assignedTo?.id === user?.id && i.status !== 'resolved'
    );
  }, [incidents, user]);

  const selectedIncident = selectedTask
    ? incidents.find(i => i.id === selectedTask)
    : assignedTasks[0];

  const taskStats = useMemo(() => {
    return {
      total: assignedTasks.length,
      inProgress: assignedTasks.filter(i => i.status === 'in-progress').length,
      onHold: assignedTasks.filter(i => i.status === 'on-hold').length,
      critical: assignedTasks.filter(i => i.priority === 'critical').length,
    };
  }, [assignedTasks]);

  const handleStatusUpdate = (newStatus: 'in-progress' | 'on-hold' | 'resolved') => {
    if (!selectedIncident) return;
    setUpdateData({ ...updateData, status: newStatus, timestamp: new Date().toISOString() });
    setShowUpdatePanel(true);
  };

  const TaskCard = ({ task, isSelected }: { task: typeof assignedTasks[0]; isSelected: boolean }) => {
    const priorityColors = {
      critical: 'from-red-500 to-red-600',
      high: 'from-orange-500 to-orange-600',
      medium: 'from-yellow-500 to-yellow-600',
      low: 'from-green-500 to-green-600',
    };

    const statusIcons = {
      'in-progress': <Clock className="w-4 h-4" />,
      'on-hold': <AlertCircle className="w-4 h-4" />,
      resolved: <CheckCircle2 className="w-4 h-4" />,
      assigned: <MapPin className="w-4 h-4" />,
      reported: <AlertCircle className="w-4 h-4" />,
      verified: <CheckCircle2 className="w-4 h-4" />,
    };

    return (
      <motion.div
        layout
        onClick={() => setSelectedTask(task.id)}
        className={cn(
          'p-4 rounded-xl cursor-pointer transition-all',
          isSelected
            ? 'glass-card shadow-lg ring-2 ring-primary'
            : 'glass-card hover:shadow-md'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="space-y-3">
          {/* Priority Badge and Status */}
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-bold text-white',
                `bg-gradient-to-r ${priorityColors[task.priority]}`
              )}
            >
              {task.priority}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {statusIcons[task.status]}
              <span className="capitalize">{task.status}</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>

          {/* Location */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{task.location.address}</span>
          </div>

          {/* Quick Actions for Mobile */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-500/20 text-blue-700 text-xs font-medium hover:bg-blue-500/30 transition-colors">
              <Navigation className="w-3 h-3" />
              <span className="hidden sm:inline">Navigate</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500/20 text-green-700 text-xs font-medium hover:bg-green-500/30 transition-colors">
              <Camera className="w-3 h-3" />
              <span className="hidden sm:inline">Photo</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Online Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-display font-bold">Field Tasks</h1>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
                  isOnline
                    ? 'bg-green-500/20 text-green-700'
                    : 'bg-red-500/20 text-red-700'
                )}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </>
                )}
              </motion.div>
            </div>
            <p className="text-muted-foreground mt-1">
              {taskStats.total} task{taskStats.total !== 1 ? 's' : ''} assigned
            </p>
          </div>
          {selectedIncident && (
            <Button className="bg-gradient-primary hover:opacity-90">
              <Phone className="w-4 h-4 mr-2" />
              Call Supervisor
            </Button>
          )}
        </motion.div>

        {/* Quick Stats - Mobile Card Style */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20"
          >
            <p className="text-xs text-muted-foreground mb-1">In Progress</p>
            <p className="text-2xl font-bold text-orange-600">{taskStats.inProgress}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20"
          >
            <p className="text-xs text-muted-foreground mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-600">{taskStats.critical}</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Task List - Mobile Optimized */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-lg">Your Tasks</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {assignedTasks.length > 0 ? (
                  assignedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isSelected={selectedTask === task.id || !selectedTask && task === assignedTasks[0]}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Task Details and Map */}
          <div className="lg:col-span-2 space-y-6">
            {selectedIncident ? (
              <>
                {/* Task Details Card */}
                <motion.div
                  key={selectedIncident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-2xl space-y-4"
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl font-display font-bold">{selectedIncident.title}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/20 text-primary">
                        {selectedIncident.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Reported {new Date(selectedIncident.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-orange-600">
                        👍 {selectedIncident.upvotes} upvotes
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-foreground">{selectedIncident.description}</p>
                    </div>

                    {/* Citizen Images */}
                    {selectedIncident.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Incident Photos</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {selectedIncident.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Incident ${idx}`}
                              className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 ring-primary transition-all"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Control Bar - Touch Friendly */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusUpdate('in-progress')}
                        className={cn(
                          'p-3 rounded-xl font-medium text-sm transition-all flex flex-col items-center gap-1',
                          selectedIncident.status === 'in-progress'
                            ? 'bg-orange-500 text-white'
                            : 'bg-muted hover:bg-orange-500/20'
                        )}
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>In Progress</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('on-hold')}
                        className={cn(
                          'p-3 rounded-xl font-medium text-sm transition-all flex flex-col items-center gap-1',
                          selectedIncident.status === 'on-hold'
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted hover:bg-amber-500/20'
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        <span>On Hold</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('resolved')}
                        className={cn(
                          'p-3 rounded-xl font-medium text-sm transition-all flex flex-col items-center gap-1',
                          selectedIncident.status === 'resolved'
                            ? 'bg-green-500 text-white'
                            : 'bg-muted hover:bg-green-500/20'
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Map View */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-4 rounded-2xl"
                >
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPinned className="w-4 h-4" />
                    Location Map
                  </h3>
                  <IncidentMap incidents={[selectedIncident]} height="300px" />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {selectedIncident.location.address}
                  </p>
                </motion.div>

                {/* Progress Update Panel */}
                <AnimatePresence>
                  {showUpdatePanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="glass-card p-6 rounded-2xl space-y-4"
                    >
                      <h3 className="font-semibold">Work Update</h3>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Work Notes
                          </label>
                          <Textarea
                            placeholder="Describe what you've done or your observations..."
                            value={updateData.notes || ''}
                            onChange={(e) =>
                              setUpdateData({ ...updateData, notes: e.target.value })
                            }
                            className="text-sm"
                          />
                        </div>

                        {/* Photo Upload Area */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Before/After Photos
                          </label>
                          <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:bg-primary/5 transition-colors cursor-pointer">
                            <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Tap camera for photo</p>
                            <p className="text-xs font-medium text-primary">
                              {updateData.photoCount || 0} photos
                            </p>
                          </div>
                        </div>

                        {/* Time Logging */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Start Time
                            </label>
                            <input
                              type="time"
                              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              End Time
                            </label>
                            <input
                              type="time"
                              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-primary hover:opacity-90"
                          onClick={() => setShowUpdatePanel(false)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Update
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowUpdatePanel(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center rounded-2xl"
              >
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">Select a task to view details</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Action Bar (Mobile Only) */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-40md:hidden">
            <div className="flex gap-2 bg-background/90 backdrop-blur-lg p-2 rounded-xl shadow-lg border">
                <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 flex items-center justify-center p-0"
                onClick={() => setShowUpdatePanel(true)}>
                <MessageSquare className="w-4 h-4" />
                </Button>

                <Button
                size="sm"
                className="h-10 w-10 flex items-center justify-center p-0 bg-gradient-primary shadow-glow"
                onClick={() => window.open('tel:+911234567890')}>
                <Phone className="w-4 h-4" />
                </Button>
            </div>
            </motion.div>


        {/* spacer for action bar */}
        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
}
