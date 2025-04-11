
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, MapPin, Navigation, LocateFixed, ListFilter, RotateCcw } from 'lucide-react';
import { Location, RouteOption, ChargingStation } from '@/hooks/useMapData';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  locations: Location[];
  selectedRoute: RouteOption | null;
  chargingStations: ChargingStation[];
  onLocationUpdate?: (location: Location) => void;
}

const Map: React.FC<MapProps> = ({ 
  locations, 
  selectedRoute, 
  chargingStations,
  onLocationUpdate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [showMapKeyInput, setShowMapKeyInput] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for map API key in local storage
    const savedApiKey = localStorage.getItem('mapApiKey');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
      setShowMapKeyInput(false);
      initializeMap(savedApiKey);
    }
  }, []);

  // Get user's current location when map is ready
  useEffect(() => {
    if (map.current && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            essential: true
          });
          
          // Add user location marker
          const userMarker = new mapboxgl.Marker({ color: '#10b981' })
            .setLngLat([longitude, latitude])
            .addTo(map.current);
            
          markersRef.current.push(userMarker);
          
          if (onLocationUpdate) {
            onLocationUpdate({
              id: 'current',
              name: 'Current Location',
              lat: latitude,
              lng: longitude,
              type: 'current'
            });
          }
          
          toast({
            title: "Location Found",
            description: "Your current location has been detected.",
            duration: 3000,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Couldn't get your location. Using Delhi as default.",
            duration: 3000,
          });
          
          // Default to Delhi, India
          setUserLocation([77.2090, 28.6139]);
          map.current?.flyTo({
            center: [77.2090, 28.6139],
            zoom: 10,
            essential: true
          });
        }
      );
    }
  }, [map.current, userLocation, onLocationUpdate, toast]);

  // Update markers when locations or chargingStations change
  useEffect(() => {
    if (map.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Add markers for locations
      locations.forEach(location => {
        let color = '#10b981'; // Default green color
        
        if (location.type === 'end') color = '#f43f5e';
        else if (location.type === 'waypoint') color = '#8b5cf6';
        else if (location.type === 'charging') color = '#3b82f6';
        
        const marker = new mapboxgl.Marker({ color })
          .setLngLat([location.lng, location.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.name}</h3><p>${location.type}</p>`))
          .addTo(map.current!);
          
        markersRef.current.push(marker);
      });
      
      // Add markers for charging stations
      chargingStations.forEach(station => {
        const color = station.available ? '#10b981' : '#ef4444';
        
        const marker = new mapboxgl.Marker({ color })
          .setLngLat([station.lng, station.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<h3>${station.name}</h3>
               <p>Available: ${station.available ? 'Yes' : 'No'}</p>
               <p>Power: ${station.powerKw} kW</p>
               <p>Pricing: ${station.pricing}</p>`
            )
          )
          .addTo(map.current!);
          
        markersRef.current.push(marker);
      });
      
      // Draw route if selectedRoute exists
      if (selectedRoute && locations.length >= 2) {
        drawRoute();
      }
    }
  }, [locations, chargingStations, selectedRoute]);

  const drawRoute = async () => {
    if (!map.current || locations.length < 2) return;
    
    try {
      // Find start and end locations
      const start = locations.find(loc => loc.type === 'start' || loc.type === 'current');
      const end = locations.find(loc => loc.type === 'end');
      
      if (!start || !end) return;
      
      // If map already has the route layer, remove it
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
      
      // Create waypoints array including start, end, and any waypoints
      const waypoints = [
        [start.lng, start.lat],
        ...locations
          .filter(loc => loc.type === 'waypoint')
          .map(loc => [loc.lng, loc.lat] as [number, number]),
        [end.lng, end.lat]
      ];
      
      // Use Mapbox Directions API to get route
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints.map(wp => wp.join(',')).join(';')}?geometries=geojson&access_token=${mapApiKey}`
      );
      
      if (!query.ok) {
        throw new Error('Network response was not ok');
      }
      
      const json = await query.json();
      
      if (json.code !== 'Ok') {
        throw new Error(json.message || 'Could not calculate route');
      }
      
      // Add route to map
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: json.routes[0].geometry
        }
      });
      
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
      
      // Fit map to bounds of the route
      const bounds = new mapboxgl.LngLatBounds();
      json.routes[0].geometry.coordinates.forEach(coord => {
        bounds.extend(coord as [number, number]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
      
    } catch (error) {
      console.error('Error drawing route:', error);
      toast({
        title: "Route Error",
        description: "Could not calculate route. Please try again.",
        duration: 3000,
      });
    }
  };

  const initializeMap = (apiKey: string) => {
    try {
      if (!mapContainerRef.current) return;
      
      mapboxgl.accessToken = apiKey;
      
      const newMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [77.2090, 28.6139], // Default center on Delhi, India
        zoom: 6,
        projection: 'mercator'
      });
      
      // Add navigation control (zoom buttons)
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add geolocate control
      newMap.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );
      
      // Add scale control
      newMap.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
      
      // Set reference to map instance
      map.current = newMap;
      
      // Handle map load event
      newMap.on('load', () => {
        toast({
          title: "Map Loaded",
          description: "Mapbox map has been loaded successfully.",
          duration: 3000,
        });
      });
      
      // Handle map click event
      newMap.on('click', (e) => {
        console.log('Map clicked at:', e.lngLat);
      });
      
      // Handle map errors
      newMap.on('error', (e) => {
        console.error('Map error:', e.error);
        setMapError('An error occurred with the map. Please refresh the page.');
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Could not initialize map. Please check your API key.');
    }
  };

  const handleMapKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (mapApiKey) {
      try {
        // Attempt to initialize map with provided key
        initializeMap(mapApiKey);
        
        // Save key to localStorage
        localStorage.setItem('mapApiKey', mapApiKey);
        setShowMapKeyInput(false);
        
        toast({
          title: "API Key Saved",
          description: "Your Mapbox API key has been saved successfully.",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error validating API key:', error);
        toast({
          title: "Invalid API Key",
          description: "Please check your Mapbox API key and try again.",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetMap = () => {
    if (map.current) {
      map.current.flyTo({
        center: userLocation || [77.2090, 28.6139],
        zoom: 10,
        essential: true
      });
    }
  };

  return (
    <div className="w-full h-[60vh] lg:h-[70vh] relative map-container">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <Alert className="max-w-md">
            <Info className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden">
        {/* Map will be rendered here */}
      </div>
      
      {showMapKeyInput && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Enter Mapbox API Key</h3>
            <form onSubmit={handleMapKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  Mapbox API Key
                </label>
                <Input
                  id="apiKey"
                  type="text"
                  value={mapApiKey}
                  onChange={(e) => setMapApiKey(e.target.value)}
                  placeholder="Enter your Mapbox API key"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  You can get a Mapbox API key from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-eco hover:underline">mapbox.com</a>
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-eco hover:bg-eco-dark"
                disabled={isLoading}
              >
                {isLoading ? 'Validating...' : 'Set API Key'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This key will be stored locally on your device.
              </p>
            </form>
          </Card>
        </div>
      )}
      
      {!showMapKeyInput && (
        <div className="absolute bottom-4 left-4 max-w-xs">
          <Alert className="bg-background/80 backdrop-blur-sm">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Interactive map for Indian regions with real-time data from Mapbox.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {!showMapKeyInput && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={resetMap}>
            <RotateCcw className="h-4 w-4 mr-1" />
            <span className="text-xs">Reset View</span>
          </Button>
        </div>
      )}
      
      {!showMapKeyInput && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
            <Navigation className="h-4 w-4 mr-1" />
            <span className="text-xs">Navigate</span>
          </Button>
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
            <LocateFixed className="h-4 w-4 mr-1" />
            <span className="text-xs">Current Location</span>
          </Button>
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
            <ListFilter className="h-4 w-4 mr-1" />
            <span className="text-xs">Filter Stations</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Map;
