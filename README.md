
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

## Troubleshooting

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
