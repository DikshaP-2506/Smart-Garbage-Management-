'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds, DivIcon } from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { Ticket, TicketStatus } from '@/lib/supabase';

interface AdminMapViewProps {
  tickets: Ticket[];
  selectedTickets: string[];
  onTicketSelect: (ticketId: string, selected: boolean) => void;
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  NEW: '#ef4444',
  OPEN: '#f97316',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
};

const STATUS_BADGE: Record<TicketStatus, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  NEW: 'destructive',
  OPEN: 'default',
  IN_PROGRESS: 'secondary',
  COMPLETED: 'outline',
};

// Groups tickets that share the exact same lat/lng
function groupByLocation(tickets: Ticket[]): Map<string, Ticket[]> {
  const map = new Map<string, Ticket[]>();
  for (const ticket of tickets) {
    const key = `${ticket.latitude},${ticket.longitude}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ticket);
  }
  return map;
}

function ClusterMarker({
  tickets,
  selectedTickets,
  onSelect,
}: {
  tickets: Ticket[];
  selectedTickets: string[];
  onSelect: (ticketId: string, selected: boolean) => void;
}) {
  const count = tickets.length;
  const allSelected = tickets.every(t => selectedTickets.includes(t.id));
  const someSelected = tickets.some(t => selectedTickets.includes(t.id));

  // Pick dominant color based on worst status
  const priority: TicketStatus[] = ['NEW', 'OPEN', 'IN_PROGRESS', 'COMPLETED'];
  const dominantStatus = priority.find(s => tickets.some(t => t.status === s)) || tickets[0].status;
  const color = STATUS_COLORS[dominantStatus];

  // For a single-row ticket the DB ticket_count may already be > 1
  const dbCount = count === 1 ? (tickets[0].ticket_count ?? 1) : count;
  const showCount = dbCount > 1;

  const border = someSelected ? '3px solid #1f2937' : `2px solid ${color}`;
  const size = showCount ? 32 : 22;

  const icon = new DivIcon({
    html: `
      <div style="
        background-color: ${color};
        border: ${border};
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${showCount ? '11px' : '10px'};
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ${someSelected ? 'transform: scale(1.15);' : ''}
      ">
        ${showCount ? dbCount : '📍'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });

  const toggleAll = () => {
    tickets.forEach(t => onSelect(t.id, !allSelected));
  };

  if (count === 1) {
    const ticket = tickets[0];
    const isSelected = selectedTickets.includes(ticket.id);
    return (
      <Marker
        position={[ticket.latitude, ticket.longitude]}
        icon={icon}
        eventHandlers={{ click: () => onSelect(ticket.id, !isSelected) }}
      >
        <Popup>
          <div className="p-2 min-w-56">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{ticket.title || `Ticket ${ticket.id.slice(0, 8)}`}</span>
              <Badge variant={STATUS_BADGE[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
            </div>
            {(ticket.ticket_count ?? 1) > 1 && (
              <div className="text-xs font-medium text-amber-600 mb-1">
                🔁 {ticket.ticket_count} reports at this location
              </div>
            )}
            <p className="text-xs text-gray-600 mb-2">{ticket.description || 'No description'}</p>
            <div className="text-xs text-gray-500 space-y-0.5 mb-3">
              <div>Category: {ticket.category || 'Uncategorized'}</div>
              <div>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}</div>
            </div>
            <Button size="sm" variant={isSelected ? 'destructive' : 'default'} className="w-full"
              onClick={() => onSelect(ticket.id, !isSelected)}>
              {isSelected ? <><CheckCircle className="h-3 w-3 mr-1" />Selected</> : <><Plus className="h-3 w-3 mr-1" />Select</>}
            </Button>
          </div>
        </Popup>
      </Marker>
    );
  }

  // Cluster: multiple tickets at same location
  return (
    <Marker position={[tickets[0].latitude, tickets[0].longitude]} icon={icon}>
      <Popup maxWidth={280}>
        <div className="p-2 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">{count} tickets at this location</span>
            <Button size="sm" variant={allSelected ? 'destructive' : 'default'} onClick={toggleAll}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tickets.map(ticket => {
              const isSelected = selectedTickets.includes(ticket.id);
              return (
                <div key={ticket.id}
                  className={`border rounded p-2 text-xs cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}
                  onClick={() => onSelect(ticket.id, !isSelected)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate max-w-32">
                      {ticket.title || `Ticket ${ticket.id.slice(0, 8)}`}
                    </span>
                    <Badge variant={STATUS_BADGE[ticket.status]} className="text-[10px] px-1">
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-gray-500">{ticket.category || 'Uncategorized'}</div>
                  {isSelected && (
                    <div className="text-blue-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Auto-fit map bounds
function MapBounds({ tickets }: { tickets: Ticket[] }) {
  const map = useMap();
  useEffect(() => {
    if (tickets.length === 0) return;
    const uniqueLocations = new Set(tickets.map(t => `${t.latitude},${t.longitude}`));
    if (uniqueLocations.size === 1) {
      map.setView([tickets[0].latitude, tickets[0].longitude], 15);
    } else {
      const bounds = new LatLngBounds(tickets.map(t => [t.latitude, t.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tickets, map]);
  return null;
}

export default function AdminMapView({ tickets, selectedTickets, onTicketSelect }: AdminMapViewProps) {
  const [mapKey, setMapKey] = useState(0);
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [tickets.length]);

  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const locationGroups = groupByLocation(tickets);

  return (
    <div className="w-full h-full relative">
      <MapContainer key={mapKey} center={defaultCenter} zoom={6}
        className="w-full h-full" style={{ minHeight: '400px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds tickets={tickets} />
        {Array.from(locationGroups.values()).map(group => (
          <ClusterMarker
            key={`${group[0].latitude},${group[0].longitude}`}
            tickets={group}
            selectedTickets={selectedTickets}
            onSelect={onTicketSelect}
          />
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-medium mb-2 text-sm">Status Legend</h4>
        <div className="space-y-1 text-xs">
          {(['NEW', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as TicketStatus[]).map(s => (
            <div key={s} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }}></div>
              <span>{s.replace('_', ' ')}</span>
            </div>
          ))}
          <div className="flex items-center space-x-2 mt-1 pt-1 border-t">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-[9px]">3</div>
            <span>Cluster</span>
          </div>
        </div>
      </div>

      {/* Selection count */}
      {selectedTickets.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white rounded-lg p-3 z-[1000]">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

