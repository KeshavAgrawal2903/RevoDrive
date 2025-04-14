
import { useState, useCallback } from 'react';
import { Location } from './useMapData';
import { useToast } from '@/hooks/use-toast';

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

// Use environment variable for the Mapbox API key
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1Ijoia2VzaGF2LXNybSIsImEiOiJjbTljYjFtOWEwZ2VmMm9xdzBoZGZqazZwIn0.l16befAq12p5KdoD2DbTcw';

export const useLocationSearch = () => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const { toast } = useToast();

  const getCurrentLocation = useCallback((): Promise<Location | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation Error",
          description: "Geolocation is not supported by your browser. Using default location.",
          duration: 5000,
        });
        console.log("Geolocation not supported - using default location");
        resolve(null);
        return;
      }

      const successHandler = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        console.log(`Current location found: ${latitude}, ${longitude}`);
        
        // Reverse geocode to get location name
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_API_KEY}`
        )
          .then(response => response.json())
          .then(data => {
            const placeName = data.features && data.features[0] ? data.features[0].place_name : 'Current Location';
            const location: Location = {
              id: 'current-location',
              name: placeName,
              lat: latitude,
              lng: longitude,
              type: 'current'
            };
            
            toast({
              title: "Location Found",
              description: `Found your location: ${placeName}`,
              duration: 3000,
            });
            
            resolve(location);
          })
          .catch(error => {
            console.error("Reverse geocoding error:", error);
            const location: Location = {
              id: 'current-location',
              name: 'Current Location',
              lat: latitude,
              lng: longitude,
              type: 'current'
            };
            resolve(location);
          });
      };

      const errorHandler = (error: GeolocationPositionError) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Could not get your location. Using default location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Using default location.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Using default location.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
        
        resolve(null);
      };

      // Enhance options for better local detection
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      console.log("Requesting user location...");
      navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
    });
  }, [toast]);

  const searchLocations = useCallback(async (
    query: string, 
    type: 'start' | 'end' | 'waypoint' | 'charging' | 'current' = 'waypoint',
    limitToIndia: boolean = true
  ) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    
    try {
      // Use the environment variable for the API key
      const mapApiKey = MAPBOX_API_KEY;
      
      // Add India country filter for more relevant results
      const countryFilter = limitToIndia ? '&country=in' : '';
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapApiKey}&limit=5${countryFilter}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      const locations: Location[] = data.features.map((feature: GeocodingFeature) => ({
        id: feature.id,
        name: feature.place_name,
        lng: feature.center[0],
        lat: feature.center[1],
        type
      }));

      setSearchResults(locations);
      return locations;
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchLocations,
    getCurrentLocation,
    searchResults,
    isSearching,
    clearResults: () => setSearchResults([])
  };
};

export default useLocationSearch;
