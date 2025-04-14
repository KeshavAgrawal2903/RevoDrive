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

// Declare type for Google Maps API objects
declare global {
  interface Window {
    google: typeof google;
  }
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

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
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
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  const initMap = () => {
    if (!mapContainerRef.current || !window.google) return;
    
    try {
      const newMap = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 28.6139, lng: 77.2090 },
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
      
      const newDirectionsService = new google.maps.DirectionsService();
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2e7d32',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
      
      setDirectionsService(newDirectionsService);
      setDirectionsRenderer(newDirectionsRenderer);
      
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

  useEffect(() => {
    if (!map) return;
    
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    
    locations.forEach(location => {
      let iconColor = '#10b981';
      
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
      
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><h3>${location.name}</h3><p>${location.type}</p></div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });
    
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
    
    if (showCompareRoutes && allRoutes.length > 0) {
      drawAllRoutes(allRoutes);
    } else if (selectedRoute && locations.length >= 2) {
      drawRoute(selectedRoute);
    }
  }, [map, locations, chargingStations, selectedRoute, allRoutes, showCompareRoutes, showStations]);

  const drawRoute = (route: RouteOption) => {
    if (!map || !directionsService || !directionsRenderer || locations.length < 2) return;
    
    const start = locations.find(loc => loc.type === 'start' || loc.type === 'current');
    const end = locations.find(loc => loc.type === 'end');
    
    if (!start || !end) return;
    
    const waypoints = generateWaypointsForRouteType(start, end, route.id);
    
    directionsService.route({
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK && response) {
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: getRouteColor(route.id),
            strokeWeight: 6,
            strokeOpacity: 0.8
          }
        });
        
        directionsRenderer.setDirections(response);
        
        if (activeNavigation && response.routes[0]) {
          addRouteMarkers(response.routes[0], route);
        }
        
        createSingleRouteLegend(route);
        
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

  const drawAllRoutes = (routes: RouteOption[]) => {
    if (!map || !directionsService || locations.length < 2) return;
    
    const start = locations.find(loc => loc.type === 'start' || loc.type === 'current');
    const end = locations.find(loc => loc.type === 'end');
    
    if (!start || !end) return;
    
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
    
    const renderers: google.maps.DirectionsRenderer[] = [];
    
    const bounds = new google.maps.LatLngBounds();
    
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
            const renderer = new google.maps.DirectionsRenderer({
              map: map,
              directions: response,
              routeIndex: 0,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: getRouteColor(route.id),
                strokeWeight: route.id === selectedRoute?.id ? 6 : 4,
                strokeOpacity: route.id === selectedRoute?.id ? 0.9 : 0.7
              }
            });
            
            const routePattern = getRoutePattern(route.id, index);
            if (routePattern && response.routes[0] && response.routes[0].overview_path) {
              const pathCoordinates = response.routes[0].overview_path;
              
              const polylineWithSymbols = new google.maps.Polyline({
                path: pathCoordinates,
                icons: routePattern,
                map: map,
                strokeColor: getRouteColor(route.id),
                strokeWeight: 0,
                strokeOpacity: 0
              });
              
              setMarkers(prev => [...prev, polylineWithSymbols]);
            }
            
            renderers.push(renderer);
            
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
  };

  Promise.all(routePromises).then(() => {
    map!.fitBounds(bounds);
    
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

  const generateWaypointsForRouteType = (start: Location, end: Location, routeType: string): google.maps.DirectionsWaypoint[] => {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(start.lat, start.lng),
      new google.maps.LatLng(end.lat, end.lng)
    );
    
    const offset = distance * 0.00001;
    
    switch (routeType) {
      case 'eco-route':
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
        return [];
        
      case 'balanced-route':
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

  const getRouteColor = (routeType: string): string => {
    switch (routeType) {
      case 'eco-route':
        return '#2e7d32';
      case 'fast-route':
        return '#ef4444';
      case 'balanced-route':
        return '#8b5cf6';
      default:
        return '#3b82f6';
    }
  };

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

  const addRouteMarkers = (route: google.maps.DirectionsRoute, routeOption: RouteOption) => {
    if (!map) return;
    
    if (route.legs.length > 0) {
      const leg = route.legs[0];
      
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
          
          setTimeout(() => {
            infoWindow.close();
          }, 5000);
        }
      }
      
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
          <Alert className="bg-background/80 backdrop-blur-sm shadow-md">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Map Controls</span>
                </div>
                <Button variant="ghost" size="icon" onClick={resetMap} title="Reset Map View">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 py-1">
                <Switch 
                  id="compare-routes"
                  checked={showCompareRoutes}
                  onCheckedChange={handleCompareToggle}
                />
                <Label htmlFor="compare-routes" className="text-xs">Compare Routes</Label>
              </div>
              
              <div className="flex items-center space-x-2 py-1">
                <Switch 
                  id="show-stations"
                  checked={showStations}
                  onCheckedChange={handleStationsToggle}
                />
                <Label htmlFor="show-stations" className="text-xs">Show Charging Stations</Label>
              </div>
              
              {selectedRoute && (
                <Button 
                  variant={activeNavigation ? "default" : "outline"} 
                  size="sm" 
                  className="w-full mt-1 flex items-center space-x-1"
                  onClick={startNavigation}
                >
                  <Navigation className="h-4 w-4" />
                  <span>{activeNavigation ? "Navigating" : "Start Navigation"}</span>
                </Button>
              )}
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Map;
