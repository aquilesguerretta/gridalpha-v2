import Spline from '@splinetool/react-spline'
import { useRef, useEffect, useMemo } from 'react'
import { useGridStore } from '../stores/grid.store'

type FalconState = 'normal' | 'volatility' | 'scarcity' | 'calm'

export default function FalconLogo({ collapsed: _collapsed }: { collapsed: boolean }) {
  const splineRef = useRef<any>(null)

  // Derive LMP and alert state from the Zustand ring buffer
  const frames = useGridStore((s) => s.frames)
  const currentIndex = useGridStore((s) => s.currentIndex)

  const currentFrame = useMemo(
    () => (frames.length > 0 ? frames[currentIndex] : null),
    [frames, currentIndex],
  )

  const lmpPrice = currentFrame?.lmp_total ?? 31.85
  const hasEmergency =
    currentFrame?.alert_payload?.severity === 'critical' ||
    currentFrame?.data_quality === 'RECONNECTING'

  // Compute falcon state
  const getFalconState = (): FalconState => {
    const hour = new Date().getHours()
    if (hour >= 23 || hour <= 5) return 'calm'
    if (hasEmergency || lmpPrice > 300) return 'scarcity'
    if (lmpPrice > 150) return 'volatility'
    return 'normal'
  }

  const falconState = getFalconState()

  // Drive Spline state on change
  useEffect(() => {
    if (!splineRef.current) return
    const stateMap: Record<FalconState, string> = {
      normal: 'Base State',
      volatility: 'Volatility',
      scarcity: 'Scarcity',
      calm: 'Calm',
    }
    splineRef.current.emitEvent('mouseDown', stateMap[falconState])
  }, [falconState])

  return (
    <div style={{ width: 48, height: 48, overflow: 'hidden' }}>
      <Spline
        scene="https://prod.spline.design/wOs78zfJDU6wipSz/scene.splinecode"
        onLoad={(spline) => {
          splineRef.current = spline
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
