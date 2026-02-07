// Mock Data for Urban Infrastructure Incident Management Platform

export type IncidentCategory = 'power' | 'water' | 'roads' | 'sanitation' | 'streetlights';
export type IncidentStatus = 'reported' | 'verified' | 'assigned' | 'in-progress' | 'on-hold' | 'resolved';
export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
export type UserRole = 'citizen' | 'authority' | 'field-staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  ward?: string;
  phone?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: User;
  timestamp: string;
  details?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
  };
  images: string[];
  reportedBy: User;
  assignedTo?: User;
  department?: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  estimatedResolution?: string;
  resolvedAt?: string;
  activityLog: ActivityLog[];
  isDuplicate?: boolean;
  duplicateOf?: string;
}

export interface Department {
  id: string;
  name: string;
  shortCode: string;
  head: string;
  staffCount: number;
  activeIncidents: number;
  resolvedThisMonth: number;
  avgResolutionTime: number; // in hours
  performanceScore: number; // 0-100
}

// Category metadata
export const categoryConfig: Record<IncidentCategory, { label: string; icon: string; color: string }> = {
  power: { label: 'Power Outage', icon: 'Zap', color: 'text-yellow-500' },
  water: { label: 'Water Supply', icon: 'Droplets', color: 'text-blue-500' },
  roads: { label: 'Road Damage', icon: 'Construction', color: 'text-orange-500' },
  sanitation: { label: 'Sanitation', icon: 'Trash2', color: 'text-green-500' },
  streetlights: { label: 'Streetlights', icon: 'Lightbulb', color: 'text-purple-500' },
};

