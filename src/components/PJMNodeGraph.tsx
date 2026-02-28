import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// PJM zones with 3D positions — all 20 zones spread across ±8 units
const PJM_ZONES = [
  // West Hub — small central anchor, not dominant
  { id: 'WEST_HUB',  label: 'WEST HUB',  position: [0, 0, 0] as [number,number,number],            lmp: 35.90, isHub: true },
  // Western zones — spread left and deep
  { id: 'COMED',     label: 'COMED',     position: [-7, 3, -4] as [number,number,number],           lmp: 32.04 },
  { id: 'EKPC',      label: 'EKPC',      position: [-8, -3, 2] as [number,number,number],           lmp: 32.48 },
  { id: 'AEP',       label: 'AEP',       position: [-5, -2, 4] as [number,number,number],           lmp: 33.36 },
  { id: 'OVEC',      label: 'OVEC',      position: [-3, -4, 3] as [number,number,number],           lmp: 32.56 },
  { id: 'DAY',       label: 'DAY',       position: [-4, 1, 5] as [number,number,number],            lmp: 33.89 },
  { id: 'DEOK',      label: 'DEOK',      position: [-3, -5, -2] as [number,number,number],          lmp: 32.69 },
  { id: 'ATSI',      label: 'ATSI',      position: [-5, 4, -3] as [number,number,number],           lmp: 33.23 },
  // Central/Pennsylvania zones
  { id: 'DUQ',       label: 'DUQ',       position: [-1, 5, 3] as [number,number,number],            lmp: 33.20 },
  { id: 'PENELEC',   label: 'PENELEC',   position: [1, 6, -1] as [number,number,number],            lmp: 32.96 },
  { id: 'PPL',       label: 'PPL',       position: [2, 3, 4] as [number,number,number],             lmp: 33.11 },
  { id: 'METED',     label: 'METED',     position: [3, 2, 5] as [number,number,number],             lmp: 34.10 },
  // Eastern zones — spread right
  { id: 'PECO',      label: 'PECO',      position: [5, 1, 2] as [number,number,number],             lmp: 34.10 },
  { id: 'PSEG',      label: 'PSEG',      position: [7, 3, -2] as [number,number,number],            lmp: 34.93 },
  { id: 'JCPL',      label: 'JCPL',      position: [6, -1, -4] as [number,number,number],           lmp: 34.67 },
  { id: 'RECO',      label: 'RECO',      position: [8, 2, -5] as [number,number,number],            lmp: 36.60 },
  // Southern/Mid-Atlantic zones
  { id: 'DPL',       label: 'DPL',       position: [4, -3, -3] as [number,number,number],           lmp: 35.26 },
  { id: 'PEPCO',     label: 'PEPCO',     position: [3, -5, -4] as [number,number,number],           lmp: 34.81 },
  { id: 'BGE',       label: 'BGE',       position: [2, -6, -2] as [number,number,number],           lmp: 34.50 },
  { id: 'DOMINION',  label: 'DOMINION',  position: [4, -5, 1] as [number,number,number],            lmp: 34.23 },
]

// Transmission connections — West Hub as soft backbone + direct geographic links
const CONNECTIONS: [string, string][] = [
  // West Hub soft connections — faint backbone
  ['WEST_HUB', 'AEP'],
  ['WEST_HUB', 'PPL'],
  ['WEST_HUB', 'PECO'],
  ['WEST_HUB', 'DOMINION'],
  // Direct geographic connections
  ['COMED', 'AEP'],
  ['COMED', 'ATSI'],
  ['EKPC', 'AEP'],
  ['AEP', 'OVEC'],
  ['AEP', 'DAY'],
  ['DAY', 'DEOK'],
  ['ATSI', 'DUQ'],
  ['DUQ', 'PENELEC'],
  ['DUQ', 'PPL'],
  ['PPL', 'METED'],
  ['PPL', 'PECO'],
  ['PECO', 'PSEG'],
  ['PECO', 'DPL'],
  ['PSEG', 'JCPL'],
  ['JCPL', 'RECO'],
  ['DPL', 'PEPCO'],
  ['PEPCO', 'BGE'],
  ['BGE', 'DOMINION'],
  ['DOMINION', 'AEP'],
]

