
import { useState, useEffect, useCallback } from 'react';

// Types for locations and routes
export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'waypoint' | 'charging' | 'current';
}

export interface RouteOption {
  id: string;
  name: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  energyUsage: number; // in kWh
  co2Saved: number; // in kg compared to gas vehicle
  ecoScore: number; // 0-100 score
  elevationGain: number; // in meters
  trafficDelay: number; // in minutes
  chargingStops: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  available: boolean;
  plugTypes: string[];
  powerKw: number;
  renewable: boolean;
  pricing: string;
  amenities: string[];
}

// Mock data for demonstration
const MOCK_LOCATIONS: Location[] = [
  { id: 'start1', name: 'Current Location', lat: 37.7749, lng: -122.4194, type: 'current' },
  { id: 'end1', name: 'San Francisco City Hall', lat: 37.7792, lng: -122.4191, type: 'end' },
  { id: 'waypoint1', name: 'Golden Gate Park', lat: 37.7694, lng: -122.4862, type: 'waypoint' },
  { id: 'charging1', name: 'Tesla Supercharger', lat: 37.7759, lng: -122.4733, type: 'charging' },
  { id: 'charging2', name: 'EVgo Fast Charging', lat: 37.7855, lng: -122.4001, type: 'charging' },
];

const MOCK_ROUTES: RouteOption[] = [
  {
    id: 'route1',
    name: 'Eco Route',
    distance: 12.3,
    duration: 28,
    energyUsage: 3.2,
    co2Saved: 4.8,
    ecoScore: 92,
    elevationGain: 45,
    trafficDelay: 2,
    chargingStops: 0,
  },
  {
    id: 'route2',
    name: 'Fastest Route',
    distance: 10.5,
    duration: 22,
    energyUsage: 3.8,
    co2Saved: 3.6,
    ecoScore: 78,
    elevationGain: 120,
    trafficDelay: 5,
    chargingStops: 0,
  },
  {
    id: 'route3',
    name: 'Balanced Route',
    distance: 11.7,
    duration: 25,
    energyUsage: 3.5,
    co2Saved: 4.2,
    ecoScore: 85,
    elevationGain: 75,
    trafficDelay: 3,
    chargingStops: 0,
  },
];

const MOCK_CHARGING_STATIONS: ChargingStation[] = [
  {
    id: 'station1',
    name: 'Green Power Charging Hub',
    lat: 37.7759,
    lng: -122.4733,
    available: true,
    plugTypes: ['CCS', 'CHAdeMO', 'Type 2'],
    powerKw: 150,
    renewable: true,
    pricing: '$0.35/kWh',
    amenities: ['Cafe', 'Restrooms', 'WiFi'],
  },
  {
    id: 'station2',
    name: 'Solar City Supercharger',
    lat: 37.7855,
    lng: -122.4001,
    available: true,
    plugTypes: ['Tesla', 'CCS'],
    powerKw: 250,
    renewable: true,
    pricing: '$0.40/kWh',
    amenities: ['Restrooms', 'WiFi', 'Shopping'],
  },
  {
    id: 'station3',
    name: 'Downtown Fast Charge',
    lat: 37.7892,
    lng: -122.4091,
    available: false,
    plugTypes: ['CCS', 'CHAdeMO'],
    powerKw: 120,
    renewable: false,
    pricing: '$0.45/kWh',
    amenities: ['Restrooms'],
  },
];

// Weather types
export interface WeatherData {
  temperature: number; // in Celsius
  condition: string;
  windSpeed: number; // in km/h
  precipitation: number; // in mm
  humidity: number; // percentage
  icon: string;
}

// Vehicle data types
export interface VehicleData {
  id: string;
  name: string;
  batteryLevel: number; // percentage
  range: number; // in kilometers
  efficiency: number; // in kWh/100km
  maxBatteryCapacity: number; // in kWh
  isCharging: boolean;
  location?: Location;
}

// Sample vehicle data
const MOCK_VEHICLE: VehicleData = {
  id: 'v1',
  name: 'Tesla Model Y',
  batteryLevel: 72,
  range: 280,
  efficiency: 16.8,
  maxBatteryCapacity: 75,
  isCharging: false,
  location: MOCK_LOCATIONS[0],
};

// Sample weather data
const MOCK_WEATHER: WeatherData = {
  temperature: 18,
  condition: 'Partly Cloudy',
  windSpeed: 12,
  precipitation: 0,
  humidity: 65,
  icon: 'cloud-sun',
};

const useMapData = () => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>(MOCK_ROUTES);
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(MOCK_CHARGING_STATIONS);
  const [vehicle, setVehicle] = useState<VehicleData>(MOCK_VEHICLE);
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to simulate getting routes
  const getRoutes = useCallback((start: Location, end: Location) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // We would fetch real routes from an API here
      setRoutes(MOCK_ROUTES);
      setSelectedRoute(MOCK_ROUTES[0]);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Function to find nearby charging stations
  const findNearbyChargingStations = useCallback((location: Location, radius: number = 5) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // We would fetch real charging stations from an API here
      setChargingStations(MOCK_CHARGING_STATIONS);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Function to update vehicle data
  const updateVehicleData = useCallback((data: Partial<VehicleData>) => {
    setVehicle(prev => ({ ...prev, ...data }));
  }, []);
  
  // Function to get weather data for a location
  const getWeatherData = useCallback((location: Location) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // We would fetch real weather from an API here
      setWeather(MOCK_WEATHER);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Initialize with start and end locations on mount
  useEffect(() => {
    if (locations.length >= 2) {
      const start = locations.find(loc => loc.type === 'current');
      const end = locations.find(loc => loc.type === 'end');
      
      if (start && end) {
        getRoutes(start, end);
        findNearbyChargingStations(start);
        getWeatherData(start);
      }
    }
  }, [getRoutes, findNearbyChargingStations, getWeatherData, locations]);
  
  return {
    selectedRoute,
    setSelectedRoute,
    routes,
    locations,
    setLocations,
    chargingStations,
    vehicle,
    updateVehicleData,
    weather,
    isLoading,
    getRoutes,
    findNearbyChargingStations,
    getWeatherData,
  };
};

export default useMapData;
