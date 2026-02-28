import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// === Z-AXIS PRICE SURFACE ===
// Expensive zones float toward viewer, cheap zones recede
const LMP_MIN = 30.0
const LMP_MAX = 40.0
const Z_RANGE = 6.0

function lmpToZOffset(lmp: number): number {
  const normalized = Math.min(1, Math.max(0, (lmp - LMP_MIN) / (LMP_MAX - LMP_MIN)))
  return normalized * Z_RANGE - Z_RANGE / 2
}

// === SPHERE SIZE FROM ZONE PEAK LOAD MW ===
const ZONE_PEAK_LOAD_MW: Record<string, number> = {
  'COMED':    25_800,
  'AEP':      19_400,
  'DOMINION': 18_200,
  'PSEG':     10_900,
  'PPL':       9_800,
  'PECO':      8_600,
  'BGE':       7_200,
  'ATSI':      6_800,
  'DPL':       4_100,
  'DAY':       3_900,
  'PEPCO':     3_700,
  'DUQ':       3_400,
  'JCPL':      3_200,
  'METED':     2_900,
  'PENELEC':   2_700,
  'DEOK':      2_400,
  'WEST_HUB':  2_200,
  'EKPC':      2_100,
  'OVEC':      1_800,
  'RECO':      1_200,
}

const MW_MIN = 1_200
const MW_MAX = 25_800
const R_MIN = 0.12
const R_MAX = 0.55

function mwToRadius(zoneId: string): number {
  const mw = ZONE_PEAK_LOAD_MW[zoneId] ?? 3_000
  const normalized = Math.min(1, Math.max(0, (mw - MW_MIN) / (MW_MAX - MW_MIN)))
  return R_MIN + normalized * (R_MAX - R_MIN)
}

// === RELATIVE COLOR PER ZONE 24H RANGE ===
const ZONE_24H_RANGE: Record<string, { low: number; high: number }> = {
  'WEST_HUB':  { low: 28.5, high: 38.2 },
  'COMED':     { low: 27.1, high: 35.6 },
  'AEP':       { low: 28.0, high: 36.4 },
  'ATSI':      { low: 27.8, high: 36.1 },
  'DAY':       { low: 27.9, high: 36.8 },
  'DEOK':      { low: 27.3, high: 35.2 },
  'DUQ':       { low: 27.6, high: 35.9 },
  'DOMINION':  { low: 28.8, high: 37.5 },
  'DPL':       { low: 29.1, high: 38.4 },
  'EKPC':      { low: 26.9, high: 34.8 },
  'PPL':       { low: 28.3, high: 37.0 },
  'PECO':      { low: 28.6, high: 37.8 },
  'PSEG':      { low: 29.2, high: 38.9 },
  'JCPL':      { low: 29.0, high: 38.5 },
  'PEPCO':     { low: 28.9, high: 38.1 },
  'BGE':       { low: 28.7, high: 37.9 },
  'METED':     { low: 28.4, high: 37.2 },
  'PENELEC':   { low: 27.5, high: 35.8 },
  'RECO':      { low: 29.8, high: 40.2 },
  'OVEC':      { low: 26.8, high: 34.6 },
}

function lmpToRelativeColor(zoneId: string, lmp: number, isSelected: boolean): THREE.Color {
  if (isSelected) return new THREE.Color('#00FFF0')

  // West Hub always white-cyan as pricing anchor
  if (zoneId === 'WEST_HUB') return new THREE.Color('#E0FFFF')

  const range = ZONE_24H_RANGE[zoneId]
  if (!range) return new THREE.Color('#00A3FF')

  const rangeSize = range.high - range.low
  const position = (lmp - range.low) / rangeSize // 0 = at daily low, 1 = at daily high

  if (position < 0.33) {
    // Lower third — cyan (cheap for this zone)
    return new THREE.Color('#00A3FF')
  } else if (position < 0.67) {
    // Middle third — amber (mid-range)
    return new THREE.Color('#FFB800')
  } else {
    // Upper third — red (expensive for this zone)
    return new THREE.Color('#FF4444')
  }
}