export const statusConfig: Record<IncidentStatus, { label: string; color: string; bgColor: string }> = {
  reported: { label: 'Reported', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  verified: { label: 'Verified', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  assigned: { label: 'Assigned', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  'in-progress': { label: 'In Progress', color: 'text-warning', bgColor: 'bg-warning/10' },
  'on-hold': { label: 'On Hold', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  resolved: { label: 'Resolved', color: 'text-success', bgColor: 'bg-success/10' },
};

export const priorityConfig: Record<IncidentPriority, { label: string; color: string; bgColor: string }> = {
  critical: { label: 'Critical', color: 'text-danger', bgColor: 'bg-danger/10' },
  high: { label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-100' },
  medium: { label: 'Medium', color: 'text-warning', bgColor: 'bg-warning/10' },
  low: { label: 'Low', color: 'text-green-500', bgColor: 'bg-green-100' },
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'citizen-1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@email.com',
    role: 'citizen',
    ward: 'Ward 15 - Koramangala',
    phone: '+91 98765 43210',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'citizen-2',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    role: 'citizen',
    ward: 'Ward 12 - Indiranagar',
    phone: '+91 98765 43211',
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    id: 'authority-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@municipality.gov',
    role: 'authority',
    department: 'Power Department',
    createdAt: '2023-06-10T09:00:00Z',
  },
  {
    id: 'authority-2',
    name: 'Sunita Reddy',
    email: 'sunita.reddy@municipality.gov',
    role: 'authority',
    department: 'Water Supply',
    createdAt: '2023-08-15T11:30:00Z',
  },
  {
    id: 'staff-1',
    name: 'Venkat Rao',
    email: 'venkat.rao@municipality.gov',
    role: 'field-staff',
    department: 'Power Department',
    phone: '+91 98765 43212',
    createdAt: '2023-09-01T08:00:00Z',
  },
  {
    id: 'staff-2',
    name: 'Mohammed Ishaq',
    email: 'mohammed.ishaq@municipality.gov',
    role: 'field-staff',
    department: 'Water Supply',
    phone: '+91 98765 43213',
    createdAt: '2023-10-15T10:30:00Z',
  },
  {
    id: 'staff-2',
    name: 'Ramesh Mehta',
    email: 'ramesh.mehta@municipality.gov',
    role: 'field-staff',
    department: 'Water Supply',
    phone: '+91 98765 43213',
    createdAt: '2023-10-15T10:30:00Z',
  },
];

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-power',
    name: 'Power Department',
    shortCode: 'PWR',
    head: 'Rajesh Kumar',
    staffCount: 45,
    activeIncidents: 12,
    resolvedThisMonth: 87,
    avgResolutionTime: 4.5,
    performanceScore: 92,
  },
  {
    id: 'dept-water',
    name: 'Water Supply Department',
    shortCode: 'WTR',
    head: 'Sunita Reddy',
    staffCount: 38,
    activeIncidents: 8,
    resolvedThisMonth: 65,
    avgResolutionTime: 6.2,
    performanceScore: 88,
  },
  {
    id: 'dept-roads',
    name: 'Roads & Infrastructure',
    shortCode: 'RDS',
    head: 'Vikram Singh',
    staffCount: 52,
    activeIncidents: 23,
    resolvedThisMonth: 41,
    avgResolutionTime: 24.0,
    performanceScore: 75,
  },
  {
    id: 'dept-sanitation',
    name: 'Sanitation Department',
    shortCode: 'SAN',
    head: 'Lakshmi Devi',
    staffCount: 60,
    activeIncidents: 15,
    resolvedThisMonth: 120,
    avgResolutionTime: 2.8,
    performanceScore: 95,
  },
  {
    id: 'dept-lights',
    name: 'Street Lighting',
    shortCode: 'LGT',
    head: 'Arun Joshi',
    staffCount: 25,
    activeIncidents: 18,
    resolvedThisMonth: 95,
    avgResolutionTime: 3.5,
    performanceScore: 90,
  },
];

// Mock Incidents
export const mockIncidents: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Major Power Outage in Block A',
    description: 'Complete power failure affecting approximately 50 households in residential Block A. Started around 2 PM today. Multiple complaints received from residents.',
    category: 'power',
    status: 'in-progress',
    priority: 'critical',
    location: {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Block A, 4th Cross, Koramangala',
      ward: 'Ward 15',
    },
    images: ['https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400'],
    reportedBy: mockUsers[0],
    assignedTo: mockUsers[4],
    department: 'Power Department',
    upvotes: 47,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    estimatedResolution: '2024-01-20T20:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[0], timestamp: '2024-01-20T14:30:00Z' },
      { id: 'log-2', action: 'Verified by System', actor: mockUsers[2], timestamp: '2024-01-20T14:35:00Z' },
      { id: 'log-3', action: 'Assigned to Field Staff', actor: mockUsers[2], timestamp: '2024-01-20T15:00:00Z', details: 'Assigned to Venkat Rao' },
      { id: 'log-4', action: 'Work Started', actor: mockUsers[4], timestamp: '2024-01-20T16:45:00Z', details: 'Transformer inspection underway' },
    ],
  },
  {
    id: 'INC-2024-002',
    title: 'Water Pipeline Leak on MG Road',
    description: 'Major water leak from underground pipeline causing water wastage and road flooding. Water pressure in nearby buildings significantly reduced.',
    category: 'water',
    status: 'assigned',
    priority: 'high',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'MG Road, Near Trinity Metro Station',
      ward: 'Ward 12',
    },
    images: ['https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400'],
    reportedBy: mockUsers[1],
    assignedTo: mockUsers[5],
    department: 'Water Supply',
    upvotes: 32,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
    estimatedResolution: '2024-01-21T12:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[1], timestamp: '2024-01-20T09:15:00Z' },
      { id: 'log-2', action: 'Verified', actor: mockUsers[3], timestamp: '2024-01-20T10:00:00Z' },
      { id: 'log-3', action: 'Assigned to Field Staff', actor: mockUsers[3], timestamp: '2024-01-20T11:30:00Z' },
    ],
  },
  {
    id: 'INC-2024-003',
    title: 'Large Pothole on Outer Ring Road',
    description: 'Dangerous pothole approximately 2 feet wide and 8 inches deep on the main carriageway. Several vehicles have been damaged. Urgent repair needed.',
    category: 'roads',
    status: 'verified',
    priority: 'high',
    location: {
      lat: 12.9279,
      lng: 77.6271,
      address: 'Outer Ring Road, Near Marathahalli Bridge',
      ward: 'Ward 18',
    },
    images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400'],
    reportedBy: mockUsers[0],
    upvotes: 89,
    createdAt: '2024-01-19T17:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[0], timestamp: '2024-01-19T17:00:00Z' },
      { id: 'log-2', action: 'Verified', actor: mockUsers[2], timestamp: '2024-01-20T08:00:00Z', details: 'Confirmed via field inspection' },
    ],
  },
  {
    id: 'INC-2024-004',
    title: 'Garbage Not Collected for 3 Days',
    description: 'Regular garbage collection has not happened in our locality for the past 3 days. Waste is piling up at collection points and causing hygiene issues.',
    category: 'sanitation',
    status: 'resolved',
    priority: 'medium',
    location: {
      lat: 12.9560,
      lng: 77.7010,
      address: '2nd Stage, HAL Layout',
      ward: 'Ward 20',
    },
    images: [],
    reportedBy: mockUsers[1],
    upvotes: 23,
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z',
    resolvedAt: '2024-01-19T16:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[1], timestamp: '2024-01-18T08:00:00Z' },
      { id: 'log-2', action: 'Assigned', actor: mockUsers[2], timestamp: '2024-01-18T09:30:00Z' },
      { id: 'log-3', action: 'Resolved', actor: mockUsers[4], timestamp: '2024-01-19T16:00:00Z', details: 'Collection completed. Route schedule updated.' },
    ],
  },
  {
    id: 'INC-2024-005',
    title: 'Multiple Streetlights Not Working',
    description: '5 consecutive streetlights on 1st Main Road are not functioning for the past week. Area becomes very dark after 7 PM, safety concern for pedestrians.',
    category: 'streetlights',
    status: 'in-progress',
    priority: 'medium',
    location: {
      lat: 12.9611,
      lng: 77.6387,
      address: '1st Main Road, Indiranagar',
      ward: 'Ward 12',
    },
    images: ['https://images.unsplash.com/photo-1558346547-b8c8f3e8b7a4?w=400'],
    reportedBy: mockUsers[0],
    assignedTo: mockUsers[4],
    department: 'Street Lighting',
    upvotes: 41,
    createdAt: '2024-01-17T19:30:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    estimatedResolution: '2024-01-21T18:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[0], timestamp: '2024-01-17T19:30:00Z' },
      { id: 'log-2', action: 'Verified', actor: mockUsers[2], timestamp: '2024-01-18T09:00:00Z' },
      { id: 'log-3', action: 'Assigned', actor: mockUsers[2], timestamp: '2024-01-19T11:00:00Z' },
      { id: 'log-4', action: 'Work Started', actor: mockUsers[4], timestamp: '2024-01-20T10:00:00Z', details: 'Inspecting electrical connections' },
    ],
  },
  {
    id: 'INC-2024-006',
    title: 'Sewage Overflow in Residential Area',
    description: 'Sewage overflowing from manhole onto the street. Strong foul smell affecting the entire block. Health hazard for residents.',
    category: 'sanitation',
    status: 'reported',
    priority: 'critical',
    location: {
      lat: 12.9150,
      lng: 77.6400,
      address: '5th Block, Jayanagar',
      ward: 'Ward 22',
    },
    images: [],
    reportedBy: mockUsers[1],
    upvotes: 56,
    createdAt: '2024-01-20T18:00:00Z',
    updatedAt: '2024-01-20T18:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[1], timestamp: '2024-01-20T18:00:00Z' },
    ],
  },
  {
    id: 'INC-2024-007',
    title: 'Low Voltage Issue in Commercial Complex',
    description: 'Frequent voltage fluctuations and low voltage problem in the commercial complex. Electronic equipment getting damaged.',
    category: 'power',
    status: 'on-hold',
    priority: 'medium',
    location: {
      lat: 12.9780,
      lng: 77.5700,
      address: 'Brigade Road Commercial Complex',
      ward: 'Ward 10',
    },
    images: [],
    reportedBy: mockUsers[0],
    assignedTo: mockUsers[4],
    department: 'Power Department',
    upvotes: 18,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[0], timestamp: '2024-01-15T11:00:00Z' },
      { id: 'log-2', action: 'Assigned', actor: mockUsers[2], timestamp: '2024-01-16T10:00:00Z' },
      { id: 'log-3', action: 'Put On Hold', actor: mockUsers[4], timestamp: '2024-01-19T14:00:00Z', details: 'Waiting for specialized equipment' },
    ],
  },
  {
    id: 'INC-2024-008',
    title: 'Road Cave-in Near Metro Construction',
    description: 'Part of the road has caved in near the metro construction site. Barricades placed but proper repair needed urgently.',
    category: 'roads',
    status: 'assigned',
    priority: 'critical',
    location: {
      lat: 12.9850,
      lng: 77.5960,
      address: 'Near Cubbon Park Metro Station',
      ward: 'Ward 8',
    },
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
    reportedBy: mockUsers[1],
    assignedTo: mockUsers[5],
    department: 'Roads & Infrastructure',
    upvotes: 124,
    createdAt: '2024-01-20T07:30:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    estimatedResolution: '2024-01-22T18:00:00Z',
    activityLog: [
      { id: 'log-1', action: 'Incident Reported', actor: mockUsers[1], timestamp: '2024-01-20T07:30:00Z' },
      { id: 'log-2', action: 'Priority Escalated', actor: mockUsers[2], timestamp: '2024-01-20T08:00:00Z', details: 'Marked as critical due to safety risk' },
      { id: 'log-3', action: 'Assigned', actor: mockUsers[2], timestamp: '2024-01-20T12:00:00Z' },
    ],
    isDuplicate: false,
  },
];

