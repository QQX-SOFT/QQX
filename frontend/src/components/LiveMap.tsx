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

// Custom icon for drivers
const driverIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    className: "hue-rotate-[140deg] saturate-200 contrast-150" // turn it reddish or green
});

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

export default function LiveMap({
    locations = [],
    center = defaultCenter,
    zoom = 13,
    singleMarker = false,
    className = "h-full w-full rounded-3xl"
}: {
    locations?: { id: string, name?: string, lat: number, lng: number }[],
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
                    icon={driverIcon}
                >
                    {loc.name && (
                        <Popup>
                            <div className="font-bold text-sm">{loc.name}</div>
                            <div className="text-[10px] text-slate-500">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
}