// PJM zones with geographic X/Y positions — Z is computed from LMP at render time
const PJM_ZONES = [
  // West Hub — just a peer zone, left-center
  { id: 'WEST_HUB', label: 'WEST HUB', position: [-2, 0, 1] as [number,number,number], lmp: 35.90 },
  // Far West
  { id: 'EKPC',     label: 'EKPC',     position: [-9, -2, -3] as [number,number,number], lmp: 32.48 },
  { id: 'COMED',    label: 'COMED',    position: [-7,  4,  3] as [number,number,number], lmp: 32.04 },
  { id: 'AEP',      label: 'AEP',      position: [-5, -1,  5] as [number,number,number], lmp: 33.36 },
  { id: 'OVEC',     label: 'OVEC',     position: [-4, -5,  2] as [number,number,number], lmp: 32.56 },
  // West-Central
  { id: 'DEOK',     label: 'DEOK',     position: [-3, -3, -5] as [number,number,number], lmp: 32.69 },
  { id: 'DAY',      label: 'DAY',      position: [-2,  2,  6] as [number,number,number], lmp: 33.89 },
  { id: 'ATSI',     label: 'ATSI',     position: [-4,  5, -1] as [number,number,number], lmp: 33.23 },
  // Central Pennsylvania
  { id: 'DUQ',      label: 'DUQ',      position: [ 0,  6,  3] as [number,number,number], lmp: 33.20 },
  { id: 'PENELEC',  label: 'PENELEC',  position: [ 1,  7, -2] as [number,number,number], lmp: 32.96 },
  { id: 'PPL',      label: 'PPL',      position: [ 3,  4,  4] as [number,number,number], lmp: 33.11 },
  { id: 'METED',    label: 'METED',    position: [ 4,  2,  6] as [number,number,number], lmp: 34.10 },
  // East — Philadelphia corridor
  { id: 'PECO',     label: 'PECO',     position: [ 6,  1,  2] as [number,number,number], lmp: 34.10 },
  // Mid-Atlantic South
  { id: 'DOMINION', label: 'DOMINION', position: [ 2, -6,  3] as [number,number,number], lmp: 34.23 },
  { id: 'BGE',      label: 'BGE',      position: [ 4, -5, -1] as [number,number,number], lmp: 34.50 },
  { id: 'PEPCO',    label: 'PEPCO',    position: [ 5, -6, -5] as [number,number,number], lmp: 34.81 },
  { id: 'DPL',      label: 'DPL',      position: [ 7, -3, -4] as [number,number,number], lmp: 35.26 },
  // Far East
  { id: 'PSEG',     label: 'PSEG',     position: [ 9,  2, -2] as [number,number,number], lmp: 34.93 },
  { id: 'JCPL',     label: 'JCPL',     position: [10, -1, -4] as [number,number,number], lmp: 34.67 },
  { id: 'RECO',     label: 'RECO',     position: [11,  0, -6] as [number,number,number], lmp: 36.60 },
]

// Transmission connections — West Hub connects to nearby western zones only
const CONNECTIONS: [string, string][] = [
  // West Hub connects only to nearby western zones
  ['WEST_HUB', 'AEP'],
  ['WEST_HUB', 'DAY'],
  ['WEST_HUB', 'ATSI'],
  // All other geographic connections
  ['EKPC',    'AEP'],
  ['COMED',   'AEP'],
  ['COMED',   'ATSI'],
  ['AEP',     'OVEC'],
  ['AEP',     'DAY'],
  ['AEP',     'DOMINION'],
  ['OVEC',    'DAY'],
  ['DAY',     'DEOK'],
  ['DEOK',    'ATSI'],
  ['ATSI',    'DUQ'],
  ['DUQ',     'PENELEC'],
  ['DUQ',     'PPL'],
  ['PENELEC', 'PPL'],
  ['PPL',     'METED'],
  ['PPL',     'PECO'],
  ['METED',   'PECO'],
  ['PECO',    'PSEG'],
  ['PECO',    'DPL'],
  ['PECO',    'BGE'],
  ['PSEG',    'JCPL'],
  ['JCPL',    'RECO'],
  ['DPL',     'PEPCO'],
  ['PEPCO',   'BGE'],
  ['BGE',     'DOMINION'],
]

