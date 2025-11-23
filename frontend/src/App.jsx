import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import HeatMap from './components/HeatMap';
import StatsPanel from './components/StatsPanel';
import { esp32Nodes, detectedDevices, updateDevicePositions, updateNodePosition } from './data/mockData';

// WebSocket server URL - change if running on different host
const SOCKET_URL = 'http://localhost:5001';

function App() {
  const [devices, setDevices] = useState(detectedDevices);
  const [nodes, setNodes] = useState(esp32Nodes);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const appRef = useRef(null);

  const scrollToApp = () => {
    appRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('Attempting to connect to WebSocket server at', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    window.crowdMapSocket = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to CrowdMap backend!');
      setConnectionStatus('connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setConnectionStatus('disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
      setConnectionStatus('error');
      setIsConnected(false);
    });

    socket.on('connection_status', (data) => {
      console.log('Backend status:', data);
    });

    socket.on('map_update', (data) => {
      if (data.nodes && data.devices) {
        console.log('📡 Received update:', data.devices.length, 'devices');
        setNodes(data.nodes);
        setDevices(data.devices);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isConnected) {
      console.log('🔄 Using mock data animation');
      const interval = setInterval(() => {
        const updatedDevices = updateDevicePositions();
        setDevices([...updatedDevices]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const handleNodePositionChanged = ({ nodeId, nodeName, newPosition }) => {
    console.log(`🔄 Node position update: ${nodeName} -> [${newPosition[0].toFixed(2)}, ${newPosition[1].toFixed(2)}]`);

    if (!isConnected) {
      updateNodePosition(nodeId, newPosition);
      console.log('✅ Updated mock node position - devices will retriangulate');
    }

    if (window.crowdMapSocket && window.crowdMapSocket.connected) {
      window.crowdMapSocket.emit('node_position_update', {
        nodeId,
        nodeName,
        position: newPosition
      });
      console.log('✅ Sent to backend - devices will recalculate on next update');
    }
  };

  const totalDevices = devices.length;
  const activeNodes = nodes.filter(n => n.status === 'online').length;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      background: '#18181b',
      scrollSnapType: 'y mandatory'
    }}>
      {/* Landing Section */}
      <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        scrollSnapAlign: 'start',
        background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
      }}>
        {/* Animated grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3
        }} />

        <div style={{
          textAlign: 'center',
          zIndex: 1,
          maxWidth: '800px',
          padding: '0 32px'
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '24px',
            letterSpacing: '-2px'
          }}>
            CROWDMAP
          </div>

          <div style={{
            fontSize: '24px',
            color: '#a1a1aa',
            marginBottom: '16px',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}>
            Indoor Positioning System
          </div>

          <div style={{
            fontSize: '16px',
            color: '#71717a',
            marginBottom: '48px',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Real-time WiFi triangulation and crowd density visualization using ESP32 nodes.
            Track device movement, analyze patterns, and visualize indoor positioning data.
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '64px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '16px',
              padding: '32px',
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', fontWeight: 700, color: '#fafafa', marginBottom: '8px', letterSpacing: '-2px' }}>
                {totalDevices}
              </div>
              <div style={{ fontSize: '14px', color: '#a1a1aa', letterSpacing: '0.5px' }}>
                Devices Nearby
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              width: '100%'
            }}>
              <div style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '12px',
                padding: '20px 32px',
                flex: 1,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#fafafa', marginBottom: '4px' }}>
                  {activeNodes}/{nodes.length}
                </div>
                <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Active Nodes
                </div>
              </div>

              <div style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '12px',
                padding: '20px 32px',
                flex: 1,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: connectionStatus === 'connected' ? '#22c55e' : '#71717a',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: connectionStatus === 'connected' ? '#22c55e' : '#71717a',
                    boxShadow: connectionStatus === 'connected' ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none'
                  }} />
                  {connectionStatus === 'connected' ? 'LIVE' : 'DEMO'}
                </div>
                <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={scrollToApp}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              color: '#fafafa',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            View Heatmap →
          </button>
        </div>

        
      </section>

      {/* App Section */}
      <section
        ref={appRef}
        style={{
          height: '100vh',
          display: 'flex',
          scrollSnapAlign: 'start',
          position: 'relative'
        }}
      >
        <div style={{
          flex: 1,
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
        }}>
          {/* Placeholder for HeatMap */}
          <HeatMap
            devices={devices}
            nodes={nodes}
            onNodePositionChanged={handleNodePositionChanged}
          />

          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#e2e8f0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: connectionStatus === 'connected' ? '#22c55e' : '#eab308',
              boxShadow: connectionStatus === 'connected' 
                ? '0 0 10px rgba(34, 197, 94, 0.4)' 
                : '0 0 10px rgba(234, 179, 8, 0.4)'
            }} />
            <span>
              {connectionStatus === 'connected' ? 'Live Data' : 'Using Mock Data'}
            </span>
          </div>
        </div>

        <div style={{
          width: '420px',
          minWidth: '420px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <StatsPanel devices={devices} nodes={nodes} />
        </div>
      </section>
    </div>
  );
}

export default App;