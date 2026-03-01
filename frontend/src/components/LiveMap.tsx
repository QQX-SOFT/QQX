"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";

const defaultCenter = { lat: 48.2082, lng: 16.3738 }; // Vienna Default for Austria focus

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

interface LiveMapProps {
    locations?: LiveMapLocation[];
    center?: { lat: number, lng: number };
    zoom?: number;
    singleMarker?: boolean;
    className?: string;
}

export default function LiveMap({
    locations = [],
    center,
    zoom = 13,
    singleMarker = false,
    className = "h-full w-full rounded-3xl overflow-hidden"
}: LiveMapProps) {
    const { isLoaded } = useGoogleMaps();
    const [selectedLoc, setSelectedLoc] = useState<LiveMapLocation | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const mapCenter = locations.length > 0 && singleMarker
        ? { lat: locations[0].lat, lng: locations[0].lng }
        : (center || defaultCenter);

    useEffect(() => {
        if (map && locations.length > 1 && !singleMarker) {
            const bounds = new google.maps.LatLngBounds();
            locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
            map.fitBounds(bounds);
        }
    }, [map, locations, singleMarker]);

    if (!isLoaded) return <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Lade Google Maps...</div>;

    const getStatusColor = (status?: string) => {
        if (status === 'RUNNING' || status === 'online' || status === 'ACTIVE') return '#22c55e'; // green
        if (status === 'PAUSED' || status === 'busy') return '#eab308'; // yellow
        return '#94a3b8'; // gray
    };

    return (
        <GoogleMap
            mapContainerClassName={className}
            center={mapCenter}
            zoom={zoom}
            onLoad={map => setMap(map)}
            options={{
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#747474" }, { "lightness": "24" }]
                    },
                    {
                        "featureType": "all",
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }]
                    },
                    // Add more premium dark/light styles if desired
                ],
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {locations.map((loc) => (
                <Marker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    onClick={() => setSelectedLoc(loc)}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: getStatusColor(loc.status),
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                        scale: 10,
                    }}
                />
            ))}

            {selectedLoc && (
                <InfoWindow
                    position={{ lat: selectedLoc.lat, lng: selectedLoc.lng }}
                    onCloseClick={() => setSelectedLoc(null)}
                >
                    <div className="p-2 min-w-[200px] font-sans text-slate-900">
                        <h6 className="m-0 mb-2 font-black text-[14px] uppercase border-b border-slate-100 pb-2">{selectedLoc.name}</h6>
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white" style={{ background: getStatusColor(selectedLoc.status) }}>
                                    {selectedLoc.status || 'offline'}
                                </span>
                            </div>
                            {selectedLoc.phone && (
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tel</span>
                                    <span className="text-[11px] font-bold">{selectedLoc.phone}</span>
                                </div>
                            )}
                            {selectedLoc.vehicle && (
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">KFZ</span>
                                    <span className="text-[11px] font-bold">{selectedLoc.vehicle}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
