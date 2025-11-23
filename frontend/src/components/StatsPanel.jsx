import { useEffect, useState } from 'react';
import './StatsPanel.css';

const StatsPanel = ({ devices, nodes }) => {
  const totalDevices = devices.length;
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
    </div>
  );
};

export default StatsPanel;