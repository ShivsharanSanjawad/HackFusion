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
  Edit3,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidents } from '@/contexts/IncidentContext';
import { IncidentMap } from '@/components/IncidentMap';
import { cn } from '@/lib/utils';

interface UpdateMetadata {
  status: 'in-progress' | 'update-status' | 'resolved';
  notes: string;
  photoCount?: number;
  timestamp: string;
  newStatus?: string;
  updateDate?: string;
  images?: File[];
}

export default function FieldStaffDashboard() {
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [updateType, setUpdateType] = useState<'in-progress' | 'update-status' | 'resolved' | null>(null);
  const [updateData, setUpdateData] = useState<Partial<UpdateMetadata>>({
    notes: '',
    photoCount: 0,
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Hardcoded IDs for API requests
  const HARDCODED_IDS = {
    reportID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    departmentId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    workerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  };

  // Convert File to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle submitting status updates
  const handleSubmitUpdate = async () => {
    if (!selectedIncident) return;

    setIsSubmitting(true);
    try {
      if (updateType === 'resolved') {
        // Convert images to base64
        const imageStrings: string[] = [];
        for (const file of updateData.images || []) {
          const base64 = await fileToBase64(file);
          imageStrings.push(base64);
        }

        const payload = {
          reportID: HARDCODED_IDS.reportID,
          workerID: HARDCODED_IDS.workerId,
          images: imageStrings,
          description: updateData.notes || '',
          date: updateData.updateDate || new Date().toISOString().split('T')[0],
        };

        const response = await fetch('http://localhost:8080/worker/completeReport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to complete report: ${response.statusText}`);
        }
      } else {
        // Update status (covers both 'in-progress' and 'update-status')
        const payload = {
          reportID: HARDCODED_IDS.reportID,
          departmentId: HARDCODED_IDS.departmentId,
          workerId: HARDCODED_IDS.workerId,
          newStatus: updateType === 'in-progress' ? 'in-progress' : (updateData.newStatus || ''),
          currDate: updateData.updateDate || new Date().toISOString().split('T')[0],
          description: updateData.notes || '',
        };

        const response = await fetch('http://localhost:8080/worker/updateStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status: ${response.statusText}`);
        }
      }

      // Success - close panel and reset
      setShowUpdatePanel(false);
      setUpdateType(null);
      setUpdateData({ notes: '', photoCount: 0, images: [] });
    } catch (error) {
      console.error('Error submitting update:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleStatusUpdate = (newStatus: 'in-progress' | 'update-status' | 'resolved') => {
    if (!selectedIncident) return;
    setUpdateType(newStatus);
    setUpdateData({ 
      ...updateData, 
      status: newStatus, 
      timestamp: new Date().toISOString(),
      images: []
    });
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
                        onClick={() => handleStatusUpdate('update-status')}
                        className={cn(
                          'p-3 rounded-xl font-medium text-sm transition-all flex flex-col items-center gap-1',
                          'bg-muted hover:bg-blue-500/20'
                        )}
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Update Status</span>
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

                {/* Progress Update Panel - BEFORE Map */}
                <AnimatePresence>
                  {showUpdatePanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="glass-card p-6 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {updateType === 'update-status' && 'Update Status'}
                          {updateType === 'resolved' && 'Mark as Resolved'}
                          {updateType === 'in-progress' && 'In Progress Update'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowUpdatePanel(false);
                            setUpdateType(null);
                          }}
                          className="p-1 hover:bg-muted rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Update Status Form */}
                        {updateType === 'update-status' && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                New Status
                              </label>
                              <select
                                value={updateData.newStatus || ''}
                                onChange={(e) =>
                                  setUpdateData({ ...updateData, newStatus: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
                              >
                                <option value="">Select Status</option>
                                <option value="reported">Reported</option>
                                <option value="verified">Verified</option>
                                <option value="in-progress">In Progress</option>
                                <option value="on-hold">On Hold</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Current Date
                              </label>
                              <Input
                                type="date"
                                value={updateData.updateDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) =>
                                  setUpdateData({ ...updateData, updateDate: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Description / Notes
                              </label>
                              <Textarea
                                placeholder="Describe the status update..."
                                value={updateData.notes || ''}
                                onChange={(e) =>
                                  setUpdateData({ ...updateData, notes: e.target.value })
                                }
                                rows={4}
                              />
                            </div>
                          </>
                        )}

                        {/* Resolved Form */}
                        {updateType === 'resolved' && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Resolution Date
                              </label>
                              <Input
                                type="date"
                                value={updateData.updateDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) =>
                                  setUpdateData({ ...updateData, updateDate: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Description / Resolution Details
                              </label>
                              <Textarea
                                placeholder="Describe how the issue was resolved..."
                                value={updateData.notes || ''}
                                onChange={(e) =>
                                  setUpdateData({ ...updateData, notes: e.target.value })
                                }
                                rows={4}
                              />
                            </div>

                            {/* Photo Upload Area */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Before/After Photos
                              </label>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                              >
                                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm font-medium mb-1">Click to upload photos</p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  or drag and drop
                                </p>
                                <p className="text-xs font-semibold text-primary">
                                  {(updateData.images?.length || 0)} photo(s) selected
                                </p>
                              </motion.div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    setUpdateData({
                                      ...updateData,
                                      images: Array.from(e.target.files),
                                      photoCount: e.target.files.length,
                                    });
                                  }
                                }}
                              />
                            </div>
                          </>
                        )}

                        {/* In Progress Form */}
                        {updateType === 'in-progress' && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Work Notes
                              </label>
                              <Textarea
                                placeholder="Describe what you've done or your observations..."
                                value={updateData.notes || ''}
                                onChange={(e) =>
                                  setUpdateData({ ...updateData, notes: e.target.value })
                                }
                                rows={4}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Button
                          className="flex-1 bg-gradient-primary hover:opacity-90"
                          onClick={handleSubmitUpdate}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Update
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowUpdatePanel(false);
                            setUpdateType(null);
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
