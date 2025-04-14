
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Battery,
  Map, 
  BarChart2, 
  Settings, 
  Sun, 
  Moon,
  Info,
  Zap,
  LogOut,
  User,
  ChevronDown,
  IndianRupee,
  Star
} from "lucide-react";
import { useTheme } from "next-themes";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface User {
  name: string;
  email: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onTabChange }) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleMenuClick = (tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
    }
    
    toast({
      title: `${tabName} View`,
      description: `Switched to ${tabName} view`,
      duration: 3000,
    });
  };

  return (
    <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <div className="container flex justify-between items-center py-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-eco" />
          <h1 className="text-xl font-bold">EcoRoute AI</h1>
          <span className="text-xs bg-eco/20 text-eco px-2 py-0.5 rounded-full hidden sm:inline-block">
            India
          </span>
        </div>
        
        <TooltipProvider>
          <nav className="hidden md:flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleMenuClick('Map')}
                >
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Map</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleMenuClick('Stations')}
                >
                  <Battery className="h-4 w-4" />
                  <span>Stations</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Charging Stations</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleMenuClick('Analytics')}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Energy Analytics</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleMenuClick('Saved')}
                >
                  <Star className="h-4 w-4" />
                  <span>Saved</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Saved Routes</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleMenuClick('Savings')}
                >
                  <IndianRupee className="h-4 w-4" />
                  <span>Savings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cost Savings</TooltipContent>
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
            onClick={() => toast({
              title: "About EcoRoute AI",
              description: "An intelligent route planner for EV drivers in India. Find the most energy-efficient routes, charging stations, and track your savings.",
              duration: 5000,
            })}
          >
            <Info className="h-5 w-5" />
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick('Profile')}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick('Saved')}>
                  <Star className="h-4 w-4 mr-2" /> Saved Routes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick('Settings')}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
