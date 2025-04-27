
# RevoDrive - Smart EV Route Optimization Platform

RevoDrive is an intelligent electric vehicle (EV) route planning platform that optimizes journeys by considering charging stations, battery capacity, and real-time environmental factors.

## 🚀 Features

- **Smart Route Planning**: AI-powered route optimization considering charging stops
- **Real-time Updates**: Live tracking of charging station availability
- **Energy Prediction**: Advanced algorithms to estimate battery consumption
- **Interactive Maps**: Detailed visualization of routes and charging stations
- **Charging Station Analytics**: Comprehensive data about charging locations
- **User Dashboard**: Personalized insights and route history
- **Weather Integration**: Route adjustments based on weather conditions
- **Favorites**: Save frequently used routes and charging stations

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Maps**: Mapbox GL JS
- **State Management**: TanStack Query
- **Charts**: Recharts
- **Icons**: Lucide React

## 🏗️ Project Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm (Node Package Manager)

### Installation Steps

1. Clone the repository
```sh
git clone <repository-url>
cd revodrive
```

2. Install dependencies
```sh
npm install
```

3. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_MAPBOX_API_KEY=your_mapbox_public_token_here
```

To obtain a Mapbox token:
- Visit [Mapbox](https://mapbox.com/)
- Create an account
- Navigate to Account > Access Tokens
- Create a new public token

4. Start Development Server
```sh
npm run dev
```

## 📱 Usage Requirements

### Location Services
- Enable browser location access
- Grant location permissions when prompted
- Ensure device location services are active

Browser-specific settings:
- **Chrome**: Settings > Privacy and Security > Site Settings > Location
- **Firefox**: Settings > Privacy & Security > Permissions > Location
- **Safari**: Preferences > Websites > Location

### Troubleshooting

#### Location Detection
- Verify browser location permissions
- Check device location services
- Try a different browser if issues persist
- For local development:
  - Some browsers restrict geolocation on non-HTTPS connections
  - Consider using a local HTTPS server
  - Manual location input is available as fallback

#### API Key Issues
- Confirm Mapbox token is public
- Verify token has geocoding permissions
- Check token scope and restrictions

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgments

- Thanks to the Mapbox team for their excellent mapping solutions
- Shadcn UI for the beautiful component library
- The React and TypeScript communities

