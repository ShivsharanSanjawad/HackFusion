import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, CheckCircle2, Clock, AlertCircle, Camera, Upload,
  MessageSquare, Navigation, Wifi, WifiOff, Phone, MapPinned,
  Zap, Edit3, X, ArrowUp
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
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
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [updateType, setUpdateType] = useState<'in-progress' | 'update-status' | 'resolved' | null>(null);
  const [updateData, setUpdateData] = useState<Partial<UpdateMetadata>>({
    notes: '',
    photoCount: 0,
    images: [],
  });
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const HARDCODED_IDS = {
    reportID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    departmentId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    workerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const response = await fetch(`http://localhost:8080/worker/getTasks?workerId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': '123',
            'X-Username': 'venkat',
            'X-User-Type': 'Staff',
          }
        });
        const data = await response.json();
        
        const normalized = (Array.isArray(data) ? data : []).map((task: any) => {
          const lat = task.lat ?? task.location?.lat ?? 0;
          const lon = task.lon ?? task.lng ?? task.location?.lng ?? task.location?.lon ?? 0;
          
          // Only use address fields, don't fallback to description/title
          const address = task.location?.address || task.address || "No address listed";

          return {
            ...task,
            id: task.id,
            title: task.title || task.description || 'Untitled Task',
            lat: lat,
            lon: lon,
            location: {
              address: address,
              lat: lat,
              lng: lon,
            },
          };
        });
        
        setAssignedTasks(normalized);
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, [userId]);

  const selectedIncident = useMemo(() => {
    return assignedTasks.find(i => i.id === selectedTask) || assignedTasks[0];
  }, [selectedTask, assignedTasks]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitUpdate = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);

    try {
      if (updateType === 'resolved') {
        const imageStrings: string[] = [];
        for (const file of updateData.images || []) {
          const base64 = await fileToBase64(file);
          imageStrings.push(base64);
        }

        const payload = {
          reportID: selectedIncident.id || HARDCODED_IDS.reportID,
          workerID: HARDCODED_IDS.workerId,
          images: imageStrings,
          description: updateData.notes || '',
          date: updateData.updateDate || new Date().toISOString().split('T')[0],
        };

        const response = await fetch('http://localhost:8080/worker/completeReport', {
          method: 'POST',
          headers: {
            'X-User-Id': '123', 'X-Username': 'venkat', 'X-User-Type': 'Staff',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to complete report');
      } else {
        const payload = {
          reportID: selectedIncident.id || HARDCODED_IDS.reportID,
          departmentId: HARDCODED_IDS.departmentId,
          workerId: HARDCODED_IDS.workerId,
          newStatus: updateType === 'in-progress' ? 'in-progress' : (updateData.newStatus || ''),
          currDate: updateData.updateDate || new Date().toISOString().split('T')[0],
          description: updateData.notes || '',
        };

        const response = await fetch('http://localhost:8080/worker/updateStatus', {
          method: 'POST',
          headers: {
            'X-User-Id': '123', 'X-Username': 'venkat', 'X-User-Type': 'Staff',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to update status');
      }

      setShowUpdatePanel(false);
      setUpdateData({ notes: '', photoCount: 0, images: [] });
      alert("Update submitted successfully!");
    } catch (error) {
      console.error('Submission Error:', error);
      alert("Error submitting update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Field Operations</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <Wifi className="w-3 h-3" /> Online
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold px-1">Tasks ({assignedTasks.length})</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {tasksLoading ? <p>Loading...</p> : assignedTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={cn("p-4 rounded-xl cursor-pointer glass-card transition-all", selectedIncident?.id === task.id && "ring-2 ring-primary")}
                >
                  <h4 className="font-semibold text-sm">{task.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {task.location.address}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedIncident ? (
              <>
                <div className="glass-card p-6 rounded-2xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIncident.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{selectedIncident.location.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedIncident.lat},${selectedIncident.lon}`, '_blank')}
                      >
                        <Navigation className="w-4 h-4 mr-1" /> Nav
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => { setUpdateType('in-progress'); setShowUpdatePanel(true); }}>
                      <ArrowUp className="w-5 h-5 text-orange-500" /> In Progress
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => { setUpdateType('update-status'); setShowUpdatePanel(true); }}>
                      <Edit3 className="w-5 h-5 text-blue-500" /> Update Status
                    </Button>
                    <Button className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700" onClick={() => { setUpdateType('resolved'); setShowUpdatePanel(true); }}>
                      <CheckCircle2 className="w-5 h-5" /> Resolved
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {showUpdatePanel && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl border-t-4 border-primary">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold capitalize">{updateType?.replace('-', ' ')}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowUpdatePanel(false)}><X /></Button>
                      </div>

                      <div className="space-y-4">
                        {updateType === 'update-status' && (
                          <select 
                            className="w-full p-2 border rounded-md"
                            onChange={(e) => setUpdateData({...updateData, newStatus: e.target.value})}
                          >
                            <option value="">Select Status</option>
                            <option value="verified">Verified</option>
                            <option value="on-hold">On Hold</option>
                          </select>
                        )}

                        <Textarea 
                          placeholder="Notes about the work..." 
                          value={updateData.notes}
                          onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                        />

                        {updateType === 'resolved' && (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:bg-muted"
                          >
                            <Camera className="mx-auto mb-2 text-muted-foreground" />
                            <p className="text-xs font-medium">{updateData.images?.length || 0} Photos Selected</p>
                            <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => setUpdateData({...updateData, images: Array.from(e.target.files || [])})} />
                          </div>
                        )}

                        <Button className="w-full" onClick={handleSubmitUpdate} disabled={isSubmitting}>
                          {isSubmitting ? <Zap className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                          Confirm Submission
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="glass-card p-4 rounded-2xl h-[350px]">
                  <IncidentMap incidents={[selectedIncident]} height="100%" />
                </div>
              </>
            ) : <div className="p-20 text-center">Select a task</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}