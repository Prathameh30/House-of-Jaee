// src/components/common/PlaceholderImage.jsx
// Generates a stylized, deterministic SVG "saree drape" illustration as a stand-in
// for real product photography. Colour and pattern vary by a seed string (e.g. product slug)
// so the same product always gets the same placeholder, and different products look distinct.

const PALETTES = [
  { base: '#7A1F2B', accent: '#C9A961', light: '#F3E4C8' }, // maroon + gold
  { base: '#3D2B1F', accent: '#C9A961', light: '#EFE6D8' }, // dark brown + gold
  { base: '#C9A961', accent: '#7A1F2B', light: '#FAF6EF' }, // gold + maroon
  { base: '#9C3B4A', accent: '#E0C896', light: '#FAF1E6' }, // rose maroon
  { base: '#5C1620', accent: '#D9C8A8', light: '#F4ECDD' }, // deep maroon
  { base: '#8A6D3B', accent: '#FAF6EF', light: '#EFE2C3' }, // antique gold
];

function seedToIndex(seed, mod) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export default function PlaceholderImage({ seed = 'saree', className = '', label }) {
  const palette = PALETTES[seedToIndex(seed, PALETTES.length)];
  const patternVariant = seedToIndex(seed + 'p', 3);

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role="img"
      aria-label={label || 'Saree illustration placeholder'}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="500" fill={palette.light} />

      {/* Draped fabric silhouette — soft curved bands suggesting saree pleats */}
      <path
        d="M0,180 C80,140 140,220 200,180 C260,140 320,220 400,180 L400,500 L0,500 Z"
        fill={palette.base}
        opacity="0.92"
      />
      <path
        d="M0,230 C90,195 150,260 200,225 C250,195 310,260 400,230 L400,500 L0,500 Z"
        fill={palette.base}
        opacity="0.75"
      />

      {/* Zari border motif — repeating diamond strip evoking a woven saree border */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect
          key={i}
          x={20 + i * 42}
          y="455"
          width="14"
          height="14"
          fill={palette.accent}
          transform={`rotate(45 ${27 + i * 42} 462)`}
        />
      ))}
      <rect x="0" y="440" width="400" height="3" fill={palette.accent} />
      <rect x="0" y="478" width="400" height="3" fill={palette.accent} />

      {/* Pattern variants suggesting different weaves */}
      {patternVariant === 0 &&
        Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={40 + col * 80}
              cy={260 + row * 30}
              r="3"
              fill={palette.accent}
              opacity="0.5"
            />
          ))
        )}
      {patternVariant === 1 &&
        Array.from({ length: 5 }).map((_, i) => (
          <path
            key={i}
            d={`M${30 + i * 80},480 Q${50 + i * 80},420 ${30 + i * 80},360`}
            stroke={palette.accent}
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        ))}
      {patternVariant === 2 &&
        Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={i * 50}
            y="300"
            width="50"
            height="2"
            fill={palette.accent}
            opacity={i % 2 === 0 ? 0.35 : 0.15}
          />
        ))}

      {/* Decorative top medallion */}
      <circle cx="200" cy="90" r="42" fill="none" stroke={palette.base} strokeWidth="2" opacity="0.5" />
      <circle cx="200" cy="90" r="30" fill="none" stroke={palette.accent} strokeWidth="1.5" opacity="0.6" />
      <text
        x="200"
        y="98"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="22"
        fill={palette.base}
        opacity="0.7"
      >
        HJ
      </text>
    </svg>
  );
}
