
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Location, RouteOption, ChargingStation } from '@/hooks/useMapData';

interface MapProps {
  locations: Location[];
  selectedRoute: RouteOption | null;
  chargingStations: ChargingStation[];
}

const Map: React.FC<MapProps> = ({ 
  locations, 
  selectedRoute, 
  chargingStations 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [showMapKeyInput, setShowMapKeyInput] = useState<boolean>(true);

  useEffect(() => {
    // Check for map API key in local storage
    const savedApiKey = localStorage.getItem('mapApiKey');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
      setShowMapKeyInput(false);
    }
  }, []);

  const handleMapKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapApiKey) {
      localStorage.setItem('mapApiKey', mapApiKey);
      setShowMapKeyInput(false);
    }
  };

  const renderPlaceholderMap = () => {
    // Mock map rendering with HTML/CSS when no API key is available
    return (
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Mock Map UI elements */}
          <div className="w-full h-full relative overflow-hidden">
            {/* Stylistic background for the map */}
            <div className="absolute inset-0 bg-tech-light/10 dark:bg-tech-dark/20"></div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Mockup roads */}
            <div className="absolute w-[80%] h-2 bg-white dark:bg-gray-600 top-1/2 left-[10%] transform -translate-y-1/2 rounded-full"></div>
            <div className="absolute w-2 h-[60%] bg-white dark:bg-gray-600 top-[20%] left-1/4 rounded-full"></div>
            <div className="absolute w-2 h-[40%] bg-white dark:bg-gray-600 top-[30%] left-2/3 rounded-full"></div>
            
            {/* Origin point */}
            <div className="absolute w-4 h-4 bg-eco rounded-full top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg"></div>
            
            {/* Destination point */}
            <div className="absolute w-4 h-4 bg-tech rounded-full top-1/2 left-3/4 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg"></div>
            
            {/* Path visualization */}
            <div className="absolute h-1 bg-eco-light top-1/2 transform -translate-y-1/2 left-1/4 right-1/4" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            }}></div>
          </div>
          
          {showMapKeyInput ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Enter Map API Key</h3>
                <form onSubmit={handleMapKeySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="apiKey" className="text-sm font-medium">
                      Mapbox API Key
                    </label>
                    <input
                      id="apiKey"
                      type="text"
                      value={mapApiKey}
                      onChange={(e) => setMapApiKey(e.target.value)}
                      placeholder="Enter your Mapbox API key"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-eco text-white rounded-md hover:bg-eco-dark transition-colors"
                  >
                    Set API Key
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    This key will be stored locally on your device.
                  </p>
                </form>
              </Card>
            </div>
          ) : (
            <div className="absolute bottom-4 left-4 max-w-xs">
              <Alert className="bg-background/80 backdrop-blur-sm">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Interactive map would display here with real API integration. The placeholder shows the route concept.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    );
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
      
      <div ref={mapContainerRef} className="w-full h-full">
        {renderPlaceholderMap()}
      </div>
    </div>
  );
};

export default Map;
