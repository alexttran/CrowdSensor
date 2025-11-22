# CrowdMap Frontend

A futuristic React-based frontend for the CrowdMap indoor positioning system. Visualizes real-time people detection data from three ESP32 nodes using heatmap technology.

## Features

- **Live Heatmap Visualization**: Real-time display of detected devices using Leaflet and heatmap layers
- **ESP32 Node Monitoring**: Track status, RSSI, and device counts for all three nodes
- **Futuristic UI**: Sleek dark theme with cyberpunk-inspired styling, glowing effects, and animations
- **Real-time Updates**: Simulated device movement and detection updates every 2 seconds
- **System Statistics**: Total devices, active nodes, average signal strength, and system uptime

## Technology Stack

- **React** - UI framework
- **Vite** - Fast build tool and dev server
- **Leaflet** - Map rendering
- **Leaflet.heat** - Heatmap visualization
- **Custom CSS** - Futuristic styling with animations

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Current State

The frontend currently uses **placeholder data** to simulate:
- 3 ESP32 nodes positioned in a triangular formation
- 25 randomly positioned detected devices
- Real-time position updates and occasional device additions/removals
- RSSI signal strength values

## Integration with Backend

To connect to a real ESP32 backend:

1. Update the data source in `src/data/mockData.js` to fetch from your API endpoint
2. Replace the mock `updateDevicePositions()` function with real WebSocket or HTTP polling
3. Adjust the trilateration calculation based on your actual node positions

## Components

- **HeatMap** (`src/components/HeatMap.jsx`) - Main visualization component with Leaflet integration
- **StatsPanel** (`src/components/StatsPanel.jsx`) - Right sidebar with system statistics and node status
- **mockData** (`src/data/mockData.js`) - Placeholder data generation and simulation

## Customization

### Adjust Node Positions

Edit `esp32Nodes` in `src/data/mockData.js`:

```javascript
export const esp32Nodes = [
  { id: 'ESP32-A', name: 'Node Alpha', position: [x, y], ... },
  // ...
];
```

### Change Color Scheme

Modify the gradient in `src/components/HeatMap.jsx`:

```javascript
gradient: {
  0.0: '#yourColor1',
  0.5: '#yourColor2',
  1.0: '#yourColor3'
}
```

### Adjust Update Interval

Change the interval in `src/App.jsx`:

```javascript
setInterval(() => {
  // Update logic
}, 2000); // milliseconds
```

## License

Part of the CrowdMap project.
