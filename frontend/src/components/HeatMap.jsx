import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import './HeatMap.css';

const HeatMap = ({ devices, nodes }) => {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create a custom CRS (Coordinate Reference System) for indoor mapping
    const bounds = [[0, 0], [10, 12]];

    // Initialize map
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 2,
      zoomControl: false,
      attributionControl: false
    });

    // Set view to center of the area
    map.fitBounds(bounds);

    // Add a dark custom tile layer (grid background)
    const gridLayer = L.layerGroup();
    map.addLayer(gridLayer);

    mapInstanceRef.current = map;

    // Add ESP32 node markers
    nodes.forEach(node => {
      const icon = L.divIcon({
        className: 'node-marker',
        html: `
          <div class="node-marker-inner ${node.status}">
            <div class="node-pulse"></div>
            <div class="node-label">${node.name}</div>
          </div>
        `,
        iconSize: [40, 40]
      });

      L.marker([node.position[1], node.position[0]], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="node-popup">
            <strong>${node.name}</strong><br/>
            Status: ${node.status}<br/>
            Avg RSSI: ${node.rssiAvg} dBm<br/>
            Devices: ${node.devicesDetected}
          </div>
        `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [nodes]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    // Create heat map data points
    const heatData = devices.map(device => [
      device.position[1],
      device.position[0],
      0.8 // intensity
    ]);

    // Add heat layer
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 35,
      blur: 45,
      maxZoom: 2,
      max: 1.0,
      gradient: {
        0.0: '#0a0a2e',
        0.2: '#16213e',
        0.4: '#0f3460',
        0.6: '#533483',
        0.8: '#e94560',
        1.0: '#ff6b9d'
      }
    }).addTo(mapInstanceRef.current);

    // Add device markers
    devices.forEach(device => {
      const icon = L.divIcon({
        className: 'device-marker',
        html: '<div class="device-marker-dot"></div>',
        iconSize: [8, 8]
      });

      L.marker([device.position[1], device.position[0]], { icon })
        .addTo(mapInstanceRef.current);
    });
  }, [devices]);

  return (
    <div className="heatmap-container">
      <div ref={mapRef} className="leaflet-map" />
    </div>
  );
};

export default HeatMap;