// Color based on LMP value — Electric Blue theme
function lmpToColor(lmp: number, isSelected: boolean): THREE.Color {
  if (isSelected) return new THREE.Color('#00FFF0') // cyan when selected
  if (lmp < 32.5) return new THREE.Color('#00A3FF') // electric blue — cheap
  if (lmp < 34) return new THREE.Color('#00A3FF')   // electric blue — normal
  if (lmp < 35) return new THREE.Color('#FFB800')   // amber — elevated
  return new THREE.Color('#FF4444')                  // red — expensive
}

// Individual zone node
function ZoneNode({ zone, isSelected, onClick }: {
  zone: typeof PJM_ZONES[0]
  isSelected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = zone.isHub ? new THREE.Color('#00A3FF') : lmpToColor(zone.lmp, isSelected)
  const size = zone.isHub ? 0.18 : 0.15
  const targetScale = useRef(1)

  useFrame((state) => {
    if (!meshRef.current) return
    targetScale.current = isSelected ? 1.6 : 1.0
    // Smooth lerp to target scale
    const current = meshRef.current.scale.x
    const next = current + (targetScale.current - current) * 0.1
    // Pulse on top of base scale
    const pulse = Math.sin(state.clock.elapsedTime * 3) * (isSelected ? 0.08 : 0.02)
    meshRef.current.scale.setScalar(next + pulse)
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

// Star field — 300 random points for depth
function StarField() {
  const points = useMemo(() => {
    const arr = []
    for (let i = 0; i < 300; i++) {
      arr.push(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
      )
    }
    return new Float32Array(arr)
  }, [])

  const bufferRef = useRef<THREE.BufferGeometry>(null)

  useEffect(() => {
    if (bufferRef.current) {
      bufferRef.current.setAttribute('position', new THREE.BufferAttribute(points, 3))
    }
  }, [points])

  return (
    <points>
      <bufferGeometry ref={bufferRef} />
      <pointsMaterial
        size={0.06}
        color="#00A3FF"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}

// Grid plane at the bottom for depth reference
function GridPlane() {
  return (
    <gridHelper
      args={[30, 30, '#0a2a44', '#061a2e']}
      position={[0, -5, 0]}
    />
  )
}

// Scene
function Scene({ selectedZone, onZoneSelect }: {
  selectedZone: string | null
  onZoneSelect: (id: string) => void
}) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 2, 16)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <group>
      {/* Depth background */}
      <StarField />
      <GridPlane />

      {/* Ambient and point lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#00A3FF" />
      <pointLight position={[0, -5, -5]} intensity={0.5} color="#00FFF0" />

      {/* Connection lines */}
      {CONNECTIONS.map(([fromId, toId]) => {
        const from = PJM_ZONES.find(z => z.id === fromId)
        const to = PJM_ZONES.find(z => z.id === toId)
        if (!from || !to) return null
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
export function PJMNodeGraph({ onZoneSelect, expanded = false }: {
  onZoneSelect?: (zoneId: string) => void
  expanded?: boolean
}) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    if (selectedZone === id) {
      // Second click — deselect, notify parent with empty string
      setSelectedZone(null)
      onZoneSelect?.('')
    } else {
      // First click — highlight zone, notify parent but do NOT close
      setSelectedZone(id)
      onZoneSelect?.(id)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 2, 16], fov: 55 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <fog attach="fog" args={['#0A0A0B', 12, 25]} />
        <Scene selectedZone={selectedZone} onZoneSelect={handleSelect} />
        <OrbitControls
          enablePan={expanded}
          enableZoom={true}
          zoomToCursor={true}
          minDistance={expanded ? 3 : 8}
          maxDistance={expanded ? 30 : 18}
          autoRotate={true}
          autoRotateSpeed={expanded ? 0.8 : 1.2}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  )
}
