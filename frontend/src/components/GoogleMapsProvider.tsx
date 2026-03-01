"use client";

import React, { createContext, useContext } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

const GoogleMapsContext = createContext<{ isLoaded: boolean }>({ isLoaded: false });

export const useGoogleMaps = () => useContext(GoogleMapsContext);

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
    // Fallback key provided by user for immediate stability
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBusnALj0LNVzcmmdbgMh7Ec0-BUJWJsTg";

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
        libraries,
    });

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        console.warn("GoogleMapsProvider: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing, using fallback.");
    }

    return (
        <GoogleMapsContext.Provider value={{ isLoaded }}>
            {children}
        </GoogleMapsContext.Provider>
    );
}
