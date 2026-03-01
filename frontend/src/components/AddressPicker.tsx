"use client";

import React, { useRef, useEffect } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";

interface AddressPickerProps {
    onAddressSelect: (address: {
        fullAddress: string,
        city: string,
        zipCode: string,
        lat: number,
        lng: number
    }) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
}

export default function AddressPicker({ onAddressSelect, placeholder, className, defaultValue }: AddressPickerProps) {
    const { isLoaded } = useGoogleMaps();
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const addressComponents = place.address_components || [];

                let zipCode = "";
                let city = "";

                addressComponents.forEach(component => {
                    const types = component.types;
                    if (types.includes("postal_code")) {
                        zipCode = component.long_name;
                    }
                    if (types.includes("locality")) {
                        city = component.long_name;
                    }
                });

                onAddressSelect({
                    fullAddress: place.formatted_address || "",
                    city,
                    zipCode,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            }
        }
    };

    if (!isLoaded) return <input disabled placeholder="Google Maps wird geladen..." className={className} />;

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
                componentRestrictions: { country: ["at", "de"] }, // Default to DACH region
                fields: ["address_components", "geometry", "formatted_address"]
            }}
        >
            <input
                type="text"
                placeholder={placeholder || "Adresse suchen..."}
                className={className}
                defaultValue={defaultValue}
            />
        </Autocomplete>
    );
}
