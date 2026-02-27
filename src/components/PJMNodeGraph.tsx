import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// PJM zones with 3D positions mapped from geographic layout
const PJM_ZONES = [
  { id: 'WEST_HUB', label: 'WEST HUB', position: [0, 0, 0] as [number,number,number], lmp: 35.90, isHub: true },
  { id: 'COMED',    label: 'COMED',    position: [-4, 1.5, 0] as [number,number,number], lmp: 32.04 },
  { id: 'AEP',      label: 'AEP',      position: [-2.5, -1, 0.5] as [number,number,number], lmp: 33.36 },
  { id: 'ATSI',     label: 'ATSI',     position: [-2, 2, -0.5] as [number,number,number], lmp: 33.23 },
  { id: 'DUQ',      label: 'DUQ',      position: [-0.5, 1.5, 1] as [number,number,number], lmp: 33.20 },
  { id: 'DOMINION', label: 'DOMINION', position: [1, -2.5, 0] as [number,number,number], lmp: 34.23 },
  { id: 'PPL',      label: 'PPL',      position: [1.5, 0.5, 1] as [number,number,number], lmp: 33.11 },
  { id: 'PECO',     label: 'PECO',     position: [2.5, 0, 0.5] as [number,number,number], lmp: 34.10 },
  { id: 'PSEG',     label: 'PSEG',     position: [3.5, 1, -0.5] as [number,number,number], lmp: 34.93 },
  { id: 'JCPL',     label: 'JCPL',     position: [3, -0.5, -1] as [number,number,number], lmp: 34.67 },
]

// Transmission connections between zones
const CONNECTIONS: [string, string][] = [
  ['WEST_HUB', 'COMED'],
  ['WEST_HUB', 'AEP'],
  ['WEST_HUB', 'ATSI'],
  ['WEST_HUB', 'DUQ'],
  ['WEST_HUB', 'PPL'],
  ['WEST_HUB', 'DOMINION'],
  ['DUQ', 'PPL'],
  ['PPL', 'PECO'],
  ['PECO', 'PSEG'],
  ['PSEG', 'JCPL'],
  ['JCPL', 'PPL'],
  ['AEP', 'DOMINION'],
  ['ATSI', 'DUQ'],
  ['COMED', 'AEP'],
]

// Color based on LMP value
function lmpToColor(lmp: number): THREE.Color {
  if (lmp < 32) return new THREE.Color('#00A3FF')
  if (lmp < 34) return new THREE.Color('#00FF88')
  if (lmp < 36) return new THREE.Color('#FFB800')
  return new THREE.Color('#FF4444')
}

// Individual zone node
function ZoneNode({ zone, isSelected, onClick }: {
  zone: typeof PJM_ZONES[0]
  isSelected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = lmpToColor(zone.lmp)
  const size = zone.isHub ? 0.25 : 0.15
  const pulseRef = useRef(0)

  useFrame(() => {
    if (!meshRef.current) return
    pulseRef.current += 0.05
    const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5
    const baseScale = isSelected ? 1.4 : 1.0
    const pulseScale = isSelected ? baseScale + pulse * 0.15 : baseScale + pulse * 0.03
    meshRef.current.scale.setScalar(pulseScale)
    meshRef.current.rotation.y += 0.005
  })

  return (
    <group position={zone.position} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[size * 2.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.15 : 0.05}
        />
      </mesh>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 2.5 : 0.8}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Zone label */}
      <Text
        position={[0, size + 0.25, 0]}
        fontSize={0.18}
        color={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
        anchorX="center"
        anchorY="bottom"
      >
        {zone.label}
      </Text>
      {/* LMP price label — show on selected */}
      {isSelected && (
        <Text
          position={[0, size + 0.55, 0]}
          fontSize={0.22}
          color={color.getStyle()}
          anchorX="center"
          anchorY="bottom"
        >
          ${zone.lmp.toFixed(2)}
        </Text>
      )}
    </group>
  )
}

// Animated connection line with particle
function ConnectionLine({ from, to, active }: {
  from: [number,number,number]
  to: [number,number,number]
  active: boolean
}) {
  const particleRef = useRef<THREE.Mesh>(null)
  const tRef = useRef(0)

  useFrame(() => {
    if (!particleRef.current) return
    tRef.current = (tRef.current + 0.008) % 1
    const t = tRef.current
    particleRef.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t,
    )
  })

  return (
    <group>
      <Line
        points={[from, to]}
        color={active ? '#00A3FF' : 'rgba(255,255,255,0.08)'}
        lineWidth={active ? 1.5 : 0.5}
        transparent
        opacity={active ? 0.6 : 0.2}
      />
      {/* Flowing particle */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial
          color={active ? '#00FFF0' : '#FFFFFF'}
          transparent
          opacity={active ? 0.9 : 0.3}
        />
      </mesh>
    </group>
  )
}

// Scene with camera auto-rotation
function Scene({ selectedZone, onZoneSelect }: {
  selectedZone: string | null
  onZoneSelect: (id: string) => void
}) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 2, 10)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <group>
      {/* Ambient and point lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#00A3FF" />
      <pointLight position={[0, -5, -5]} intensity={0.5} color="#00FFF0" />

      {/* Connection lines */}
      {CONNECTIONS.map(([fromId, toId]) => {
        const from = PJM_ZONES.find(z => z.id === fromId)!
        const to = PJM_ZONES.find(z => z.id === toId)!
        const active = selectedZone === fromId || selectedZone === toId
        return (
          <ConnectionLine
            key={`${fromId}-${toId}`}
            from={from.position}
            to={to.position}
            active={active}
          />
        )
      })}

      {/* Zone nodes */}
      {PJM_ZONES.map(zone => (
        <ZoneNode
          key={zone.id}
          zone={zone}
          isSelected={selectedZone === zone.id}
          onClick={() => onZoneSelect(zone.id)}
        />
      ))}
    </group>
  )
}

// Main export
export function PJMNodeGraph({ onZoneSelect }: {
  onZoneSelect?: (zoneId: string) => void
}) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    const next = selectedZone === id ? null : id
    setSelectedZone(next)
    onZoneSelect?.(next ?? '')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <fog attach="fog" args={['#0A0A0B', 12, 25]} />
        <Scene selectedZone={selectedZone} onZoneSelect={handleSelect} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!selectedZone}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  )
}
