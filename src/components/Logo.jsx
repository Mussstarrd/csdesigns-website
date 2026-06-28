export default function Logo({ size = 28, glow = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={glow ? { filter: "drop-shadow(0 0 6px rgba(0, 240, 255, 0.7))" } : undefined}
    >
      <path
        d="M16 2 L30 12 L16 30 L2 12 Z"
        stroke="#00f0ff"
        strokeWidth="1.5"
        fill="rgba(0, 240, 255, 0.08)"
      />
      <path
        d="M16 2 L16 30 M2 12 L30 12 M9 7 L23 7"
        stroke="#00f0ff"
        strokeWidth="0.8"
        opacity="0.6"
      />
    </svg>
  );
}
