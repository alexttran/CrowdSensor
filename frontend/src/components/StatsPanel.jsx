import { useEffect, useState } from 'react';
import './StatsPanel.css';

const StatsPanel = ({ devices, nodes }) => {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDevices = devices.length;
  const avgRssi = nodes.reduce((sum, node) => sum + node.rssiAvg, 0) / nodes.length;
  const activeNodes = nodes.filter(n => n.status === 'online').length;

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h1 className="panel-title">CROWDMAP</h1>
        <div className="panel-subtitle">Indoor Positioning System</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL DEVICES</div>
          <div className="stat-value">{totalDevices}</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${Math.min(totalDevices * 2.5, 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">ACTIVE NODES</div>
          <div className="stat-value">{activeNodes}/{nodes.length}</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${(activeNodes / nodes.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">AVG SIGNAL</div>
          <div className="stat-value">{avgRssi.toFixed(0)} dBm</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${Math.min(Math.abs(avgRssi), 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">SYSTEM UPTIME</div>
          <div className="stat-value uptime">{formatUptime(uptime)}</div>
        </div>
      </div>

      <div className="nodes-section">
        <h2 className="section-title">ESP32 NODES</h2>
        <div className="nodes-list">
          {nodes.map(node => (
            <div key={node.id} className="node-card">
              <div className="node-status-indicator">
                <div className={`status-dot ${node.status}`}></div>
              </div>
              <div className="node-info">
                <div className="node-name">{node.name}</div>
                <div className="node-id">{node.id}</div>
              </div>
              <div className="node-stats">
                <div className="node-stat">
                  <span className="node-stat-label">RSSI</span>
                  <span className="node-stat-value">{node.rssiAvg} dBm</span>
                </div>
                <div className="node-stat">
                  <span className="node-stat-label">DEVICES</span>
                  <span className="node-stat-value">{node.devicesDetected}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="system-info">
        <div className="info-row">
          <span className="info-label">MODE</span>
          <span className="info-value">TRILATERATION</span>
        </div>
        <div className="info-row">
          <span className="info-label">SCAN INTERVAL</span>
          <span className="info-value">2.0s</span>
        </div>
        <div className="info-row">
          <span className="info-label">DATA SOURCE</span>
          <span className="info-value placeholder-badge">PLACEHOLDER</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
