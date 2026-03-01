import axios from 'axios';

const API_KEY = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export interface DistanceResult {
    distanceKm: number;
    durationMin: number;
    origin: string;
    destination: string;
}

export async function getDistanceMatrix(origin: string, destination: string): Promise<DistanceResult> {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: origin,
                destinations: destination,
                key: API_KEY,
                mode: 'driving'
            }
        });

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(`Google Maps API error: ${data.status}`);
        }

        const element = data.rows[0].elements[0];

        if (element.status !== 'OK') {
            throw new Error(`Route not found: ${element.status}`);
        }

        return {
            distanceKm: element.distance.value / 1000,
            durationMin: Math.ceil(element.duration.value / 60),
            origin: data.origin_addresses[0],
            destination: data.destination_addresses[0]
        };
    } catch (error: any) {
        console.error("Distance Matrix Error:", error.response?.data || error.message);
        throw new Error("Mesafe hesaplanamadı.");
    }
}

export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number }> {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: API_KEY
            }
        });

        const data = response.data;
        if (data.status !== 'OK') {
            throw new Error(`Geocoding failed: ${data.status}`);
        }

        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng
        };
    } catch (error: any) {
        console.error("Geocoding Error:", error.message);
        throw new Error("Adres koordinata çevrilemedi.");
    }
}
