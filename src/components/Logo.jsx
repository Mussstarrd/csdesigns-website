export default function Logo({ size = 36 }) {
  return (
    <img
      src="/assets/diamond.svg"
      alt="CSDesigns diamond"
      width={size}
      height={size}
      style={{ filter: "drop-shadow(0 0 6px rgba(125, 211, 252, 0.7))" }}
    />
  );
}
