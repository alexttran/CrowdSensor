import { useState, useEffect } from 'react';
import HeatMap from './components/HeatMap';
import StatsPanel from './components/StatsPanel';
import { esp32Nodes, detectedDevices, updateDevicePositions } from './data/mockData';
import './App.css';

function App() {
  const [devices, setDevices] = useState(detectedDevices);
  const [nodes] = useState(esp32Nodes);

  useEffect(() => {
    // Update device positions every 2 seconds to simulate real-time data
    const interval = setInterval(() => {
      const updatedDevices = updateDevicePositions();
      setDevices([...updatedDevices]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <div className="main-content">
        <HeatMap devices={devices} nodes={nodes} />
      </div>
      <div className="side-panel">
        <StatsPanel devices={devices} nodes={nodes} />
      </div>
    </div>
  );
}

export default App;
