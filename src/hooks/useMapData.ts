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

// Mock data for Indian locations (will be replaced with real data from Mapbox API)
const INITIAL_LOCATIONS: Location[] = [
  { id: 'current', name: 'Current Location', lat: 28.6139, lng: 77.2090, type: 'current' },
  { id: 'end1', name: 'India Gate', lat: 28.6129, lng: 77.2295, type: 'end' },
];

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
    location: INITIAL_LOCATIONS[0],
    updatedAt: new Date(),
  };
};

// Sample weather data for India
const generateWeatherData = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    // In a real app, you would fetch from a weather API here
    // For now, we'll generate mock data based on the location
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate more realistic data for Indian regions
    const isSouthIndia = lat < 20;
    const isCoastal = lng > 80 || lng < 73;
    
    const baseTemp = isSouthIndia ? 32 : 28;
    const tempVariation = Math.random() * 8 - 4;
    const temperature = Math.round(baseTemp + tempVariation);
    
    const conditions = [
      'Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 
      'Clear', 'Hot', 'Humid', 'Hazy', 'Foggy'
    ];
    const seasonalConditions = isCoastal ? 
      [...conditions, 'Humid', 'Light Rain'] : 
      [...conditions, 'Hot', 'Hazy'];
    
    const randomCondition = seasonalConditions[Math.floor(Math.random() * seasonalConditions.length)];
    
    return {
      temperature,
      condition: randomCondition,
      windSpeed: Math.floor(Math.random() * 15) + (isCoastal ? 10 : 5),
      precipitation: randomCondition.includes('Rain') ? Math.random() * 5 : 0,
      humidity: Math.floor(Math.random() * 30) + (isCoastal ? 60 : 40),
      icon: getWeatherIcon(randomCondition),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating weather data:', error);
    // Return fallback data
    return {
      temperature: 30,
      condition: 'Clear',
      windSpeed: 10,
      precipitation: 0,
      humidity: 60,
      icon: 'sun',
      updatedAt: new Date(),
    };
  }
};

const getWeatherIcon = (condition: string): string => {
  switch(condition) {
    case 'Sunny': return 'sun';
    case 'Partly Cloudy': return 'cloud-sun';
    case 'Cloudy': return 'cloud';
    case 'Light Rain': return 'cloud-rain';
    case 'Hot': return 'thermometer-sun';
    case 'Humid': return 'droplets';
    case 'Hazy': return 'cloud-fog';
    case 'Foggy': return 'cloud-fog';
    default: return 'sun';
  }
};

