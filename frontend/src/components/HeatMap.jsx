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
    // Adjust these bounds to match your image dimensions and coordinate system
    const bounds = [[0, 0], [100, 120]];

    // Initialize map
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // Set view to center of the area
    map.fitBounds(bounds);

    // Add background image overlay
    // Place your image in: /public/floor-plan.jpg
    const imageUrl = '/floor-plan.jpg';
    const imageOverlay = L.imageOverlay(imageUrl, bounds, {
      opacity: 1.0,
      interactive: false
    });
    imageOverlay.addTo(map);

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

    if (devices.length === 0) return;

    // Create heat map data points [lat, lng, intensity]
    const heatData = devices.map(device => [
      device.position[1], // lat (y)
      device.position[0], // lng (x)
      1.0 // max intensity
    ]);

    // Check if L.heatLayer exists
    if (!L.heatLayer) {
      console.error('leaflet.heat not loaded - heatmap will not display');
      return;
    }

    // Add heat layer with precise, zoom-independent settings
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 25,          // Smaller radius for precise blobs
      blur: 15,            // Minimal blur for sharp edges
      max: 1.0,            // Maximum intensity
      minOpacity: 0.4,     // Visible but not overwhelming
      gradient: {
        0.0: 'rgba(10, 10, 46, 0)',      // Transparent dark blue
        0.2: '#16213e',                   // Dark blue
        0.3: '#0f3460',                   // Medium blue
        0.5: '#533483',                   // Purple
        0.7: '#e94560',                   // Pink/red
        1.0: '#ff6b9d'                    // Bright pink
      }
    }).addTo(mapInstanceRef.current);
  }, [devices]);

  return (
    <div className="heatmap-container">
      <div ref={mapRef} className="leaflet-map" />

      {/* Heatmap Legend */}
      <div className="heatmap-legend">
        <div className="legend-title">Device Density</div>
        <div className="legend-scale">
          <div className="legend-labels">
            <span>High</span>
            <span>Medium</span>
            <span>Low</span>
            <span>None</span>
          </div>
          <div className="legend-gradient"></div>
        </div>
        <div className="legend-info">
          {devices.length} devices detected
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
