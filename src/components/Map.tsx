import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  MapPin, 
  Navigation, 
  LocateFixed, 
  ListFilter, 
  RotateCcw, 
  Layers, 
  ChevronsUpDown,
  CheckCircle2,
  Route
} from 'lucide-react';
import { Location, RouteOption, ChargingStation } from '@/hooks/useMapData';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  locations: Location[];
  selectedRoute: RouteOption | null;
  allRoutes: RouteOption[];
  chargingStations: ChargingStation[];
  onLocationUpdate?: (location: Location) => void;
  onRouteClick?: (route: RouteOption) => void;
  useCurrentLocation?: boolean;
}

const Map: React.FC<MapProps> = ({ 
  locations, 
  selectedRoute, 
  allRoutes = [],
  chargingStations,
  onLocationUpdate,
  onRouteClick,
  useCurrentLocation = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [showMapKeyInput, setShowMapKeyInput] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showCompareRoutes, setShowCompareRoutes] = useState<boolean>(false);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [activeNavigation, setActiveNavigation] = useState<boolean>(false);
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
    if (map.current && !userLocation && useCurrentLocation) {
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
  }, [map.current, userLocation, onLocationUpdate, toast, useCurrentLocation]);

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
      
      // Add markers for charging stations if they should be shown
      if (showStations) {
        chargingStations.forEach(station => {
          const color = station.available ? '#10b981' : '#ef4444';
          
          const marker = new mapboxgl.Marker({ color })
            .setLngLat([station.lng, station.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div style="padding: 8px;">
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${station.name}</h3>
                  <p style="margin: 2px 0;"><strong>Available:</strong> ${station.available ? 'Yes' : 'No'}</p>
                  <p style="margin: 2px 0;"><strong>Power:</strong> ${station.powerKw} kW</p>
                  <p style="margin: 2px 0;"><strong>Pricing:</strong> ${station.pricing}</p>
                  <p style="margin: 2px 0;"><strong>Renewable:</strong> ${station.renewable ? 'Yes' : 'No'}</p>
                  ${station.amenities.length > 0 ? 
                    `<p style="margin: 2px 0;"><strong>Amenities:</strong> ${station.amenities.join(', ')}</p>` 
                    : ''
                  }
                </div>`
              )
            )
            .addTo(map.current!);
            
          markersRef.current.push(marker);
        });
      }
      
      // Draw routes
      if (showCompareRoutes && allRoutes.length > 0) {
        // Draw all routes for comparison
        drawAllRoutes(allRoutes);
      } else if (selectedRoute && locations.length >= 2) {
        // Draw just the selected route
        drawRoute(selectedRoute);
      }
    }
  }, [locations, chargingStations, selectedRoute, allRoutes, showCompareRoutes, showStations]);

  const getRouteColor = (routeType: string): string => {
    switch (routeType) {
      case 'eco-route':
        return '#10b981'; // green for eco route
      case 'fast-route':
        return '#ef4444'; // red for fast route
      case 'balanced-route':
        return '#8b5cf6'; // purple for balanced route
      default:
        return '#3b82f6'; // blue for any other route
    }
  };

  const getRouteLabel = (routeType: string): string => {
    switch (routeType) {
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

  const drawAllRoutes = async (routes: RouteOption[]) => {
    if (!map.current || locations.length < 2) return;
    
    try {
      // Remove existing route layers
      for (let i = 0; i < 5; i++) {
        if (map.current?.getLayer(`route-${i}`)) {
          map.current.removeLayer(`route-${i}`);
        }
        
        if (map.current?.getSource(`route-${i}`)) {
          map.current.removeSource(`route-${i}`);
        }
      }
      
      // Find start and end locations
      const start = locations.find(loc => loc.type === 'start' || loc.type === 'current');
      const end = locations.find(loc => loc.type === 'end');
      
      if (!start || !end) return;
      
      // Create different waypoints for each route type to ensure distinct paths
      const bounds = new mapboxgl.LngLatBounds();
      
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const color = getRouteColor(route.id);
        
        // Create slightly different waypoints for each route type to ensure they look different
        // This simulates what a real routing service would return for different route types
        const waypoints = generateWaypointsForRouteType(start, end, route.id);
        
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
        
        // Add route to map with offset for visualization
        const routeGeometry = offsetRouteGeometry(json.routes[0].geometry, i);
        
        map.current.addSource(`route-${i}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              routeId: route.id,
              routeName: getRouteLabel(route.id)
            },
            geometry: routeGeometry
          }
        });
        
        map.current.addLayer({
          id: `route-${i}`,
          type: 'line',
          source: `route-${i}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': route.id === selectedRoute?.id ? 6 : 4, // Make selected route thicker
            'line-opacity': route.id === selectedRoute?.id ? 0.9 : 0.7,
            'line-dasharray': i === 1 ? [2, 1] : i === 2 ? [1, 1] : [1, 0] // Different dash patterns
          }
        });
        
        // Add click event
        map.current.on('click', `route-${i}`, (e) => {
          if (e.features && e.features[0].properties && onRouteClick) {
            const clickedRouteId = e.features[0].properties.routeId;
            const clickedRoute = routes.find(r => r.id === clickedRouteId);
            if (clickedRoute) {
              onRouteClick(clickedRoute);
            }
          }
        });
        
        // Add hover effect
        map.current.on('mouseenter', `route-${i}`, () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', `route-${i}`, () => {
          map.current!.getCanvas().style.cursor = '';
        });
        
        // Extend bounds
        json.routes[0].geometry.coordinates.forEach(coord => {
          bounds.extend(coord as [number, number]);
        });
      }
      
      // Fit map to bounds of all routes
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
      
      // Add a legend
      addRouteLegend(routes);
      
    } catch (error) {
      console.error('Error drawing routes:', error);
      toast({
        title: "Route Error",
        description: "Could not calculate routes. Please try again.",
        duration: 3000,
      });
    }
  };

  // Helper function to generate different waypoints for each route type
  const generateWaypointsForRouteType = (start: Location, end: Location, routeType: string): Array<[number, number]> => {
    // Base waypoints are start and end
    const baseWaypoints: Array<[number, number]> = [
      [start.lng, start.lat],
      [end.lng, end.lat]
    ];
    
    // Add intermediate waypoints based on route type to make the routes visually different
    const midLng = (start.lng + end.lng) / 2;
    const midLat = (start.lat + end.lat) / 2;
    
    // Calculate distance to determine waypoint offset
    const distance = Math.sqrt(
      Math.pow(end.lng - start.lng, 2) + Math.pow(end.lat - start.lat, 2)
    );
    
    const offset = distance * 0.15; // 15% offset
    
    switch (routeType) {
      case 'eco-route':
        // Eco route takes a slight detour to the south
        return [
          [start.lng, start.lat],
          [midLng - offset * 0.5, midLat - offset],
          [end.lng, end.lat]
        ];
      case 'fast-route':
        // Fast route is most direct
        return baseWaypoints;
      case 'balanced-route':
        // Balanced route takes a slight detour to the north
        return [
          [start.lng, start.lat],
          [midLng + offset * 0.5, midLat + offset * 0.8],
          [end.lng, end.lat]
        ];
      default:
        return baseWaypoints;
    }
  };

  // Helper function to slightly offset routes for better visualization
  const offsetRouteGeometry = (geometry: any, routeIndex: number): any => {
    if (routeIndex === 0) return geometry; // No offset for first route
    
    // Small offset based on route index
    const offsetFactor = 0.0002 * routeIndex;
    
    const offsetCoordinates = geometry.coordinates.map((coord: [number, number]) => {
      return [coord[0] + offsetFactor, coord[1] + offsetFactor];
    });
    
    return {
      ...geometry,
      coordinates: offsetCoordinates
    };
  };

  // Add a legend for routes
  const addRouteLegend = (routes: RouteOption[]) => {
    // Remove existing legend if any
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    // Create new legend
    const legend = document.createElement('div');
    legend.id = 'route-legend';
    legend.className = 'absolute bottom-16 right-4 bg-white p-3 rounded-lg shadow-md z-10 border border-gray-200 animate-fade-in';
    
    const title = document.createElement('div');
    title.textContent = 'Route Comparison';
    title.className = 'font-semibold text-sm mb-2 flex items-center';
    
    // Add icon to title
    const titleIcon = document.createElement('span');
    titleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M3 17l2 2 4-4"></path><path d="M3 7l2 2 4-4"></path><path d="M13 17l6-6"></path><path d="M13 7l6-6"></path></svg>';
    title.prepend(titleIcon);
    
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
    
    // Add to map container
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };

  const drawRoute = async (route: RouteOption) => {
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
      
      // Generate waypoints based on route type to ensure a unique path visualization
      const waypoints = generateWaypointsForRouteType(start, end, route.id);
      
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
          properties: {
            routeId: route.id,
            routeName: getRouteLabel(route.id)
          },
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
          'line-color': getRouteColor(route.id),
          'line-width': 6,
          'line-opacity': 0.8
        }
      });
      
      // Add route markers for additional information like distance and time
      if (activeNavigation) {
        addRouteMarkers(json.routes[0], route);
      }
      
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

  const addRouteMarkers = (routeData: any, route: RouteOption) => {
    if (!map.current) return;
    
    // Add start and end markers with information
    const coords = routeData.geometry.coordinates;
    
    if (coords.length > 0) {
      // Start marker
      const startEl = document.createElement('div');
      startEl.className = 'route-marker-start';
      startEl.innerHTML = `<div class="flex items-center bg-eco text-white px-2 py-1 rounded-md text-xs shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        Start
      </div>`;
      
      new mapboxgl.Marker({ element: startEl })
        .setLngLat(coords[0])
        .addTo(map.current);
        
      // End marker
      const endEl = document.createElement('div');
      endEl.className = 'route-marker-end';
      endEl.innerHTML = `<div class="flex items-center bg-energy-high text-white px-2 py-1 rounded-md text-xs shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>
        Destination
      </div>`;
      
      new mapboxgl.Marker({ element: endEl })
        .setLngLat(coords[coords.length - 1])
        .addTo(map.current);
        
      // Add any charging stops if needed
      if (route.chargingStops > 0) {
        // Place charging markers at regular intervals
        const stopsToPlace = Math.min(route.chargingStops, 3); // Limit to 3 visual stops
        
        for (let i = 1; i <= stopsToPlace; i++) {
          const index = Math.floor((coords.length / (stopsToPlace + 1)) * i);
          
          if (index < coords.length) {
            const stopEl = document.createElement('div');
            stopEl.className = 'route-marker-charging';
            stopEl.innerHTML = `<div class="flex items-center bg-tech text-white px-2 py-1 rounded-md text-xs shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              Charging Stop
            </div>`;
            
            new mapboxgl.Marker({ element: stopEl })
              .setLngLat(coords[index])
              .addTo(map.current);
          }
        }
      }
      
      // Add route information at key points
      const midPoint = Math.floor(coords.length / 2);
      if (midPoint < coords.length) {
        const infoEl = document.createElement('div');
        infoEl.className = 'route-marker-info';
        infoEl.innerHTML = `<div class="flex items-center bg-white px-2 py-1 rounded-md text-xs shadow-md border border-${getRouteColor(route.id)} animate-float">
          <span class="font-medium" style="color: ${getRouteColor(route.id)};">${getRouteLabel(route.id)}</span>
          <span class="mx-1">•</span>
          <span>${route.distance} km</span>
          <span class="mx-1">•</span>
          <span>${route.duration} min</span>
        </div>`;
        
        new mapboxgl.Marker({ element: infoEl })
          .setLngLat(coords[midPoint])
          .addTo(map.current);
      }
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
      
      // Handle map click event to allow adding locations
      newMap.on('click', (e) => {
        console.log('Map clicked at:', e.lngLat);
        
        // We could implement location selection on click here
        // For now, just log the coordinates
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
    
    // Redraw the route to add navigation markers
    drawRoute(selectedRoute);
    
    toast({
      title: "Navigation Started",
      description: `Following ${getRouteLabel(selectedRoute.id)}. Estimated arrival in ${selectedRoute.duration} minutes.`,
      duration: 3000,
    });
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
      
      {/* Map controls */}
      {!showMapKeyInput && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={resetMap}>
            <RotateCcw className="h-4 w-4 mr-1" />
            <span className="text-xs">Reset View</span>
          </Button>
        </div>
      )}
      
      {/* Map options */}
      {!showMapKeyInput && (
        <div className="absolute top-4 left-4 p-2 bg-background/80 backdrop-blur-sm rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <Switch 
              id="compare-routes" 
              checked={showCompareRoutes} 
              onCheckedChange={handleCompareToggle} 
            />
            <Label htmlFor="compare-routes" className="text-xs flex items-center">
              <Layers className="h-3 w-3 mr-1" />
              Compare Routes
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-stations" 
              checked={showStations} 
              onCheckedChange={handleStationsToggle} 
            />
            <Label htmlFor="show-stations" className="text-xs flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Show Stations
            </Label>
          </div>
        </div>
      )}
      
      {/* Map action buttons */}
      {!showMapKeyInput && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`${activeNavigation ? 'bg-eco text-white' : 'bg-eco/80 text-white backdrop-blur-sm hover:bg-eco'}`}
            onClick={startNavigation}
            disabled={!selectedRoute}
          >
            <Navigation className="h-4 w-4 mr-1" />
            <span className="text-xs">{activeNavigation ? 'Navigating...' : 'Navigate'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => {
              if (map.current && userLocation) {
                map.current.flyTo({
                  center: userLocation,
                  zoom: 14,
                  essential: true
                });
              } else {
                toast({
                  title: "Location Not Found",
                  description: "Couldn't determine your current location",
                  variant: "destructive",
                  duration: 3000,
                });
              }
            }}
          >
            <LocateFixed className="h-4 w-4 mr-1" />
            <span className="text-xs">Current Location</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-purple-500/10 hover:bg-purple-500/20 text-purple-500`}
            onClick={() => {
              if (allRoutes.length > 0) {
                setShowCompareRoutes(true);
              } else {
                toast({
                  title: "No Routes Available",
                  description: "Find a route first to enable comparison",
                  variant: "destructive",
                  duration: 3000,
                });
              }
            }}
          >
            <Route className="h-4 w-4 mr-1" />
            <span className="text-xs">All Routes</span>
          </Button>
        </div>
      )}
      
      {/* Navigation status */}
      {activeNavigation && selectedRoute && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-md p-2 shadow-md border border-eco animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Navigation className="h-4 w-4 text-eco mr-1" />
              <span className="text-sm font-medium">{getRouteLabel(selectedRoute.id)}</span>
            </div>
            <div className="text-xs">
              <span className="font-medium">{selectedRoute.distance} km</span>
              <span className="mx-1">•</span>
              <span>{selectedRoute.duration} min</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 p-0 px-2"
              onClick={() => {
                setActiveNavigation(false);
                toast({
                  title: "Navigation Ended",
                  description: "Turn-by-turn navigation stopped",
                  duration: 2000,
                });
              }}
            >
              <span className="text-xs">End</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