// Get Indian charging stations near a location
const getNearbyChargingStations = async (lat: number, lng: number, radius: number = 5): Promise<ChargingStation[]> => {
  try {
    // In a real app, you would fetch from an API here
    // For now, we'll generate mock data based on the location
    
    console.log(`Refreshing stations near ${lat.toFixed(4)}, ${lng.toFixed(4)} within ${radius}km radius...`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate 3-7 stations within radius
    const numStations = Math.floor(Math.random() * 5) + 3;
    const stations: ChargingStation[] = [];
    
    // Indian charging networks
    const networks = ['Tata Power EZ Charge', 'EESL', 'Fortum Charge & Drive', 'Ather Grid', 'Statiq', 'Magenta ChargeGrid', 'Chargezone'];
    
    // Indian pricing models
    const pricingModels = ['₹15/kWh', '₹18/kWh', '₹16/kWh', '₹20/kWh', '₹12/kWh + ₹5/min after 30min'];
    
    for (let i = 0; i < numStations; i++) {
      // Generate a point within radius km of the given location
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;
      
      // Convert km to rough lat/lng offset (this is simplified and not geographically accurate)
      const latOffset = (distance * Math.cos(angle)) / 111;
      const lngOffset = (distance * Math.sin(angle)) / (111 * Math.cos(lat * Math.PI / 180));
      
      const stationLat = lat + latOffset;
      const stationLng = lng + lngOffset;
      
      const network = networks[Math.floor(Math.random() * networks.length)];
      const plugTypes = ['CCS', 'CHAdeMO', 'Type 2', 'Bharat AC'];
      const randomPlugs = plugTypes.filter(() => Math.random() > 0.4);
      
      stations.push({
        id: `station-${i}-${Date.now()}`,
        name: `${network} - ${Math.random() > 0.5 ? 'Fast Charger' : 'EV Station'}`,
        lat: stationLat,
        lng: stationLng,
        available: Math.random() > 0.3, // 70% chance of being available
        plugTypes: randomPlugs.length > 0 ? randomPlugs : [plugTypes[0]],
        powerKw: Math.random() > 0.7 ? 100 : Math.random() > 0.5 ? 50 : 25,
        renewable: Math.random() > 0.5,
        pricing: pricingModels[Math.floor(Math.random() * pricingModels.length)],
        amenities: ['Cafe', 'Restrooms', 'WiFi', 'Shopping'].filter(() => Math.random() > 0.6),
        updatedAt: new Date(),
      });
    }
    
    return stations;
  } catch (error) {
    console.error('Error getting nearby charging stations:', error);
    return [];
  }
};

// Calculate routes between locations using Mapbox Directions API
const calculateRoutes = async (start: Location, end: Location, apiKey: string): Promise<RouteOption[]> => {
  try {
    console.log('Finding routes...');
    
    // In a real app, you would use the actual Mapbox Directions API here
    // For now, we'll simulate the API call and generate realistic data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Calculate straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLon = (end.lng - start.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Add some realistic variation to the routes
    const routes: RouteOption[] = [
      {
        id: 'eco-route',
        name: `Eco Route: ${start.name} to ${end.name}`,
        distance: Math.round((distance * 1.1) * 10) / 10, // 10% longer than direct
        duration: Math.round(distance * 1.1 * 2), // Assuming 30 km/h average speed
        energyUsage: Math.round((distance * 1.1 * 0.15) * 10) / 10, // 0.15 kWh per km
        co2Saved: Math.round((distance * 0.12) * 10) / 10, // Compared to gas vehicle
        ecoScore: Math.floor(Math.random() * 10 + 85), // 85-95 score
        elevationGain: Math.floor(Math.random() * 50 + 40),
        trafficDelay: Math.floor(Math.random() * 5 + 1),
        chargingStops: distance > 100 ? 1 : 0,
        updatedAt: new Date(),
      },
      {
        id: 'fast-route',
        name: `Fast Route: ${start.name} to ${end.name}`,
        distance: Math.round(distance * 10) / 10, // Direct route
        duration: Math.round(distance * 1.8), // Faster speed
        energyUsage: Math.round((distance * 0.18) * 10) / 10, // More energy usage
        co2Saved: Math.round((distance * 0.09) * 10) / 10,
        ecoScore: Math.floor(Math.random() * 15 + 65), // 65-80 score
        elevationGain: Math.floor(Math.random() * 70 + 60),
        trafficDelay: Math.floor(Math.random() * 8 + 2),
        chargingStops: distance > 150 ? 1 : 0,
        updatedAt: new Date(),
      },
      {
        id: 'balanced-route',
        name: `Balanced Route: ${start.name} to ${end.name}`,
        distance: Math.round((distance * 1.05) * 10) / 10, // 5% longer than direct
        duration: Math.round(distance * 1.9), // Balanced speed
        energyUsage: Math.round((distance * 1.05 * 0.16) * 10) / 10,
        co2Saved: Math.round((distance * 0.11) * 10) / 10,
        ecoScore: Math.floor(Math.random() * 10 + 75), // 75-85 score
        elevationGain: Math.floor(Math.random() * 60 + 50),
        trafficDelay: Math.floor(Math.random() * 6 + 1),
        chargingStops: distance > 120 ? 1 : 0,
        updatedAt: new Date(),
      }
    ];
    
    return routes;
  } catch (error) {
    console.error('Error calculating routes:', error);
    return [];
  }
};

const useMapData = () => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [vehicle, setVehicle] = useState<VehicleData>(generateMockVehicle());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 30,
    condition: 'Clear',
    windSpeed: 10,
    precipitation: 0,
    humidity: 60,
    icon: 'sun',
    updatedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Add a location to the map
  const addLocation = useCallback((location: Location) => {
    setLocations(prev => {
      // If a location with the same type already exists, replace it
      if (location.type === 'current' || location.type === 'start' || location.type === 'end') {
        return [...prev.filter(loc => loc.type !== location.type), location];
      }
      // Otherwise add it
      return [...prev, location];
    });
  }, []);
  
  // Update a location
  const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
    setLocations(prev => 
      prev.map(loc => loc.id === id ? { ...loc, ...updates } : loc)
    );
  }, []);
  
  // Remove a location
  const removeLocation = useCallback((id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  }, []);
  
  // Simulate real-time updates for charging stations
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update station availability every 15 seconds
      if (locations.length > 0 && locations[0].lat) {
        const mainLocation = locations.find(loc => loc.type === 'current') || locations[0];
        getNearbyChargingStations(mainLocation.lat, mainLocation.lng)
          .then(newStations => {
            setChargingStations(newStations);
          });
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [locations]);
  
  // Simulate real-time updates for vehicle data
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update vehicle data every 10 seconds
      setVehicle(prev => {
        // Simulate battery drain during drive
        const batteryChange = selectedRoute 
          ? -(Math.random() * 0.5) // Drain if route is active
          : Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0; // Random change if idle
        
        const newBattery = Math.max(1, Math.min(100, prev.batteryLevel + batteryChange));
        
        return {
          ...prev,
          batteryLevel: newBattery,
          range: Math.floor(newBattery * prev.maxBatteryCapacity / prev.efficiency),
          updatedAt: new Date()
        };
      });
    }, 10000); // 10 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedRoute]);
  
  // Simulate real-time weather updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update weather every minute
      if (locations.length > 0 && locations[0].lat) {
        const mainLocation = locations.find(loc => loc.type === 'current') || locations[0];
        generateWeatherData(mainLocation.lat, mainLocation.lng)
          .then(newWeather => {
            setWeather(newWeather);
          });
      }
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  }, [locations]);
  
  // Function to get routes between two locations
  const getRoutes = useCallback(async (start: Location, end: Location) => {
    setIsLoading(true);
    
    try {
      const apiKey = localStorage.getItem('mapApiKey');
      if (!apiKey) {
        throw new Error('Mapbox API key not found');
      }
      
      const newRoutes = await calculateRoutes(start, end, apiKey);
      
      if (newRoutes.length > 0) {
        setRoutes(newRoutes);
        setSelectedRoute(newRoutes[0]);
      }
    } catch (error) {
      console.error('Error getting routes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to find nearby charging stations
  const findNearbyChargingStations = useCallback(async (location: Location, radius: number = 5) => {
    setIsLoading(true);
    
    try {
      const newStations = await getNearbyChargingStations(location.lat, location.lng, radius);
      setChargingStations(newStations);
    } catch (error) {
      console.error('Error finding charging stations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to update vehicle data
  const updateVehicleData = useCallback((data: Partial<VehicleData>) => {
    setVehicle(prev => ({ ...prev, ...data, updatedAt: new Date() }));
  }, []);
  
  // Function to get weather data for a location
  const getWeatherData = useCallback(async (location: Location) => {
    setIsLoading(true);
    
    try {
      const newWeather = await generateWeatherData(location.lat, location.lng);
      setWeather(newWeather);
    } catch (error) {
      console.error('Error getting weather data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initialize with current location and fetch nearby charging stations
  useEffect(() => {
    if (locations.find(loc => loc.type === 'current')) {
      const currentLocation = locations.find(loc => loc.type === 'current')!;
      findNearbyChargingStations(currentLocation);
      getWeatherData(currentLocation);
    }
  }, [findNearbyChargingStations, getWeatherData, locations]);
  
  return {
    selectedRoute,
    setSelectedRoute,
    routes,
    locations,
    setLocations,
    addLocation,
    updateLocation,
    removeLocation,
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
