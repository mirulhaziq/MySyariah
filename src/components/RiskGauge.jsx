export default function RiskGauge({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, score || 0))
  const progress = (clamped / 100) * circumference

  const color = clamped <= 30 ? '#22c55e' : clamped <= 60 ? '#f97316' : '#ef4444'
  const label = clamped <= 30 ? 'LOW RISK' : clamped <= 60 ? 'ELEVATED' : 'HIGH RISK'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="148" height="148" viewBox="0 0 148 148">
          <defs>
            <filter id="gauge-glow-mb">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle cx="74" cy="74" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="10" />

          {/* Tick marks at 30 and 60 */}
          {[0, 30, 60, 100].map((tick) => {
            const angle = ((tick / 100) * 360 - 90) * (Math.PI / 180)
            const inner = radius - 7
            const outer = radius + 2
            return (
              <line key={tick}
                x1={74 + inner * Math.cos(angle)} y1={74 + inner * Math.sin(angle)}
                x2={74 + outer * Math.cos(angle)} y2={74 + outer * Math.sin(angle)}
                stroke="#2e2e2e" strokeWidth="2"
              />
            )
          })}

          {/* Progress arc */}
          <circle
            cx="74" cy="74" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 74 74)"
            style={{
              transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)',
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold leading-none mono" style={{ color }}>
            {clamped}
          </span>
          <span className="text-xs mt-1" style={{ color: '#a0a0a0', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }}>
            /100
          </span>
        </div>
      </div>

      <div
        className="text-xs font-bold tracking-widest px-3 py-1 rounded"
        style={{
          color,
          background: `${color}15`,
          border: `1px solid ${color}35`,
          fontFamily: 'Syne, sans-serif',
        }}
      >
        {label}
      </div>
    </div>
  )
}
