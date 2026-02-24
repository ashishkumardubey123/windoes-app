// Props: { size?, opacity? }
export function WindowsLogo({ size = 20, opacity = 0.7 }) {
  const s = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="0"      y="0"      width={s - 0.5} height={s - 0.5} fill={`rgba(255,255,255,${opacity})`} />
      <rect x={s + 0.5} y="0"      width={s - 0.5} height={s - 0.5} fill={`rgba(255,255,255,${opacity})`} />
      <rect x="0"      y={s + 0.5} width={s - 0.5} height={s - 0.5} fill={`rgba(255,255,255,${opacity})`} />
      <rect x={s + 0.5} y={s + 0.5} width={s - 0.5} height={s - 0.5} fill={`rgba(255,255,255,${opacity})`} />
    </svg>
  );
}