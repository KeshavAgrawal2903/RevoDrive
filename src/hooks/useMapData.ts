
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

// Mock data for Indian locations
const MOCK_LOCATIONS: Location[] = [
  { id: 'start1', name: 'Current Location', lat: 28.6139, lng: 77.2090, type: 'current' },
  { id: 'end1', name: 'India Gate', lat: 28.6129, lng: 77.2295, type: 'end' },
  { id: 'waypoint1', name: 'Connaught Place', lat: 28.6289, lng: 77.2074, type: 'waypoint' },
  { id: 'charging1', name: 'EESL Charging Station', lat: 28.5923, lng: 77.2301, type: 'charging' },
  { id: 'charging2', name: 'Tata Power EZ Charge', lat: 28.6304, lng: 77.2177, type: 'charging' },
  { id: 'home', name: 'Home', lat: 28.6519, lng: 77.2315, type: 'start' },
  { id: 'work', name: 'Office', lat: 28.5535, lng: 77.2588, type: 'end' },
  { id: 'gym', name: 'Gym', lat: 28.6126, lng: 77.2073, type: 'waypoint' },
  { id: 'mall', name: 'Select Citywalk', lat: 28.5295, lng: 77.2195, type: 'waypoint' },
  { id: 'mumbai1', name: 'Mumbai Home', lat: 19.0760, lng: 72.8777, type: 'start' },
  { id: 'bangalore1', name: 'Bangalore Office', lat: 12.9716, lng: 77.5946, type: 'end' },
  { id: 'chennai1', name: 'Chennai Central', lat: 13.0827, lng: 80.2707, type: 'waypoint' },
  { id: 'kolkata1', name: 'Kolkata Station', lat: 22.5726, lng: 88.3639, type: 'waypoint' },
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
      name: 'Balanced Route (via Connaught Place)',
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
      name: 'EESL Fast Charging Hub',
      lat: 28.5923,
      lng: 77.2301,
      available: Math.random() > 0.3, // Randomly available for real-time simulation
      plugTypes: ['CCS', 'CHAdeMO', 'Type 2'],
      powerKw: 50,
      renewable: true,
      pricing: '₹15/kWh',
      amenities: ['Cafe', 'Restrooms', 'WiFi'],
      updatedAt: new Date(),
    },
    {
      id: 'station2',
      name: 'Tata Power EZ Charge',
      lat: 28.6304,
      lng: 77.2177,
      available: Math.random() > 0.2,
      plugTypes: ['CCS', 'Type 2'],
      powerKw: 60,
      renewable: true,
      pricing: '₹18/kWh',
      amenities: ['Restrooms', 'WiFi', 'Shopping'],
      updatedAt: new Date(),
    },
    {
      id: 'station3',
      name: 'NTPC Charging Station',
      lat: 28.5790,
      lng: 77.2300,
      available: Math.random() > 0.5,
      plugTypes: ['CCS', 'CHAdeMO'],
      powerKw: 50,
      renewable: false,
      pricing: '₹16/kWh',
      amenities: ['Restrooms'],
      updatedAt: new Date(),
    },
    {
      id: 'station4',
      name: 'Fortum Charge & Drive',
      lat: 28.5493,
      lng: 77.2651,
      available: Math.random() > 0.1,
      plugTypes: ['CCS', 'Type 2'],
      powerKw: 100,
      renewable: true,
      pricing: '₹20/kWh',
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

// Sample Indian EVs
const generateMockVehicle = (): VehicleData => {
  const batteryLevel = Math.floor(Math.random() * 30) + 60; // Between 60-90%
  const vehicles = [
    { name: 'Tata Nexon EV', efficiency: 15.8, capacity: 40.5 },
    { name: 'MG ZS EV', efficiency: 17.1, capacity: 50.3 },
    { name: 'Hyundai Kona Electric', efficiency: 14.3, capacity: 39.2 },
    { name: 'Mahindra XUV400 EV', efficiency: 16.5, capacity: 39.4 }
  ];
  
  const selectedVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  
  return {
    id: 'v1',
    name: selectedVehicle.name,
    batteryLevel,
    range: Math.floor(batteryLevel * selectedVehicle.capacity / selectedVehicle.efficiency), 
    efficiency: selectedVehicle.efficiency,
    maxBatteryCapacity: selectedVehicle.capacity,
    isCharging: false,
    location: MOCK_LOCATIONS[0],
    updatedAt: new Date(),
  };
};

// Sample weather data for India
const generateMockWeather = (): WeatherData => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear', 'Hot', 'Humid'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: Math.floor(Math.random() * 15) + 25, // Between 25-40°C (hotter for India)
    condition: randomCondition,
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
    precipitation: randomCondition.includes('Rain') ? Math.random() * 5 : 0,
    humidity: Math.floor(Math.random() * 30) + 60, // 60-90% (higher for India)
    icon: randomCondition === 'Sunny' ? 'sun' : 
          randomCondition === 'Partly Cloudy' ? 'cloud-sun' : 
          randomCondition === 'Cloudy' ? 'cloud' : 
          randomCondition === 'Light Rain' ? 'cloud-rain' : 
          randomCondition === 'Hot' ? 'thermometer-sun' : 
          randomCondition === 'Humid' ? 'droplets' : 'sun',
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
          range: Math.floor(newBattery * prev.maxBatteryCapacity / prev.efficiency),
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
  
  // Function to simulate getting routes between two locations
  const getRoutes = useCallback((start: Location, end: Location) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate routes between specific locations
      const newRoutes = [
        {
          id: 'custom1',
          name: `Eco Route: ${start.name} to ${end.name}`,
          distance: Math.round((Math.random() * 5 + 10) * 10) / 10,
          duration: Math.floor(Math.random() * 10 + 25),
          energyUsage: Math.round((Math.random() * 2 + 3) * 10) / 10,
          co2Saved: Math.round((Math.random() * 2 + 3) * 10) / 10,
          ecoScore: Math.floor(Math.random() * 10 + 85),
          elevationGain: Math.floor(Math.random() * 50 + 40),
          trafficDelay: Math.floor(Math.random() * 5 + 1),
          chargingStops: Math.random() > 0.8 ? 1 : 0,
          updatedAt: new Date(),
        },
        {
          id: 'custom2',
          name: `Fast Route: ${start.name} to ${end.name}`,
          distance: Math.round((Math.random() * 3 + 8) * 10) / 10,
          duration: Math.floor(Math.random() * 5 + 20),
          energyUsage: Math.round((Math.random() * 1 + 4) * 10) / 10,
          co2Saved: Math.round((Math.random() * 1 + 2) * 10) / 10,
          ecoScore: Math.floor(Math.random() * 15 + 65),
          elevationGain: Math.floor(Math.random() * 70 + 60),
          trafficDelay: Math.floor(Math.random() * 3 + 2),
          chargingStops: 0,
          updatedAt: new Date(),
        },
        {
          id: 'custom3',
          name: `Balanced Route: ${start.name} to ${end.name}`,
          distance: Math.round((Math.random() * 4 + 9) * 10) / 10,
          duration: Math.floor(Math.random() * 7 + 22),
          energyUsage: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          co2Saved: Math.round((Math.random() * 1.5 + 2.5) * 10) / 10,
          ecoScore: Math.floor(Math.random() * 10 + 75),
          elevationGain: Math.floor(Math.random() * 60 + 50),
          trafficDelay: Math.floor(Math.random() * 4 + 1),
          chargingStops: Math.random() > 0.9 ? 1 : 0,
          updatedAt: new Date(),
        }
      ];
      
      setRoutes(newRoutes);
      setSelectedRoute(newRoutes[0]);
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
