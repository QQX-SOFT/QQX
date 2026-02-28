"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom dynamic icon for drivers
const createDriverIcon = (status: string) => {
    let markerColor = '#94a3b8'; // offline (gray)
    if (status === 'online' || status === 'ACTIVE' || status === 'RUNNING') markerColor = '#4ade80'; // active (green)
    if (status === 'busy' || status === 'beschäftigt') markerColor = '#fbbf24'; // busy (yellow)
    if (status === 'pause' || status === 'PAUSED') markerColor = '#fbbf24'; // pause (yellow)
    if (status === 'mahlzeit') markerColor = '#a78bfa'; // meal (purple)

    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="background: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">🚗</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
    });
};

const defaultCenter: [number, number] = [52.5200, 13.4050]; // Berlin Default

// Component to dynamically set bounds when markers change
function MapBounds({ markers }: { markers: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const group = new L.FeatureGroup(markers.map(m => L.marker([m.lat, m.lng])));
            map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 16 });
        }
    }, [markers, map]);

    return null;
}

export interface LiveMapLocation {
    id: string;
    lat: number;
    lng: number;
    name?: string;
    status?: string;
    phone?: string;
    lastUpdate?: string;
    speed?: number;
    vehicle?: string;
    order?: string;
}

export default function LiveMap({
    locations = [],
    center = defaultCenter,
    zoom = 13,
    singleMarker = false,
    className = "h-full w-full rounded-3xl"
}: {
    locations?: LiveMapLocation[],
    center?: [number, number],
    zoom?: number,
    singleMarker?: boolean,
    className?: string
}) {
    // Determine map center based on points
    const mapCenter = locations.length > 0 && singleMarker ? [locations[0].lat, locations[0].lng] as [number, number] : center;

    return (
        <MapContainer
            center={mapCenter}
            zoom={zoom}
            className={className}
            style={{ zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Nice crisp map style
            />

            {locations.length > 1 && !singleMarker && <MapBounds markers={locations} />}

            {locations.map((loc) => (
                <Marker
                    key={loc.id}
                    position={[loc.lat, loc.lng]}
                    icon={createDriverIcon(loc.status || 'offline')}
                >
                    {loc.name && (
                        <Popup>
                            <div className="min-w-[200px] font-sans">
                                <h6 className="m-0 mb-3 font-bold text-[15px] border-b pb-2">{loc.name}</h6>
                                <div className="text-[13px] leading-relaxed space-y-1 mt-2">
                                    <div className="flex items-center gap-2">
                                        <strong>Status:</strong>
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-white ${(loc.status === 'RUNNING' || loc.status === 'online' || loc.status === 'ACTIVE') ? 'bg-green-500' :
                                                (loc.status === 'PAUSED' || loc.status === 'busy' || loc.status === 'beschäftigt') ? 'bg-yellow-500' :
                                                    'bg-slate-400'
                                            }`}>{loc.status || 'offline'}</span>
                                    </div>
                                    {loc.phone && <div><strong>Telefon:</strong> <a href={`tel:${loc.phone}`} className="text-blue-600 no-underline">{loc.phone}</a></div>}
                                    {loc.lastUpdate && <div><strong>Letztes Update:</strong> {loc.lastUpdate}</div>}
                                    {loc.speed !== undefined && <div><strong>Geschwindigkeit:</strong> {loc.speed} km/h</div>}
                                    {loc.vehicle && <div><strong>Kennzeichen:</strong> {loc.vehicle}</div>}
                                    {loc.order && <div className="mt-2 pt-2 border-t"><strong>Aktiver Auftrag:</strong><br /><span className="text-blue-600 font-medium">{loc.order}</span></div>}

                                </div>
                                <div className="mt-4">
                                    <a href={`/admin/drivers/${loc.id.replace('me', '')}`} className="block w-full text-center bg-blue-600 text-white font-bold py-2 rounded-lg no-underline hover:bg-blue-700 transition">
                                        Profil ansehen
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
}
