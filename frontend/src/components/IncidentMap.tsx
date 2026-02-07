import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Report } from '../pages/CitizenDashboard';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:${color}; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export function IncidentMap({ incidents, height = '400px' }: { incidents: Report[], height?: string }) {
  const center: [number, number] = [19.0760, 72.8777]; // Mumbai

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height }}>
      <MapContainer center={center} zoom={11} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {incidents.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.lat, report.lon]}
            icon={createCustomIcon(report.status === 'RESOLVED' ? '#10B981' : '#3B82F6')}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{report.description.slice(0, 30)}...</p>
                <p className="text-muted-foreground mt-1">Status: {report.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}