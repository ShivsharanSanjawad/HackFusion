import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident, cityCenter } from '@/data/mockData';
import { StatusBadge, PriorityBadge, CategoryBadge } from './ui/badges';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const statusColors: Record<string, string> = {
  reported: '#6B7280',
  verified: '#3B82F6',
  assigned: '#8B5CF6',
  'in-progress': '#F59E0B',
  'on-hold': '#F97316',
  resolved: '#10B981',
};

const priorityColors: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};

interface IncidentMapProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  showHeatmap?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

function MapController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  
  return null;
}

export function IncidentMap({
  incidents,
  onIncidentClick,
  showHeatmap = false,
  center = cityCenter,
  zoom = cityCenter.zoom,
  height = '500px',
}: IncidentMapProps) {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Heatmap effect using circles */}
        {showHeatmap && incidents.map((incident) => (
          <CircleMarker
            key={`heat-${incident.id}`}
            center={[incident.location.lat, incident.location.lng]}
            radius={30}
            pathOptions={{
              color: 'transparent',
              fillColor: priorityColors[incident.priority],
              fillOpacity: 0.2,
            }}
          />
        ))}
        
        {/* Incident markers */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
            icon={createCustomIcon(
              incident.priority === 'critical'
                ? priorityColors.critical
                : statusColors[incident.status]
            )}
            eventHandlers={{
              click: () => onIncidentClick?.(incident),
            }}
          >
            <Popup className="incident-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={incident.category} showLabel={false} size="sm" />
                  <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2">{incident.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <StatusBadge status={incident.status} size="sm" />
                  <PriorityBadge priority={incident.priority} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{incident.location.address}</p>
                {onIncidentClick && (
                  <button
                    onClick={() => onIncidentClick(incident)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 glass-card p-3 z-[1000]">
        <h4 className="text-xs font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-xs">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MiniMapProps {
  lat: number;
  lng: number;
  height?: string;
}

export function MiniMap({ lat, lng, height = '200px' }: MiniMapProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          icon={createCustomIcon('#3B82F6', 20)}
        />
      </MapContainer>
    </div>
  );
}
