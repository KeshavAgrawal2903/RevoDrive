
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
  updatedAt: Date; // for real-time updates
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
  updatedAt: Date; // for real-time updates
}

// Mock data for demonstration
const MOCK_LOCATIONS: Location[] = [
  { id: 'start1', name: 'Current Location', lat: 37.7749, lng: -122.4194, type: 'current' },
  { id: 'end1', name: 'San Francisco City Hall', lat: 37.7792, lng: -122.4191, type: 'end' },
  { id: 'waypoint1', name: 'Golden Gate Park', lat: 37.7694, lng: -122.4862, type: 'waypoint' },
  { id: 'charging1', name: 'Tesla Supercharger', lat: 37.7759, lng: -122.4733, type: 'charging' },
  { id: 'charging2', name: 'EVgo Fast Charging', lat: 37.7855, lng: -122.4001, type: 'charging' },
  { id: 'home', name: 'Home', lat: 37.7833, lng: -122.4167, type: 'start' },
  { id: 'work', name: 'Work', lat: 37.7891, lng: -122.4054, type: 'end' },
  { id: 'gym', name: 'Gym', lat: 37.7822, lng: -122.4363, type: 'waypoint' },
  { id: 'mall', name: 'Shopping Mall', lat: 37.7838, lng: -122.4073, type: 'waypoint' },
];

const generateMockRoutes = (): RouteOption[] => {
  return [
    {
      id: 'route1',
      name: 'Eco Route',
      distance: 12.3,
      duration: 28,
      energyUsage: 3.2,
      co2Saved: 4.8,
      ecoScore: 92,
      elevationGain: 45,
      trafficDelay: Math.floor(Math.random() * 5) + 1, // Random traffic delay for real-time simulation
      chargingStops: 0,
      updatedAt: new Date(),
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
      trafficDelay: Math.floor(Math.random() * 8) + 2,
      chargingStops: 0,
      updatedAt: new Date(),
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
      trafficDelay: Math.floor(Math.random() * 6) + 1,
      chargingStops: 0,
      updatedAt: new Date(),
    },
  ];
};

const generateMockChargingStations = (): ChargingStation[] => {
  return [
    {
      id: 'station1',
      name: 'Green Power Charging Hub',
      lat: 37.7759,
      lng: -122.4733,
      available: Math.random() > 0.3, // Randomly available for real-time simulation
      plugTypes: ['CCS', 'CHAdeMO', 'Type 2'],
      powerKw: 150,
      renewable: true,
      pricing: '$0.35/kWh',
      amenities: ['Cafe', 'Restrooms', 'WiFi'],
      updatedAt: new Date(),
    },
    {
      id: 'station2',
      name: 'Solar City Supercharger',
      lat: 37.7855,
      lng: -122.4001,
      available: Math.random() > 0.2,
      plugTypes: ['Tesla', 'CCS'],
      powerKw: 250,
      renewable: true,
      pricing: '$0.40/kWh',
      amenities: ['Restrooms', 'WiFi', 'Shopping'],
      updatedAt: new Date(),
    },
    {
      id: 'station3',
      name: 'Downtown Fast Charge',
      lat: 37.7892,
      lng: -122.4091,
      available: Math.random() > 0.5,
      plugTypes: ['CCS', 'CHAdeMO'],
      powerKw: 120,
      renewable: false,
      pricing: '$0.45/kWh',
      amenities: ['Restrooms'],
      updatedAt: new Date(),
    },
    {
      id: 'station4',
      name: 'EcoCharge Station',
      lat: 37.7738,
      lng: -122.3968,
      available: Math.random() > 0.1,
      plugTypes: ['CCS', 'Type 2'],
      powerKw: 180,
      renewable: true,
      pricing: '$0.38/kWh',
      amenities: ['Cafe', 'WiFi', 'Shopping'],
      updatedAt: new Date(),
    },
  ];
};

// Weather types
export interface WeatherData {
  temperature: number; // in Celsius
  condition: string;
  windSpeed: number; // in km/h
  precipitation: number; // in mm
  humidity: number; // percentage
  icon: string;
  updatedAt: Date; // for real-time updates
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
  updatedAt: Date; // for real-time updates
}

// Sample vehicle data
const generateMockVehicle = (): VehicleData => {
  const batteryLevel = Math.floor(Math.random() * 30) + 60; // Between 60-90%
  return {
    id: 'v1',
    name: 'Tesla Model Y',
    batteryLevel,
    range: Math.floor(batteryLevel * 3.5), // Simple calculation based on battery
    efficiency: 16.8,
    maxBatteryCapacity: 75,
    isCharging: false,
    location: MOCK_LOCATIONS[0],
    updatedAt: new Date(),
  };
};

// Sample weather data
const generateMockWeather = (): WeatherData => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: Math.floor(Math.random() * 10) + 15, // Between 15-25°C
    condition: randomCondition,
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
    precipitation: randomCondition.includes('Rain') ? Math.random() * 5 : 0,
    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
    icon: randomCondition === 'Sunny' ? 'sun' : 
          randomCondition === 'Partly Cloudy' ? 'cloud-sun' : 
          randomCondition === 'Cloudy' ? 'cloud' : 
          randomCondition === 'Light Rain' ? 'cloud-rain' : 'sun',
    updatedAt: new Date(),
  };
};

const useMapData = () => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>(generateMockRoutes());
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(generateMockChargingStations());
  const [vehicle, setVehicle] = useState<VehicleData>(generateMockVehicle());
  const [weather, setWeather] = useState<WeatherData>(generateMockWeather());
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate real-time updates for routes
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update routes with new traffic info every 30 seconds
      setRoutes(prev => {
        return prev.map(route => ({
          ...route,
          trafficDelay: Math.floor(Math.random() * 8) + 1,
          updatedAt: new Date()
        }));
      });
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate real-time updates for charging stations
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update charging station availability every 15 seconds
      setChargingStations(prev => {
        return prev.map(station => ({
          ...station,
          available: Math.random() > 0.3, // Randomly update availability
          updatedAt: new Date()
        }));
      });
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate real-time updates for vehicle data
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update vehicle data every 10 seconds
      setVehicle(prev => {
        const batteryChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newBattery = Math.max(1, Math.min(100, prev.batteryLevel + batteryChange));
        
        return {
          ...prev,
          batteryLevel: newBattery,
          range: Math.floor(newBattery * 3.5),
          updatedAt: new Date()
        };
      });
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate real-time weather updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update weather every minute
      setWeather(generateMockWeather());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to simulate getting routes
  const getRoutes = useCallback((start: Location, end: Location) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // We would fetch real routes from an API here
      setRoutes(generateMockRoutes());
      setSelectedRoute(generateMockRoutes()[0]);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Function to find nearby charging stations
  const findNearbyChargingStations = useCallback((location: Location, radius: number = 5) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // We would fetch real charging stations from an API here
      setChargingStations(generateMockChargingStations());
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Function to update vehicle data
  const updateVehicleData = useCallback((data: Partial<VehicleData>) => {
    setVehicle(prev => ({ ...prev, ...data, updatedAt: new Date() }));
  }, []);
  
  // Function to get weather data for a location
  const getWeatherData = useCallback((location: Location) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // We would fetch real weather from an API here
      setWeather(generateMockWeather());
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
