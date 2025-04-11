
import { useState, useCallback } from 'react';
import { Location } from './useMapData';

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

export const useLocationSearch = () => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);

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
      const mapApiKey = localStorage.getItem('mapApiKey');
      if (!mapApiKey) {
        throw new Error('Mapbox API key not found');
      }

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
    searchResults,
    isSearching,
    clearResults: () => setSearchResults([])
  };
};

export default useLocationSearch;
