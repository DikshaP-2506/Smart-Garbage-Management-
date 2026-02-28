'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, DivIcon } from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { Ticket, TicketStatus } from '@/lib/supabase';

interface AdminMapViewProps {
  tickets: Ticket[];
  selectedTickets: string[];
  onTicketSelect: (ticketId: string, selected: boolean) => void;
}

// Custom marker component that handles selection
function TicketMarker({ 
  ticket, 
  isSelected, 
  onSelect 
}: { 
  ticket: Ticket; 
  isSelected: boolean; 
  onSelect: (ticketId: string, selected: boolean) => void;
}) {
  const getMarkerColor = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return '#ef4444'; // Red
      case 'OPEN': return '#f97316'; // Orange
      case 'IN_PROGRESS': return '#3b82f6'; // Blue
      case 'COMPLETED': return '#22c55e'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return '⚠️';
      case 'OPEN': return '🕐';
      case 'IN_PROGRESS': return '▶️';
      case 'COMPLETED': return '✅';
      default: return '📍';
    }
  };

  const color = getMarkerColor(ticket.status);
  const borderColor = isSelected ? '#1f2937' : color;
  const borderWidth = isSelected ? '4px' : '2px';

  // Create custom DivIcon for better styling control
  const customIcon = new DivIcon({
    html: `
      <div style="
        background-color: ${color};
        border: ${borderWidth} solid ${borderColor};
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ${isSelected ? 'transform: scale(1.2);' : ''}
      ">
        ${getStatusIcon(ticket.status)}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return 'destructive';
      case 'OPEN': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'COMPLETED': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Marker
      position={[ticket.latitude, ticket.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          onSelect(ticket.id, !isSelected);
        }
      }}
    >
      <Popup>
        <div className="p-2 min-w-64">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{ticket.title || `Ticket ${ticket.id.slice(0, 8)}`}</h3>
            <Badge variant={getStatusBadgeVariant(ticket.status)}>
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{ticket.description || 'No description available'}</p>
          
          <div className="space-y-1 text-xs text-gray-500">
            <div>Category: {ticket.category || 'Uncategorized'}</div>
            <div>Confidence: {Math.round((ticket.confidence_score || 0) * 100)}%</div>
            <div>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}</div>
          </div>
          
          <div className="mt-3 flex items-center space-x-2">
            <Button
              size="sm"
              variant={isSelected ? "destructive" : "default"}
              onClick={() => onSelect(ticket.id, !isSelected)}
              className="flex items-center space-x-1"
            >
              {isSelected ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span>Selected</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Select</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Component to auto-fit map bounds to show all markers
function MapBounds({ tickets }: { tickets: Ticket[] }) {
  const map = useMap();

  useEffect(() => {
    if (tickets.length === 0) return;

    // Check if all tickets are at the same location
    const uniqueLocations = new Set(
      tickets.map(t => `${t.latitude},${t.longitude}`)
    );

    if (uniqueLocations.size === 1) {
      // All tickets at same location - just center on that point with good zoom
      const ticket = tickets[0];
      map.setView([ticket.latitude, ticket.longitude], 15);
    } else {
      // Multiple locations - fit bounds
      const bounds = new LatLngBounds(
        tickets.map(ticket => [ticket.latitude, ticket.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tickets, map]);

  return null;
}

export default function AdminMapView({ tickets, selectedTickets, onTicketSelect }: AdminMapViewProps) {
  const [mapKey, setMapKey] = useState(0);

  // Default center (can be adjusted based on your city/region)
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center
  const defaultZoom = 6;

  useEffect(() => {
    // Force re-render of map when tickets change significantly
    setMapKey(prev => prev + 1);
  }, [tickets.length]);

  // Show loading state
  if (typeof window === 'undefined') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        key={mapKey}
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Auto-fit bounds to show all markers */}
        <MapBounds tickets={tickets} />
        
        {/* Render ticket markers */}
        {tickets.map(ticket => (
          <TicketMarker
            key={ticket.id}
            ticket={ticket}
            isSelected={selectedTickets.includes(ticket.id)}
            onSelect={onTicketSelect}
          />
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-medium mb-2 text-sm">Status Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>New</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Open</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Selection Info */}
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