// Statistics for dashboard
export const dashboardStats = {
  totalActiveIncidents: mockIncidents.filter(i => i.status !== 'resolved').length,
  incidentsByCategory: {
    power: mockIncidents.filter(i => i.category === 'power').length,
    water: mockIncidents.filter(i => i.category === 'water').length,
    roads: mockIncidents.filter(i => i.category === 'roads').length,
    sanitation: mockIncidents.filter(i => i.category === 'sanitation').length,
    streetlights: mockIncidents.filter(i => i.category === 'streetlights').length,
  },
  avgResolutionTime: 5.2, // hours
  citizenSatisfaction: 87, // percentage
  resolvedThisWeek: 156,
  reportedThisWeek: 89,
};

// City center coordinates (Bangalore)
export const cityCenter = {
  lat: 12.9716,
  lng: 77.5946,
  zoom: 12,
};

// Ward boundaries (simplified for demo)
export const wards = [
  { id: 'ward-8', name: 'Ward 8 - Cubbon Park', incidentDensity: 'low' },
  { id: 'ward-10', name: 'Ward 10 - Brigade Road', incidentDensity: 'medium' },
  { id: 'ward-12', name: 'Ward 12 - Indiranagar', incidentDensity: 'high' },
  { id: 'ward-15', name: 'Ward 15 - Koramangala', incidentDensity: 'high' },
  { id: 'ward-18', name: 'Ward 18 - Marathahalli', incidentDensity: 'medium' },
  { id: 'ward-20', name: 'Ward 20 - HAL Layout', incidentDensity: 'low' },
  { id: 'ward-22', name: 'Ward 22 - Jayanagar', incidentDensity: 'medium' },
];