// Individual zone node — size from MW, color from relative LMP, labels only in expanded
function ZoneNode({ zone, isSelected, onClick, expanded }: {
  zone: typeof PJM_ZONES[0] & { position: [number, number, number] }
  isSelected: boolean
  onClick: () => void
  expanded: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = lmpToRelativeColor(zone.id, zone.lmp, isSelected)
  const size = zone.id === 'WEST_HUB'
    ? mwToRadius(zone.id) * 1.25 // West Hub 25% larger as pricing anchor
    : mwToRadius(zone.id)
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
      {/* Zone label — only in expanded view */}
      {expanded && (
        <Text
          position={[0, size + 0.3, 0]}
          fontSize={0.16}
          color={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
          anchorX="center"
          anchorY="bottom"
        >
          {zone.label}
        </Text>
      )}
      {/* LMP price label — show on selected in expanded view */}
      {expanded && isSelected && (
        <Text
          position={[0, size + 0.6, 0]}
          fontSize={0.20}
          color={lmpToRelativeColor(zone.id, zone.lmp, false).getStyle()}
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

// Nebula — soft volumetric particle cloud surrounding the constellation
function Nebula() {
  const data = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []

    for (let i = 0; i < 500; i++) {
      // Distribute in an ellipsoid that matches the zone spread
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 8 + Math.random() * 10

      positions.push(
        r * Math.sin(phi) * Math.cos(theta) * 1.5, // wider on X (west-east axis)
        r * Math.sin(phi) * Math.sin(theta) * 0.8, // compressed on Y
        r * Math.cos(phi) * 1.2
      )

      // Mix of deep blue and faint cyan
      const isCyan = Math.random() > 0.7
      colors.push(
        isCyan ? 0 : 0,
        isCyan ? 0.8 : 0.3,
        isCyan ? 1.0 : 0.6,
      )
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [])

  const bufferRef = useRef<THREE.BufferGeometry>(null)

  useEffect(() => {
    if (bufferRef.current) {
      bufferRef.current.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
      bufferRef.current.setAttribute('color', new THREE.BufferAttribute(data.colors, 3))
    }
  }, [data])

  return (
    <points>
      <bufferGeometry ref={bufferRef} />
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// Reference plane at bottom for depth perception
function ReferencePlane() {
  return (
    <mesh rotation={[0, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[35, 35, 20, 20]} />
      <meshBasicMaterial
        color="#00A3FF"
        transparent
        opacity={0.03}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Scene — computes LMP Z-offset positions at render time
function Scene({ selectedZone, onZoneSelect, expanded }: {
  selectedZone: string | null
  onZoneSelect: (id: string) => void
  expanded: boolean
}) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 2, 18)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Compute Z-offset from LMP for each zone at render time
  const zoneWithLmpZ = useMemo(() =>
    PJM_ZONES.map(zone => ({
      ...zone,
      position: [
        zone.position[0],
        zone.position[1],
        zone.position[2] + lmpToZOffset(zone.lmp),
      ] as [number, number, number]
    })),
  [])

  return (
    <group>
      {/* Depth background */}
      <StarField />
      <Nebula />
      <ReferencePlane />

      {/* Ambient and point lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#00A3FF" />
      <pointLight position={[0, -5, -5]} intensity={0.5} color="#00FFF0" />

      {/* Connection lines — use LMP-offset positions */}
      {CONNECTIONS.map(([fromId, toId]) => {
        const from = zoneWithLmpZ.find(z => z.id === fromId)
        const to = zoneWithLmpZ.find(z => z.id === toId)
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

      {/* Zone nodes — use LMP-offset positions */}
      {zoneWithLmpZ.map(zone => (
        <ZoneNode
          key={zone.id}
          zone={zone}
          isSelected={selectedZone === zone.id}
          onClick={() => onZoneSelect(zone.id)}
          expanded={expanded}
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
        camera={{ position: [0, 2, 18], fov: 55 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <fog attach="fog" args={['#0A0A0B', 18, 45]} />
        <Scene selectedZone={selectedZone} onZoneSelect={handleSelect} expanded={expanded} />
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
