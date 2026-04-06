// src/components/shared/CardSkeleton.tsx
// Pulsing placeholder for card loading states.
// Use as Suspense fallback and as pre-data loading state in Sprint 2C.

import { C } from "../../config/design-tokens";

interface CardSkeletonProps {
  rows?: number;
}

export function CardSkeleton({ rows = 3 }: CardSkeletonProps) {
  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      gap:           8,
      padding:       16,
      height:        "100%",
    }}>
      <div style={{
        height:       8,
        borderRadius: 4,
        background:   C.glassBorder,
        width:        "40%",
        animation:    "card-pulse 1.5s ease-in-out infinite",
      }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          flex:         i === rows - 1 ? 1 : undefined,
          height:       i === rows - 1 ? undefined : 40,
          borderRadius: 4,
          background:   i === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
          animation:    `card-pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}
