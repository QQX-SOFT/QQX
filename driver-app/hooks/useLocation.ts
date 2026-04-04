import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useLocation() {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTimeEntryId, setActiveTimeEntryId] = useState<string | null>(null);

  // Check if driver has an active shift
  useEffect(() => {
    if (!user?.id) return;
    const fetchActiveShift = async () => {
      try {
        const { data } = await api.get(`/time/active/${user.id}`);
        if (data && data.id) {
          setActiveTimeEntryId(data.id);
        } else {
          setActiveTimeEntryId(null);
        }
      } catch (e) {
        console.log('Error fetching active time entry', e);
      }
    };
    
    fetchActiveShift();
    
    // Periodically check if shift status changed (every 30s)
    const interval = setInterval(fetchActiveShift, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;
    
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Standortzugriff verweigert!');
        return;
      }

      // Initial quick location
      try {
        let current = await Location.getCurrentPositionAsync({});
        setLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
      } catch(e) {}

      // Start watching live position
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,   // Check every 10 sec
          distanceInterval: 15,  // Or every 15 meters
        },
        async (loc) => {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          
          setLocation({ lat, lng });

          // If driver is basically punched-in, sync to backend
          if (activeTimeEntryId) {
            try {
              await api.patch(`/time/location/${activeTimeEntryId}`, { lat, lng });
              console.log('Location synced to backend: ', lat, lng);
            } catch (error) {
              console.log('Failed to sync location to backend');
            }
          }
        }
      );
    })();

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, [activeTimeEntryId]); // Re-run watcher if shift changes so the closure has the latest activeTimeEntryId

  return { location, errorMsg, activeTimeEntryId };
}
