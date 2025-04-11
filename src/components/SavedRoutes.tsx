
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { BookmarkPlus, Star, MapPin, Route, Clock, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Location } from '@/hooks/useMapData';

interface SavedRoute {
  id: string;
  name: string;
  description?: string;
  startLocation: Location;
  endLocation: Location;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  savedAt: Date;
  lastUsed?: Date;
}

interface SavedRoutesProps {
  onSelectRoute: (startLoc: Location, endLoc: Location) => void;
  locations: Location[];
}

const SavedRoutes: React.FC<SavedRoutesProps> = ({ onSelectRoute, locations }) => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([
    {
      id: '1',
      name: 'Home to Office',
      description: 'My daily commute route',
      startLocation: locations.find(loc => loc.name === 'Home') || locations[0],
      endLocation: locations.find(loc => loc.name === 'Work') || locations[1],
      frequency: 'daily',
      savedAt: new Date(),
      lastUsed: new Date(Date.now() - 86400000) // yesterday
    },
    {
      id: '2',
      name: 'Weekend Trip',
      description: 'Trip to mall on weekends',
      startLocation: locations.find(loc => loc.name === 'Home') || locations[0],
      endLocation: locations.find(loc => loc.name === 'Shopping Mall') || locations[4],
      frequency: 'weekly',
      savedAt: new Date(Date.now() - 604800000), // a week ago
      lastUsed: new Date(Date.now() - 172800000) // two days ago
    }
  ]);
  
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDescription, setNewRouteDescription] = useState('');
  const { toast } = useToast();
  
  const handleUseRoute = (route: SavedRoute) => {
    onSelectRoute(route.startLocation, route.endLocation);
    
    // Update last used timestamp
    setSavedRoutes(prev => 
      prev.map(r => 
        r.id === route.id 
          ? { ...r, lastUsed: new Date() } 
          : r
      )
    );
    
    toast({
      title: "Route Loaded",
      description: `${route.name} has been loaded successfully.`,
      duration: 3000,
    });
  };
  
  const handleSaveNewRoute = () => {
    if (!newRouteName) {
      toast({
        title: "Error",
        description: "Please provide a name for your route",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    const newRoute: SavedRoute = {
      id: Date.now().toString(),
      name: newRouteName,
      description: newRouteDescription,
      startLocation: locations[0],
      endLocation: locations[1],
      frequency: 'occasional',
      savedAt: new Date(),
    };
    
    setSavedRoutes(prev => [...prev, newRoute]);
    setIsAddingRoute(false);
    setNewRouteName('');
    setNewRouteDescription('');
    
    toast({
      title: "Route Saved",
      description: "Your route has been saved successfully.",
      duration: 3000,
    });
  };
  
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-eco" />
            <span>Saved Routes</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setIsAddingRoute(!isAddingRoute)}
          >
            <BookmarkPlus className="h-4 w-4 mr-1" />
            {isAddingRoute ? "Cancel" : "Add Route"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAddingRoute && (
          <div className="mb-4 p-3 border rounded-md bg-background/50">
            <h4 className="font-medium text-sm mb-2">Save New Route</h4>
            <div className="space-y-3">
              <div>
                <FormLabel className="text-xs">Route Name</FormLabel>
                <Input
                  placeholder="e.g., Daily Commute"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <FormLabel className="text-xs">Description (Optional)</FormLabel>
                <Textarea
                  placeholder="Describe this route..."
                  value={newRouteDescription}
                  onChange={(e) => setNewRouteDescription(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="bg-eco hover:bg-eco-dark"
                  onClick={handleSaveNewRoute}
                >
                  Save Route
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {savedRoutes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No saved routes yet. Add your frequent routes to quickly access them.
            </div>
          ) : (
            savedRoutes.map((route) => (
              <div
                key={route.id}
                className="border rounded-md p-3 hover:border-eco/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{route.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleUseRoute(route)}
                  >
                    Use
                  </Button>
                </div>
                
                {route.description && (
                  <p className="text-xs text-muted-foreground mb-2">{route.description}</p>
                )}
                
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                    <span>From: {route.startLocation.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-green-500" />
                    <span>To: {route.endLocation.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1 pt-1 border-t text-[10px] text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Saved {getTimeAgo(route.savedAt)}</span>
                    </div>
                    {route.lastUsed && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Used {getTimeAgo(route.lastUsed)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedRoutes;
