export function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full animate-grid-drift"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ga-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="200%" height="200%" fill="url(#ga-grid)" />
      </svg>
      <style>{`
        @keyframes ga-grid-drift {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-48px, -48px, 0); }
        }
        @keyframes ga-grid-breathe {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        .animate-grid-drift {
          animation: ga-grid-drift 60s linear infinite, ga-grid-breathe 12s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-grid-drift { animation: none; opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
