
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Location, RouteOption, ChargingStation } from '@/hooks/useMapData';

interface MapProps {
  locations: Location[];
  selectedRoute: RouteOption | null;
  allRoutes: RouteOption[];
  chargingStations: ChargingStation[];
  onLocationUpdate: (location: Location) => void;
  onRouteClick: (route: RouteOption) => void;
  useCurrentLocation: boolean;
}

type MapElement = google.maps.Marker | google.maps.Polyline;

const Map: React.FC<MapProps> = ({
  locations,
  selectedRoute,
  allRoutes,
  chargingStations,
  onLocationUpdate,
  onRouteClick,
  useCurrentLocation
}) => {
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [mapElements, setMapElements] = useState<MapElement[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showCompareRoutes, setShowCompareRoutes] = useState(false);
  const [showStations, setShowStations] = useState(true);
  const [activeNavigation, setActiveNavigation] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('googleMapsApiKey') || '';
  });

  // Get the user's current location
  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = new google.maps.LatLng(latitude, longitude);
          setUserLocation(newLocation);
          
          // Update the starting location in the parent component
          onLocationUpdate({
            id: 'current-location',
            name: 'Current Location',
            lat: latitude,
            lng: longitude,
            type: 'current'
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please check your browser permissions.",
            variant: "destructive",
            duration: 3000,
          });
        }
      );
    }
  }, [useCurrentLocation, onLocationUpdate, toast]);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current || !apiKey) return;

    const initMap = async () => {
      try {
        // Load Google Maps API script
        if (!window.google?.maps) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Create the map
        const mapOptions: google.maps.MapOptions = {
          center: { lat: 28.6139, lng: 77.2090 }, // New Delhi, India as default
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "on" }],
            },
          ],
        };

        map.current = new google.maps.Map(mapContainerRef.current, mapOptions);
        setMapLoaded(true);
        
        // Save API key to localStorage
        localStorage.setItem('googleMapsApiKey', apiKey);

        // Initialize map elements
        updateMapMarkers();
      } catch (error) {
        console.error("Error initializing map:", error);
        toast({
          title: "Map Error",
          description: "Failed to initialize the map. Please check your API key.",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    initMap();

    return () => {
      // Clean up map elements
      mapElements.forEach(element => element.setMap(null));
    };
  }, [apiKey]);

  // Update map markers when locations change
  useEffect(() => {
    if (mapLoaded && map.current) {
      updateMapMarkers();
    }
  }, [locations, mapLoaded]);

  // Update routes when selected or all routes change
  useEffect(() => {
    if (mapLoaded && map.current) {
      if (showCompareRoutes) {
        drawAllRoutes();
      } else if (selectedRoute) {
        drawRoute(selectedRoute);
      }
    }
  }, [selectedRoute, allRoutes, showCompareRoutes, mapLoaded]);

  // Update charging stations when they change
  useEffect(() => {
    if (mapLoaded && map.current && showStations) {
      drawChargingStations();
    } else if (mapLoaded && !showStations) {
      // Remove charging station markers
      setMapElements(prev => prev.filter(element => 
        !(element instanceof google.maps.Marker && 
          element.getTitle()?.includes('Charging Station'))
      ));
    }
  }, [chargingStations, showStations, mapLoaded]);

  // Function to update map markers for locations
  const updateMapMarkers = useCallback(() => {
    if (!map.current) return;
    
    // Clear existing location markers
    setMapElements(prev => prev.filter(element => 
      !(element instanceof google.maps.Marker && 
        element.getTitle() && 
        !element.getTitle().includes('Charging Station'))
    ));
    
    // Add markers for each location
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();
    
    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map.current,
        title: location.name,
        icon: getMarkerIcon(location.type),
        animation: google.maps.Animation.DROP,
      });
      
      marker.addListener('click', () => {
        if (map.current) {
          map.current.panTo(marker.getPosition()!);
          map.current.setZoom(14);
        }
      });
      
      newMarkers.push(marker);
      bounds.extend(marker.getPosition()!);
    });
    
    // Update map elements with new markers
    setMapElements(prev => [...prev.filter(element => 
      !(element instanceof google.maps.Marker && 
        element.getTitle() && 
        !element.getTitle().includes('Charging Station'))
    ), ...newMarkers]);
    
    // Fit bounds if there are locations
    if (locations.length > 1 && map.current) {
      map.current.fitBounds(bounds);
    } else if (locations.length === 1 && map.current) {
      map.current.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
      map.current.setZoom(13);
    }
  }, [locations]);

  // Function to draw all routes for comparison
  const drawAllRoutes = useCallback(() => {
    if (!map.current || !allRoutes.length) return;
    
    // Clear existing route polylines
    setMapElements(prev => prev.filter(element => 
      !(element instanceof google.maps.Polyline)
    ));
    
    const newPolylines: google.maps.Polyline[] = [];
    const bounds = new google.maps.LatLngBounds();
    
    // Draw each route with a different color
    allRoutes.forEach(route => {
      // Create a simulated path for demo purposes
      // In a real app, you would use actual route coordinates from an API
      if (locations.length >= 2) {
        const start = locations.find(loc => loc.type === 'start') || locations[0];
        const end = locations.find(loc => loc.type === 'end') || locations[locations.length - 1];
        
        // Create a simple path between start and end with some randomness
        const path = createSimulatedPath(
          { lat: start.lat, lng: start.lng },
          { lat: end.lat, lng: end.lng },
          route.id // Use route ID to generate consistent randomness
        );
        
        const polyline = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: getRouteColor(route.id),
          strokeOpacity: 1.0,
          strokeWeight: route.id === selectedRoute?.id ? 5 : 3,
          map: map.current,
        });
        
        // Make polyline clickable
        polyline.addListener('click', () => {
          if (onRouteClick) onRouteClick(route);
        });
        
        newPolylines.push(polyline);
        
        // Extend bounds to include this route
        path.forEach(point => bounds.extend(point));
      }
    });
    
    // Update map elements with new polylines
    setMapElements(prev => [...prev.filter(element => 
      !(element instanceof google.maps.Polyline)
    ), ...newPolylines]);
    
    // Create comparison legend
    if (allRoutes.length > 0) {
      createComparisonLegend(allRoutes);
    }
    
    // Fit bounds to show all routes
    if (map.current && newPolylines.length > 0) {
      map.current.fitBounds(bounds);
    }
  }, [allRoutes, locations, selectedRoute, onRouteClick]);

  // Function to draw a single route
  const drawRoute = useCallback((route: RouteOption) => {
    if (!map.current) return;
    
    // Clear existing route polylines
    setMapElements(prev => prev.filter(element => 
      !(element instanceof google.maps.Polyline)
    ));
    
    // Create a simulated path for demo purposes
    if (locations.length >= 2) {
      const start = locations.find(loc => loc.type === 'start') || locations[0];
      const end = locations.find(loc => loc.type === 'end') || locations[locations.length - 1];
      
      const path = createSimulatedPath(
        { lat: start.lat, lng: start.lng },
        { lat: end.lat, lng: end.lng },
        route.id
      );
      
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: getRouteColor(route.id),
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: map.current,
      });
      
      // Update map elements with new polyline
      setMapElements(prev => [...prev.filter(element => 
        !(element instanceof google.maps.Polyline)
      ), polyline]);
      
      // Create single route legend
      createSingleRouteLegend(route);
      
      // Fit bounds to show route
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      map.current.fitBounds(bounds);
    }
  }, [locations]);

  // Function to draw charging stations on the map
  const drawChargingStations = useCallback(() => {
    if (!map.current || !chargingStations.length) return;
    
    // Clear existing charging station markers
    setMapElements(prev => prev.filter(element => 
      !(element instanceof google.maps.Marker && 
        element.getTitle()?.includes('Charging Station'))
    ));
    
    // Add markers for each charging station
    const newMarkers: google.maps.Marker[] = [];
    
    chargingStations.forEach(station => {
      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: map.current,
        title: `Charging Station: ${station.name}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
      });
      
      // Create info window with station details
      const infoContent = `
        <div class="p-2">
          <h3 class="font-bold">${station.name}</h3>
          <p>Status: ${station.available ? 'Available' : 'Busy'}</p>
          <p>Power: ${station.powerKw} kW</p>
          <p>Plug Types: ${station.plugTypes.join(', ')}</p>
          ${station.pricing ? `<p>Pricing: ${station.pricing}</p>` : ''}
          ${station.amenities.length ? `<p>Amenities: ${station.amenities.join(', ')}</p>` : ''}
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });
      
      newMarkers.push(marker);
    });
    
    // Update map elements with new markers
    setMapElements(prev => [...prev.filter(element => 
      !(element instanceof google.maps.Marker && 
        element.getTitle()?.includes('Charging Station'))
    ), ...newMarkers]);
  }, [chargingStations]);

  // Helper function to get marker icon based on location type
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'start':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'end':
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'waypoint':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'charging':
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'current':
        return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  // Helper function to get route color based on route ID
  const getRouteColor = (routeId: string) => {
    switch (routeId) {
      case 'eco-route':
        return '#4CAF50'; // Green for eco route
      case 'fast-route':
        return '#F44336'; // Red for fast route
      case 'balanced-route':
        return '#2196F3'; // Blue for balanced route
      default:
        return '#9C27B0'; // Purple for any other route
    }
  };

  // Helper function to get route label based on route ID
  const getRouteLabel = (routeId: string) => {
    switch (routeId) {
      case 'eco-route':
        return 'Eco Route';
      case 'fast-route':
        return 'Fast Route';
      case 'balanced-route':
        return 'Balanced Route';
      default:
        return 'Custom Route';
    }
  };

  // Helper function to create a simulated path between two points
  const createSimulatedPath = (
    start: { lat: number, lng: number },
    end: { lat: number, lng: number },
    seed: string
  ) => {
    // Use the seed to generate consistent randomness
    const seedVal = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seedVal * 9999) * 10000;
      const r = x - Math.floor(x);
      return min + r * (max - min);
    };
    
    // Create a path with some intermediate points
    const path: google.maps.LatLngLiteral[] = [start];
    
    // Add some intermediate points
    const numPoints = Math.floor(random(3, 8));
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;
    
    for (let i = 1; i <= numPoints; i++) {
      const fraction = i / (numPoints + 1);
      const lat = start.lat + latDiff * fraction + random(-0.01, 0.01);
      const lng = start.lng + lngDiff * fraction + random(-0.01, 0.01);
      path.push({ lat, lng });
    }
    
    path.push(end);
    return path;
  };

  // Functions to handle user interactions
  const handleCompareToggle = () => {
    setShowCompareRoutes(!showCompareRoutes);
    toast({
      title: showCompareRoutes ? "Single Route View" : "Compare Routes View",
      description: showCompareRoutes ? "Showing only selected route" : "Showing all available routes",
      duration: 2000,
    });
  };

  const handleStationsToggle = () => {
    setShowStations(!showStations);
    toast({
      title: showStations ? "Stations Hidden" : "Stations Visible",
      description: showStations ? "Hiding charging stations" : "Showing charging stations",
      duration: 2000,
    });
  };

  const resetMap = () => {
    if (map.current && userLocation) {
      map.current.setCenter(userLocation);
      map.current.setZoom(13);
    }
  };

  const startNavigation = () => {
    if (!selectedRoute) {
      toast({
        title: "No Route Selected",
        description: "Please select a route first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setActiveNavigation(true);
    setShowCompareRoutes(false);
    
    drawRoute(selectedRoute);
    
    toast({
      title: "Navigation Started",
      description: `Following ${getRouteLabel(selectedRoute.id)}. Estimated arrival in ${selectedRoute.duration} minutes.`,
      duration: 3000,
    });
  };

  const createComparisonLegend = (routes: RouteOption[]) => {
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    const legend = document.createElement('div');
    legend.id = 'route-legend';
    legend.className = 'absolute bottom-16 right-4 bg-white p-3 rounded-lg shadow-md z-10 border border-gray-200 animate-fade-in';
    legend.style.cssText = 'min-width: 200px; max-width: 300px;';
    
    const title = document.createElement('div');
    title.textContent = 'Route Comparison';
    title.className = 'font-semibold text-sm mb-2 flex items-center';
    
    legend.appendChild(title);
    
    routes.forEach(route => {
      const item = document.createElement('div');
      item.className = 'flex items-center text-xs mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer';
      item.onclick = () => {
        if (onRouteClick) onRouteClick(route);
      };
      
      const color = document.createElement('div');
      color.className = 'w-4 h-2 rounded-full mr-2';
      color.style.backgroundColor = getRouteColor(route.id);
      
      const label = document.createElement('span');
      label.textContent = getRouteLabel(route.id);
      
      const info = document.createElement('div');
      info.className = 'text-gray-500 ml-auto text-xs flex items-center';
      
      const distance = document.createElement('span');
      distance.textContent = `${route.distance} km`;
      distance.className = 'mr-2';
      
      const time = document.createElement('span');
      time.textContent = `${route.duration} min`;
      
      info.appendChild(distance);
      info.appendChild(time);
      
      item.appendChild(color);
      item.appendChild(label);
      item.appendChild(info);
      legend.appendChild(item);
    });
    
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };

  const createSingleRouteLegend = (route: RouteOption) => {
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    const legend = document.createElement('div');
    legend.id = 'route-legend';
    legend.className = 'absolute bottom-16 right-4 bg-white p-3 rounded-lg shadow-md z-10 border border-gray-200 animate-fade-in';
    legend.style.cssText = 'min-width: 200px;';
    
    const title = document.createElement('div');
    title.textContent = getRouteLabel(route.id);
    title.className = 'font-semibold text-sm mb-2 flex items-center';
    title.style.color = getRouteColor(route.id);
    
    legend.appendChild(title);
    
    const details = document.createElement('div');
    details.className = 'text-xs space-y-1';
    
    const items = [
      { label: 'Distance', value: `${route.distance} km` },
      { label: 'Duration', value: `${route.duration} min` },
      { label: 'Energy Usage', value: `${route.energyUsage.toFixed(1)} kWh` },
      { label: 'Eco Score', value: `${route.ecoScore}/100` },
      { label: 'CO2 Saved', value: `${route.co2Saved.toFixed(1)} kg` },
      { label: 'Charging Stops', value: route.chargingStops.toString() }
    ];
    
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'flex justify-between';
      
      const label = document.createElement('span');
      label.textContent = item.label;
      label.className = 'text-gray-500';
      
      const value = document.createElement('span');
      value.textContent = item.value;
      value.className = 'font-medium';
      
      row.appendChild(label);
      row.appendChild(value);
      details.appendChild(row);
    });
    
    legend.appendChild(details);
    
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      {!apiKey && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-100 p-2 text-sm">
          <div className="flex flex-col space-y-2">
            <label htmlFor="apiKey" className="font-medium">Enter Google Maps API Key:</label>
            <div className="flex">
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="flex-1 px-2 py-1 border rounded-l"
              />
              <button 
                onClick={() => {
                  localStorage.setItem('googleMapsApiKey', apiKey);
                  window.location.reload();
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded-r"
              >
                Save
              </button>
            </div>
            <a 
              href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              Get an API key
            </a>
          </div>
        </div>
      )}
      
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div className="absolute bottom-4 left-4 space-y-2">
        <button 
          onClick={handleCompareToggle}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            showCompareRoutes ? 'bg-tech text-white' : 'bg-white text-tech border border-tech'
          }`}
        >
          {showCompareRoutes ? 'Single Route' : 'Compare Routes'}
        </button>
        
        <button 
          onClick={handleStationsToggle}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors block ${
            showStations ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-600'
          }`}
        >
          {showStations ? 'Hide Stations' : 'Show Stations'}
        </button>
        
        <button 
          onClick={resetMap}
          className="px-3 py-1.5 text-sm rounded-full bg-white border border-gray-300 block"
        >
          Reset View
        </button>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <button 
          onClick={startNavigation}
          disabled={!selectedRoute}
          className={`px-4 py-2 rounded-full font-medium ${
            selectedRoute 
              ? 'bg-eco hover:bg-eco/90 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {activeNavigation ? 'Navigating...' : 'Start Navigation'}
        </button>
      </div>
    </div>
  );
};

export default Map;
