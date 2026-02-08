import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Incident, IncidentStatus, mockIncidents } from '@/data/mockData';

interface IncidentContextType {
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus, actorName: string, details?: string) => void;
  upvoteIncident: (id: string) => void;
  getIncidentById: (id: string) => Incident | undefined;
  getIncidentsByUser: (userId: string) => Incident[];
  getIncidentsByDepartment: (department: string) => Incident[];
  getIncidentsByStatus: (status: IncidentStatus) => Incident[];
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  const addIncident = (
    incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>
  ) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `INC-${new Date().getFullYear()}-${String(incidents.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activityLog: [
        {
          id: `log-${Date.now()}`,
          action: 'Incident Reported',
          actor: incidentData.reportedBy,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncidentStatus = (
    id: string,
    status: IncidentStatus,
    actorName: string,
    details?: string
  ) => {
    setIncidents(prev =>
      prev.map(incident => {
        if (incident.id === id) {
          const actionMap: Record<IncidentStatus, string> = {
            reported: 'Incident Reported',
            verified: 'Verified',
            assigned: 'Assigned to Field Staff',
            'in-progress': 'Work Started',
            'on-hold': 'Put On Hold',
            resolved: 'Resolved',
          };

          return {
            ...incident,
            status,
            updatedAt: new Date().toISOString(),
            resolvedAt: status === 'resolved' ? new Date().toISOString() : incident.resolvedAt,
            activityLog: [
              ...incident.activityLog,
              {
                id: `log-${Date.now()}`,
                action: actionMap[status],
                actor: { id: 'system', name: actorName, email: '', role: 'authority' as const, createdAt: '' },
                timestamp: new Date().toISOString(),
                details,
              },
            ],
          };
        }
        return incident;
      })
    );
  };

  const upvoteIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(incident =>
        incident.id === id ? { ...incident, upvotes: incident.upvotes + 1 } : incident
      )
    );
  };

  const getIncidentById = (id: string) => incidents.find(i => i.id === id);

  const getIncidentsByUser = (userId: string) =>
    incidents.filter(i => i.reportedBy.id === userId);

  const getIncidentsByDepartment = (department: string) =>
    incidents.filter(i => i.department === department);

  const getIncidentsByStatus = (status: IncidentStatus) =>
    incidents.filter(i => i.status === status);

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        addIncident,
        updateIncidentStatus,
        upvoteIncident,
        getIncidentById,
        getIncidentsByUser,
        getIncidentsByDepartment,
        getIncidentsByStatus,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
}
