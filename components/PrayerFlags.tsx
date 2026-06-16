export default function PrayerFlags({ className = '' }: { className?: string }) {
  const flags = [
    { color: '#dc2626', label: 'red' },
    { color: '#2563eb', label: 'blue' },
    { color: '#ca8a04', label: 'yellow' },
    { color: '#f8fafc', label: 'white' },
    { color: '#16a34a', label: 'green' },
    { color: '#dc2626', label: 'red' },
    { color: '#2563eb', label: 'blue' },
    { color: '#ca8a04', label: 'yellow' },
    { color: '#f8fafc', label: 'white' },
    { color: '#16a34a', label: 'green' },
    { color: '#dc2626', label: 'red' },
    { color: '#2563eb', label: 'blue' },
  ];

  return (
    <div className={`relative w-full overflow-hidden ${className}`} aria-hidden>
      <svg
        viewBox="0 0 800 60"
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: 60 }}
      >
        {/* String */}
        <path
          d="M 0 15 Q 200 5 400 15 Q 600 25 800 15"
          fill="none"
          stroke="#92400e"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Flags */}
        {flags.map((flag, i) => {
          const spacing = 800 / (flags.length + 1);
          const x = spacing * (i + 1);
          const sagy = 15 + Math.sin((i / (flags.length - 1)) * Math.PI) * 10;
          return (
            <g key={i} transform={`translate(${x - 14}, ${sagy - 2})`}>
              <polygon
                points="0,0 28,0 14,32"
                fill={flag.color}
                opacity="0.85"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="0.5"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
