import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '@/data/mockData';

// Support both Incident (mockData) and Report (API) types
type IncidentLike = Incident | {
  id: string;
  description: string;
  status: string;
  lat: number;
  lon: number;
};

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (status: string) => {
  const colorMap: Record<string, string> = {
    'resolved': '#10B981',
    'RESOLVED': '#10B981',
    'in-progress': '#F59E0B',
    'IN_PROGRESS': '#F59E0B',
    'on-hold': '#EF4444',
    'ON_HOLD': '#EF4444',
    'default': '#3B82F6'
  };
  
  const color = colorMap[status] || colorMap['default'];
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color}; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export function IncidentMap({ incidents, height = '400px' }: { incidents: IncidentLike[], height?: string }) {
  const center: [number, number] = [19.0760, 72.8777]; // Mumbai

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height }}>
      <MapContainer center={center} zoom={11} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {incidents.map((incident) => {
          // Handle both Incident and Report types
          const isIncident = 'title' in incident;
          const lat = isIncident ? (incident as Incident).location.lat : (incident as any).lat;
          const lng = isIncident ? (incident as Incident).location.lng : (incident as any).lon;
          const title = isIncident ? (incident as Incident).title : (incident as any).description?.slice(0, 30) + '...';
          const status = (incident as any).status;
          
          return (
            <Marker 
              key={incident.id} 
              position={[lat, lng]}
              icon={createCustomIcon(status)}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">{title}</p>
                  <p className="text-muted-foreground mt-1">Status: <span className="capitalize">{status.toLowerCase()}</span></p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}