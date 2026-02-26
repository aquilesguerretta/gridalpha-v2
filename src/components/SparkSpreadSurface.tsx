import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Generate spark spread surface data
// X: Time (0-23 hours), Y: Fuel Price ($2-$6/MMBtu), Z: Profitability
function generateSurfaceData(resolution: number = 24) {
  const data: number[][] = [];
  
  for (let y = 0; y < resolution; y++) {
    const row: number[] = [];
    const fuelPrice = 2 + (y / (resolution - 1)) * 4; // $2 to $6
    
    for (let x = 0; x < resolution; x++) {
      const hour = x;
      
      // Base electricity price pattern (higher during peak hours)
      let electricityPrice = 25 + Math.sin((hour - 6) * Math.PI / 12) * 15;
      if (hour >= 14 && hour <= 20) electricityPrice += 10; // Evening peak
      if (hour >= 6 && hour <= 9) electricityPrice += 5; // Morning peak
      
      // Heat rate (efficiency) - typical gas plant ~7000 BTU/kWh
      const heatRate = 7.0; // MMBtu/MWh
      
      // Spark spread = Electricity - (Heat Rate × Fuel Price)
      const sparkSpread = electricityPrice - (heatRate * fuelPrice);
      
      // Normalize to -1 to 1 range for visualization
      const normalizedSpread = Math.max(-1, Math.min(1, sparkSpread / 20));
      row.push(normalizedSpread);
    }
    data.push(row);
  }
  
  return data;
}

// Color gradient from Deep Red (-1) to Falcon Gold (+1)
function getSpreadColor(value: number): THREE.Color {
  if (value < 0) {
    // Deep Red for negative spread
    const t = Math.abs(value);
    return new THREE.Color(
      0.6 + t * 0.2,  // R: 0.6-0.8
      0.1 * (1 - t),  // G: 0-0.1
      0.1 * (1 - t)   // B: 0-0.1
    );
  } else if (value < 0.5) {
    // Transition: orange zone
    const t = value / 0.5;
    return new THREE.Color(
      0.8 + t * 0.2,  // R: 0.8-1.0
      0.3 + t * 0.4,  // G: 0.3-0.7
      0.1             // B: constant
    );
  } else {
    // Falcon Gold (#FFB800) for peak opportunity
    const t = (value - 0.5) / 0.5;
    return new THREE.Color(
      1.0,             // R: 1.0
      0.7 + t * 0.05,  // G: 0.7-0.75
      t * 0.2          // B: 0-0.2 (slight warm)
    );
  }
}

function SpreadSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  const resolution = 24;
  
  const { geometry, wireframeGeometry } = useMemo(() => {
    const data = generateSurfaceData(resolution);
    const geo = new THREE.PlaneGeometry(4, 4, resolution - 1, resolution - 1);
    const positions = geo.attributes.position;
    const colors: number[] = [];
    
    for (let i = 0; i < positions.count; i++) {
      const x = Math.floor(i % resolution);
      const y = Math.floor(i / resolution);
      const value = data[Math.min(y, resolution - 1)]?.[Math.min(x, resolution - 1)] ?? 0;
      
      // Set Z height based on spread value
      positions.setZ(i, value * 0.8);
      
      // Set color
      const color = getSpreadColor(value);
      colors.push(color.r, color.g, color.b);
    }
    
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    
    // Create wireframe geometry
    const wire = new THREE.WireframeGeometry(geo);
    
    return { geometry: geo, wireframeGeometry: wire };
  }, []);
  
  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });
  
  return (
    <group ref={meshRef} rotation={[-Math.PI / 3, 0, Math.PI / 6]}>
      {/* Main surface */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Wireframe overlay for grid effect */}
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#00A3FF" opacity={0.15} transparent />
      </lineSegments>
      
      {/* Glow plane underneath */}
      <mesh position={[0, 0, -0.5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial color="#00A3FF" opacity={0.05} transparent />
      </mesh>
    </group>
  );
}

function AxisLabels() {
  return (
    <group>
      {/* X axis label (Time) */}
      <group position={[2.5, -2, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#00A3FF" opacity={0} transparent />
        </mesh>
      </group>
      
      {/* Y axis label (Fuel Price) */}
      <group position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#00A3FF" opacity={0} transparent />
        </mesh>
      </group>
    </group>
  );
}

export function SparkSpreadSurface3D() {
  return (
    <div className="relative w-full h-full min-h-[180px]">
      {/* Axis labels as HTML overlay */}
      <div className="absolute bottom-1 right-2 z-10">
        <span 
          className="text-[8px] tracking-wider"
          style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(0, 163, 255, 0.6)" }}
        >
          TIME →
        </span>
      </div>
      <div className="absolute top-2 left-1 z-10">
        <span 
          className="text-[8px] tracking-wider"
          style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(0, 163, 255, 0.6)" }}
        >
          ↑ FUEL $
        </span>
      </div>
      
      {/* Color legend */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#FFB800" }} />
          <span 
            className="text-[7px]"
            style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}
          >
            PEAK
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#CC2222" }} />
          <span 
            className="text-[7px]"
            style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}
          >
            LOSS
          </span>
        </div>
      </div>
      
      {/* Height (Z) label */}
      <div className="absolute bottom-1 left-1 z-10">
        <span 
          className="text-[7px] tracking-wider"
          style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 184, 0, 0.7)" }}
        >
          Z: SPREAD
        </span>
      </div>
      
      <Canvas
        camera={{ position: [3, 3, 4], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, 2]} intensity={0.3} color="#00A3FF" />
        
        <SpreadSurface />
        <AxisLabels />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
        
        {/* Grid helper for reference */}
        <gridHelper args={[6, 12, "#00A3FF", "#0A0A0B"]} position={[0, -1.5, 0]} rotation={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}

export default SparkSpreadSurface3D;