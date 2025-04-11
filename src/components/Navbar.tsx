
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Battery,
  Map, 
  BarChart2, 
  Settings, 
  Sun, 
  Moon,
  Info,
  Zap
} from "lucide-react";
import { useTheme } from "next-themes";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <div className="container flex justify-between items-center py-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-eco" />
          <h1 className="text-xl font-bold">EcoRoute AI</h1>
        </div>
        
        <TooltipProvider>
          <nav className="hidden md:flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Map</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Battery className="h-4 w-4" />
                  <span>Stations</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Charging Stations</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Energy Analytics</TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="About"
          >
            <Info className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
