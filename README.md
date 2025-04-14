
# EV Route Optimizer

## Project Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm (Node Package Manager)

### Installation Steps

1. Clone the repository
```sh
git clone <your-repository-url>
cd <project-directory>
```

2. Install dependencies
```sh
npm install
```

3. Environment Configuration
   - Create a `.env` file in the project root
   - Add your Mapbox API key:
```
VITE_MAPBOX_API_KEY=your_mapbox_public_token_here
```

   🔑 To get a Mapbox token:
   - Visit https://mapbox.com/
   - Create an account
   - Go to Account > Access Tokens
   - Create a new public token

4. Start the development server
```sh
npm run dev
```

5. Enable Location Services
   - When prompted by your browser, allow location access
   - Ensure your device's location services are enabled
   - For Chrome: Settings > Privacy and Security > Site Settings > Location
   - For Firefox: Settings > Privacy & Security > Permissions > Location
   - For Safari: Preferences > Websites > Location

## Troubleshooting

### Location Detection Issues
- If your current location isn't detected:
  - Check that you've allowed location access in your browser
  - Try using a different browser
  - For local development, some browsers restrict geolocation on non-HTTPS connections
  - You may need to set up a local HTTPS server or use a tool like ngrok
  - As a workaround, you can manually set your starting location in the app

### API Key Issues
- Ensure your Mapbox token is a PUBLIC token
- Verify the token has the necessary geocoding permissions
- If you're experiencing location detection problems, double-check your token's scope

## Project Technologies
- Vite
- React
- TypeScript
- Tailwind CSS
- Mapbox GL JS
