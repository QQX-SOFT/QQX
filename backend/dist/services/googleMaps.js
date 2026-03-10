"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistanceMatrix = getDistanceMatrix;
exports.geocodeAddress = geocodeAddress;
const axios_1 = __importDefault(require("axios"));
const API_KEY = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
async function getDistanceMatrix(origin, destination) {
    try {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
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
    }
    catch (error) {
        console.error("Distance Matrix Error:", error.response?.data || error.message);
        throw new Error("Mesafe hesaplanamadı.");
    }
}
async function geocodeAddress(address) {
    try {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
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
    }
    catch (error) {
        console.error("Geocoding Error:", error.message);
        throw new Error("Adres koordinata çevrilemedi.");
    }
}
