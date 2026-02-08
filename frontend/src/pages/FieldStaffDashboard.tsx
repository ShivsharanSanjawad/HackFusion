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

  // 🔒 HARDCODED WORKER IDs FROM DATABASE
  // Switch worker by changing the hardcoded ID:
  // alice_tech - Engineering: f47ac10b-58cc-4372-a567-0e02b2c3d479
  // bob_ops - Operations: b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f
  // charlie_data - Data Science: 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a

  const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Hardcoded: alice_tech
  const departmentId = '550e8400-e29b-41d4-a716-446655440000'; // Hardcoded: Engineering

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [updateType, setUpdateType] =
    useState<'in-progress' | 'update-status' | 'resolved' | null>(null);

  const [updateData, setUpdateData] = useState<Partial<UpdateMetadata>>({
    notes: '',
    photoCount: 0,
    images: [],
  });

  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        setErrorMessage(null);

        console.log('Fetching tasks for userId:', userId);

        const response = await fetch(
          `http://localhost:8080/worker/getTasks?workerId=${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Fetch error details:', errorData);
          throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Tasks fetched successfully:', data);

        const normalized = (Array.isArray(data) ? data : []).map((task: any) => {
          const lat = task.lat ?? task.location?.lat ?? 0;
          const lon =
            task.lon ??
            task.lng ??
            task.location?.lng ??
            task.location?.lon ??
            0;

          const address =
            task.location?.address || task.address || 'No address listed';

          return {
            ...task,
            id: task.id,
            title: task.title || task.description || 'Untitled Task',
            lat,
            lon,
            location: {
              address,
              lat,
              lng: lon,
            },
          };
        });

        setAssignedTasks(normalized);
        if (normalized.length > 0) {
          setSelectedTask(normalized[0].id);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        setErrorMessage(`Failed to load tasks: ${error}`);
        setAssignedTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  const selectedIncident = useMemo(() => {
    return assignedTasks.find(i => i.id === selectedTask) || assignedTasks[0];
  }, [selectedTask, assignedTasks]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmitUpdate = async () => {
    if (!selectedIncident || !userId) {
      setErrorMessage('No task selected or user not logged in');
      return;
    }
    setIsSubmitting(true);

    try {
      if (updateType === 'resolved') {
        const imageStrings: string[] = [];
        for (const file of updateData.images || []) {
          imageStrings.push(await fileToBase64(file));
        }

        const payload = {
          reportID: selectedIncident.id,
          workerID: userId,
          images: imageStrings,
          description: updateData.notes || '',
          date:
            updateData.updateDate ||
            new Date().toISOString().split('T')[0],
        };

        console.log('Submitting completion payload:', payload);

        const response = await fetch(
          'http://localhost:8080/worker/completeReport',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Failed to complete report: ${response.status} ${JSON.stringify(errorData)}`);
        }

        setErrorMessage(null);
        alert('Report completed successfully!');
      } else {
        const payload = {
          reportID: selectedIncident.id,
          departmentId: departmentId,
          workerId: userId,
          newStatus:
            updateType === 'in-progress'
              ? 'in-progress'
              : updateData.newStatus || '',
          currDate:
            updateData.updateDate ||
            new Date().toISOString().split('T')[0],
          description: updateData.notes || '',
        };

        console.log('Submitting status update payload:', payload);

        const response = await fetch(
          'http://localhost:8080/worker/updateStatus',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Failed to update status: ${response.status} ${JSON.stringify(errorData)}`);
        }

        setErrorMessage(null);
        alert('Status updated successfully!');
      }

      setShowUpdatePanel(false);
      setUpdateData({ notes: '', photoCount: 0, images: [] });

      // Refresh tasks after update
      if (userId) {
        const refreshResponse = await fetch(
          `http://localhost:8080/worker/getTasks?workerId=${userId}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const normalized = (Array.isArray(refreshData) ? refreshData : []).map((task: any) => ({
            ...task,
            title: task.title || task.description || 'Untitled Task',
            location: {
              address: task.location?.address || task.address || 'No address',
              lat: task.lat ?? 0,
              lng: task.lon ?? 0,
            },
          }));
          setAssignedTasks(normalized);
        }
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setErrorMessage(`Error: ${error}`);
      alert(`Error submitting update: ${error}`);
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
            <h3 className="font-semibold px-1">
              Tasks ({assignedTasks.length})
            </h3>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}
              {tasksLoading ? (
                <p>Loading...</p>
              ) : (
                assignedTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task.id)}
                    className={cn(
                      'p-4 rounded-xl cursor-pointer glass-card transition-all',
                      selectedIncident?.id === task.id &&
                      'ring-2 ring-primary'
                    )}
                  >
                    <h4 className="font-semibold text-sm">{task.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {task.location.address}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedIncident ? (
              <>
                <div className="glass-card p-6 rounded-2xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedIncident.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedIncident.location.address}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedIncident.lat},${selectedIncident.lon}`,
                          '_blank'
                        )
                      }
                    >
                      <Navigation className="w-4 h-4 mr-1" /> Nav
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => {
                        setUpdateType('in-progress');
                        setShowUpdatePanel(true);
                      }}
                    >
                      <ArrowUp className="w-5 h-5 text-orange-500" />
                      In Progress
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => {
                        setUpdateType('update-status');
                        setShowUpdatePanel(true);
                      }}
                    >
                      <Edit3 className="w-5 h-5 text-blue-500" />
                      Update Status
                    </Button>

                    <Button
                      className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setUpdateType('resolved');
                        setShowUpdatePanel(true);
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Resolved
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {showUpdatePanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-2xl border-t-4 border-primary"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold capitalize">
                          {updateType?.replace('-', ' ')}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowUpdatePanel(false)}
                        >
                          <X />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {updateType === 'update-status' && (
                          <select
                            className="w-full p-2 border rounded-md"
                            onChange={e =>
                              setUpdateData({
                                ...updateData,
                                newStatus: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Status</option>
                            <option value="in-progress">In Progress</option>
                            <option value="assigned">Assigned</option>
                            <option value="verified">Verified</option>
                          </select>
                        )}

                        <Textarea
                          placeholder="Notes about the work..."
                          value={updateData.notes}
                          onChange={e =>
                            setUpdateData({
                              ...updateData,
                              notes: e.target.value,
                            })
                          }
                        />

                        {updateType === 'resolved' && (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:bg-muted"
                          >
                            <Camera className="mx-auto mb-2 text-muted-foreground" />
                            <p className="text-xs font-medium">
                              {updateData.images?.length || 0} Photos Selected
                            </p>
                            <input
                              type="file"
                              multiple
                              hidden
                              ref={fileInputRef}
                              onChange={e =>
                                setUpdateData({
                                  ...updateData,
                                  images: Array.from(
                                    e.target.files || []
                                  ),
                                })
                              }
                            />
                          </div>
                        )}

                        <Button
                          className="w-full"
                          onClick={handleSubmitUpdate}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Zap className="animate-spin mr-2" />
                          ) : (
                            <Upload className="mr-2" />
                          )}
                          Confirm Submission
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="glass-card p-4 rounded-2xl h-[350px]">
                  <IncidentMap
                    incidents={[selectedIncident]}
                    height="100%"
                  />
                </div>
              </>
            ) : (
              <div className="p-20 text-center">Select a task</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}