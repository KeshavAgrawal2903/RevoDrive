
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

interface MapProps {
  locations: Location[];
  selectedRoute: RouteOption | null;
  allRoutes: RouteOption[];
  chargingStations: ChargingStation[];
  onLocationUpdate?: (location: Location) => void;
  onRouteClick?: (route: RouteOption) => void;
  useCurrentLocation?: boolean;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBJ1SZvlfgcy2nTGBraa2MkS5amw_lOTM8';

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
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showCompareRoutes, setShowCompareRoutes] = useState<boolean>(false);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [activeNavigation, setActiveNavigation] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Load Google Maps API script if it's not already loaded
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = initMap;
      script.onerror = () => {
        setMapError('Failed to load Google Maps. Please check your connection and try again.');
      };
      
      document.head.appendChild(script);
    } else {
      initMap();
    }
    
    return () => {
      // Clean up markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  // Initialize map
  const initMap = () => {
    if (!mapContainerRef.current || !window.google) return;
    
    try {
      const newMap = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi, India
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#e0f2e0' }]
          }
        ]
      });
      
      setMap(newMap);
      
      // Initialize directions service and renderer
      const newDirectionsService = new google.maps.DirectionsService();
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2e7d32', // eco green
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
      
      setDirectionsService(newDirectionsService);
      setDirectionsRenderer(newDirectionsRenderer);
      
      // Get user's current location if needed
      if (useCurrentLocation) {
        getUserLocation();
      }
      
      toast({
        title: "Map Loaded",
        description: "Google Maps has been loaded successfully.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Could not initialize Google Maps. Please refresh and try again.');
    }
  };

  // Handle getting user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          
          setUserLocation(userLoc);
          
          if (map) {
            map.setCenter(userLoc);
            map.setZoom(13);
            
            // Add marker for user location
            const marker = new google.maps.Marker({
              position: userLoc,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#10b981',
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: '#ffffff'
              },
              title: 'Your Location'
            });
            
            setMarkers(prev => [...prev, marker]);
            
            if (onLocationUpdate) {
              onLocationUpdate({
                id: 'current',
                name: 'Current Location',
                lat: latitude,
                lng: longitude,
                type: 'current'
              });
            }
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
            variant: "destructive",
            duration: 3000,
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Unsupported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Update markers when locations or chargingStations change
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    
    // Add markers for locations
    locations.forEach(location => {
      let iconColor = '#10b981'; // Default green color
      
      if (location.type === 'end') iconColor = '#f43f5e';
      else if (location.type === 'waypoint') iconColor = '#8b5cf6';
      else if (location.type === 'charging') iconColor = '#3b82f6';
      
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: iconColor,
          fillOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        },
        title: location.name
      });
      
      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><h3>${location.name}</h3><p>${location.type}</p></div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });
    
    // Add markers for charging stations if they should be shown
    if (showStations) {
      chargingStations.forEach(station => {
        const iconColor = station.available ? '#10b981' : '#ef4444';
        
        const marker = new google.maps.Marker({
          position: { lat: station.lat, lng: station.lng },
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: iconColor,
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          },
          title: station.name
        });
        
        // Add info window for the station
        const infoContent = `
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${station.name}</h3>
            <p style="margin: 2px 0;"><strong>Available:</strong> ${station.available ? 'Yes' : 'No'}</p>
            <p style="margin: 2px 0;"><strong>Power:</strong> ${station.powerKw} kW</p>
            <p style="margin: 2px 0;"><strong>Pricing:</strong> ${station.pricing}</p>
            <p style="margin: 2px 0;"><strong>Renewable:</strong> ${station.renewable ? 'Yes' : 'No'}</p>
            ${station.amenities.length > 0 ? 
              `<p style="margin: 2px 0;"><strong>Amenities:</strong> ${station.amenities.join(', ')}</p>` 
              : ''
            }
          </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        newMarkers.push(marker);
      });
    }
    
    setMarkers(newMarkers);
    
    // Draw routes
    if (showCompareRoutes && allRoutes.length > 0) {
      // Draw all routes for comparison
      drawAllRoutes(allRoutes);
    } else if (selectedRoute && locations.length >= 2) {
      // Draw just the selected route
      drawRoute(selectedRoute);
    }
  }, [map, locations, chargingStations, selectedRoute, allRoutes, showCompareRoutes, showStations]);

  // Draw a single route
  const drawRoute = (route: RouteOption) => {
    if (!map || !directionsService || !directionsRenderer || locations.length < 2) return;
    
    // Find start and end locations
    const start = locations.find(loc => loc.type === 'start' || loc.type === 'current');
    const end = locations.find(loc => loc.type === 'end');
    
    if (!start || !end) return;
    
    // Generate waypoints based on route type to ensure a unique path visualization
    const waypoints = generateWaypointsForRouteType(start, end, route.id);
    
    directionsService.route({
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK && response) {
        // Set the route color based on route type
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: getRouteColor(route.id),
            strokeWeight: 6,
            strokeOpacity: 0.8
          }
        });
        
        directionsRenderer.setDirections(response);
        
        // Add route markers for additional information
        if (activeNavigation && response.routes[0]) {
          addRouteMarkers(response.routes[0], route);
        }
        
        // Create route legend for the selected route
        createSingleRouteLegend(route);
        
        // Fit bounds to the route
        if (response.routes[0] && response.routes[0].bounds) {
          map.fitBounds(response.routes[0].bounds);
        }
      } else {
        console.error('Directions request failed due to', status);
        toast({
          title: "Route Error",
          description: "Could not calculate route. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    });
  };

  // Draw multiple routes for comparison
  const drawAllRoutes = (routes: RouteOption[]) => {
    if (!map || !directionsService || locations.length < 2) return;
    
    // Find start and end locations
    const start = locations.find(loc => loc.type === 'start' || loc.type === 'current');
    const end = locations.find(loc => loc.type === 'end');
    
    if (!start || !end) return;
    
    // Clear existing directionsRenderer
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
    
    // Create array to store all rendered directions
    const renderers: google.maps.DirectionsRenderer[] = [];
    
    // Create a boundary for fitting all routes
    const bounds = new google.maps.LatLngBounds();
    
    // Create promises for all routes
    const routePromises = routes.map((route, index) => {
      return new Promise<void>((resolve, reject) => {
        const waypoints = generateWaypointsForRouteType(start!, end!, route.id);
        
        directionsService!.route({
          origin: { lat: start!.lat, lng: start!.lng },
          destination: { lat: end!.lat, lng: end!.lng },
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false
        }, (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            // Create a new directionsRenderer for each route
            const renderer = new google.maps.DirectionsRenderer({
              map: map,
              directions: response,
              routeIndex: 0,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: getRouteColor(route.id),
                strokeWeight: route.id === selectedRoute?.id ? 6 : 4,
                strokeOpacity: route.id === selectedRoute?.id ? 0.9 : 0.7,
                strokePattern: getRoutePattern(route.id, index)
              }
            });
            
            renderers.push(renderer);
            
            // Extend bounds
            if (response.routes[0] && response.routes[0].bounds) {
              bounds.union(response.routes[0].bounds);
            }
            
            resolve();
          } else {
            console.error('Directions request failed due to', status);
            reject(status);
          }
        });
      });
    });
    
    // Process all route promises
    Promise.all(routePromises).then(() => {
      // Fit bounds to include all routes
      map!.fitBounds(bounds);
      
      // Create comparison legend
      createComparisonLegend(routes);
      
    }).catch(error => {
      console.error('Error drawing routes:', error);
      toast({
        title: "Route Error",
        description: "Could not calculate all routes. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  // Helper function to generate different waypoints for each route type
  const generateWaypointsForRouteType = (start: Location, end: Location, routeType: string): google.maps.DirectionsWaypoint[] => {
    // Calculate distance to determine waypoint offset
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(start.lat, start.lng),
      new google.maps.LatLng(end.lat, end.lng)
    );
    
    const offset = distance * 0.00001; // Scale the offset based on distance
    
    // Generate different waypoints for different route types
    switch (routeType) {
      case 'eco-route':
        // Eco route takes a slight detour to the south
        return [
          {
            location: new google.maps.LatLng(
              (start.lat + end.lat) / 2 - offset * 0.8,
              (start.lng + end.lng) / 2 - offset * 0.5
            ),
            stopover: false
          }
        ];
        
      case 'fast-route':
        // Fast route is most direct - no waypoints
        return [];
        
      case 'balanced-route':
        // Balanced route takes a slight detour to the north
        return [
          {
            location: new google.maps.LatLng(
              (start.lat + end.lat) / 2 + offset * 0.8,
              (start.lng + end.lng) / 2 + offset * 0.5
            ),
            stopover: false
          }
        ];
        
      default:
        return [];
    }
  };

  // Get route color based on route type
  const getRouteColor = (routeType: string): string => {
    switch (routeType) {
      case 'eco-route':
        return '#2e7d32'; // green for eco route
      case 'fast-route':
        return '#ef4444'; // red for fast route
      case 'balanced-route':
        return '#8b5cf6'; // purple for balanced route
      default:
        return '#3b82f6'; // blue for any other route
    }
  };

  // Get route pattern based on route type and index
  const getRoutePattern = (routeType: string, index: number): google.maps.IconSequence[] | undefined => {
    if (routeType === 'fast-route') {
      return [
        {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            fillOpacity: 0,
            strokeWeight: 1,
            strokeColor: '#ef4444',
          },
          offset: '0%',
          repeat: '20px'
        }
      ];
    } else if (routeType === 'balanced-route') {
      return [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillOpacity: 0,
            strokeWeight: 2,
            strokeColor: '#8b5cf6',
          },
          offset: '50%',
          repeat: '100px'
        }
      ];
    }
    
    return undefined;
  };

  // Add route markers for additional information
  const addRouteMarkers = (route: google.maps.DirectionsRoute, routeOption: RouteOption) => {
    if (!map) return;
    
    if (route.legs.length > 0) {
      const leg = route.legs[0];
      
      // Add start marker with info
      const startMarker = document.createElement('div');
      startMarker.className = 'flex items-center bg-eco text-white px-2 py-1 rounded-md text-xs shadow-md';
      startMarker.textContent = 'Start';
      
      const startInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 5px;">
            <h3 style="font-weight: bold;">Start</h3>
            <p>${leg.start_address}</p>
          </div>
        `
      });
      
      const startMarkerObj = new google.maps.Marker({
        position: leg.start_location,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10b981',
          fillOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        },
        title: 'Start'
      });
      
      startMarkerObj.addListener('click', () => {
        startInfoWindow.open(map, startMarkerObj);
      });
      
      // Add end marker with info
      const endMarker = document.createElement('div');
      endMarker.className = 'flex items-center bg-energy-high text-white px-2 py-1 rounded-md text-xs shadow-md';
      endMarker.textContent = 'Destination';
      
      const endInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 5px;">
            <h3 style="font-weight: bold;">Destination</h3>
            <p>${leg.end_address}</p>
            <p>Distance: ${leg.distance?.text}</p>
            <p>Duration: ${leg.duration?.text}</p>
          </div>
        `
      });
      
      const endMarkerObj = new google.maps.Marker({
        position: leg.end_location,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#f43f5e',
          fillOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        },
        title: 'Destination'
      });
      
      endMarkerObj.addListener('click', () => {
        endInfoWindow.open(map, endMarkerObj);
      });
      
      setMarkers(prev => [...prev, startMarkerObj, endMarkerObj]);
      
      // Add route info in the middle
      if (leg.steps.length > 0) {
        const midIndex = Math.floor(leg.steps.length / 2);
        if (midIndex < leg.steps.length) {
          const midStep = leg.steps[midIndex];
          
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 5px; min-width: 150px;">
                <h3 style="font-weight: bold; color: ${getRouteColor(routeOption.id)};">${getRouteLabel(routeOption.id)}</h3>
                <p>Distance: ${routeOption.distance} km</p>
                <p>Duration: ${routeOption.duration} min</p>
                <p>Energy: ${routeOption.energyUsage.toFixed(1)} kWh</p>
                <p>Eco Score: ${routeOption.ecoScore}/100</p>
              </div>
            `,
            position: midStep.start_location
          });
          
          infoWindow.open(map);
          
          // Close info window after 5 seconds
          setTimeout(() => {
            infoWindow.close();
          }, 5000);
        }
      }
      
      // Add charging stops if needed
      if (routeOption.chargingStops > 0) {
        const stopsToPlace = Math.min(routeOption.chargingStops, 3);
        
        for (let i = 1; i <= stopsToPlace; i++) {
          const index = Math.floor((leg.steps.length / (stopsToPlace + 1)) * i);
          
          if (index < leg.steps.length) {
            const stopLocation = leg.steps[index].start_location;
            
            const chargingMarker = new google.maps.Marker({
              position: stopLocation,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3b82f6',
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: '#ffffff'
              },
              title: 'Charging Stop'
            });
            
            const chargingInfoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 5px;">
                  <h3 style="font-weight: bold;">Charging Stop</h3>
                  <p>Approximate location</p>
                </div>
              `
            });
            
            chargingMarker.addListener('click', () => {
              chargingInfoWindow.open(map, chargingMarker);
            });
            
            setMarkers(prev => [...prev, chargingMarker]);
          }
        }
      }
    }
  };

  // Get route label for display
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

  // Create legend for route comparison
  const createComparisonLegend = (routes: RouteOption[]) => {
    // Remove existing legend if any
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    // Create new legend
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
    
    // Add to map container
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };

  // Create legend for a single route
  const createSingleRouteLegend = (route: RouteOption) => {
    // Remove existing legend if any
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    // Create new legend
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
    
    // Add to map container
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };

  const resetMap = () => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(13);
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
    <div className="w-full h-[60vh] lg:h-[70vh] relative map-container bg-gradient-to-b from-background to-background/90 rounded-xl overflow-hidden">
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
      
      {!isLoading && (
        <div className="absolute bottom-4 left-4 max-w-xs">
          <Alert className="bg-background/80 backdrop-blur-sm">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Green Drive interactive map with real-time data.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Map controls */}
      {!isLoading && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={resetMap}>
            <RotateCcw className="h-4 w-4 mr-1" />
            <span className="text-xs">Reset View</span>
          </Button>
        </div>
      )}
      
      {/* Map options */}
      {!isLoading && (
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
      {!isLoading && (
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
              if (map && userLocation) {
                map.setCenter(userLocation);
                map.setZoom(14);
              } else {
                getUserLocation();
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
