import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface BlockProps {
  title?: string;
  description?: string;
}

// Duck Model Component
function DuckModel({ position = [0, 0, 0], scale = 1, autoRotate = false }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load the duck model from the uploaded URL
  const gltf = useLoader(GLTFLoader, 'https://content.mext.app/uploads/bae853a8-ee93-4c72-9007-d73e1df8dba9.glb');
  
  // Auto rotation animation
  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px'
        }} />
        Loading Duck Model...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
}

// Main Block Component
const Block: React.FC<BlockProps> = ({ title = "3D Duck Visualizer", description }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraMode, setCameraMode] = useState('orbit');
  const controlsRef = useRef();

  // Send completion event on first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      window.postMessage({ type: 'BLOCK_COMPLETION', blockId: '685da7c487fb8b8b70d865d2', completed: true }, '*');
      window.parent.postMessage({ type: 'BLOCK_COMPLETION', blockId: '685da7c487fb8b8b70d865d2', completed: true }, '*');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      position: 'relative',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        color: 'white'
      }}>
        <h1 style={{
          margin: '0 0 5px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {title}
        </h1>
        {description && (
          <p style={{
            margin: 0,
            fontSize: '14px',
            opacity: 0.9,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            {description}
          </p>
        )}
      </div>

      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Controls</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Auto Rotate
          </label>
        </div>

        <button
          onClick={resetCamera}
          style={{
            width: '100%',
            padding: '8px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '10px'
          }}
        >
          Reset Camera
        </button>

        <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
          <div>• Left click + drag: Rotate</div>
          <div>• Right click + drag: Pan</div>
          <div>• Scroll: Zoom</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [5, 5, 5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Duck Model */}
        <Suspense fallback={<LoadingSpinner />}>
          <DuckModel autoRotate={autoRotate} scale={1.5} />
        </Suspense>

        {/* Ground Shadow */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={4}
        />

        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Footer Info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 100,
        color: 'rgba(255,255,255,0.8)',
        fontSize: '12px'
      }}>
        Interactive 3D Duck Model Viewer
      </div>
    </div>
  );
};

export default Block;