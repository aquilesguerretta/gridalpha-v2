/**
 * GridAlpha V2 — FalconLogo
 *
 * React Three Fiber placeholder for the Spline Falcon asset.
 * Renders a wireframe octahedron whose emissive colour and rotation
 * speed respond to the current alert state.
 */

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";

// ── state → visual mapping ──────────────────────────────────────

type FalconState = "idle" | "warning" | "critical";

interface StateVisual {
  color: string;
  intensity: number;
  speed: number;
}

const STATE_MAP: Record<FalconState, StateVisual> = {
  idle: { color: "#00FFFF", intensity: 0.3, speed: 0.4 },
  warning: { color: "#FFB800", intensity: 0.5, speed: 0.4 },
  critical: { color: "#FF3B3B", intensity: 0.8, speed: 0.8 },
};

// ── inner mesh (needs Canvas context) ───────────────────────────

function FalconMesh({ state }: { state: FalconState }) {
  const meshRef = useRef<Mesh>(null);
  const { color, intensity, speed } = STATE_MAP[state];

  useFrame((_rootState, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        wireframe
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// ── public component ────────────────────────────────────────────

export interface FalconLogoProps {
  state: FalconState;
}

export default function FalconLogo({ state }: FalconLogoProps) {
  return (
    <Canvas
      style={{ width: 120, height: 120 }}
      gl={{ alpha: true }}
      camera={{ position: [0, 0, 3], fov: 50 }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} />
      <FalconMesh state={state} />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}
