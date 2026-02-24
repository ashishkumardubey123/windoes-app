import { motion } from "framer-motion";

const C = {
  blue:  "#0078d4",
  green: "#00cc88",
  red:   "#ff4757",
};

// Props: { status }
export function ScanRing({ status }) {
  const color =
    status === "success" ? C.green :
    status === "error"   ? C.red   : C.blue;

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" fill="none">
      {/* Static base ring */}
      <circle cx="160" cy="160" r="155" stroke={color} strokeWidth="1.2" opacity="0.18" />

      {/* Tick marks */}
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i * 7.5 * Math.PI) / 180;
        const r1 = 155, r2 = i % 4 === 0 ? 147 : 151;
        return (
          <line
            key={i}
            x1={160 + r1 * Math.cos(a)} y1={160 + r1 * Math.sin(a)}
            x2={160 + r2 * Math.cos(a)} y2={160 + r2 * Math.sin(a)}
            stroke={color}
            strokeWidth={i % 4 === 0 ? "1.5" : "0.7"}
            opacity={i % 4 === 0 ? "0.5" : "0.2"}
          />
        );
      })}

      {/* Scanning arcs */}
      {status === "scanning" && (
        <>
          <motion.circle
            cx="160" cy="160" r="155"
            stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="60 914"
            animate={{ strokeDashoffset: [0, -974] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx="160" cy="160" r="155"
            stroke="rgba(0,180,255,0.35)" strokeWidth="1" strokeLinecap="round"
            strokeDasharray="25 949"
            animate={{ strokeDashoffset: [0, 974] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Success ring */}
      {status === "success" && (
        <motion.circle
          cx="160" cy="160" r="155"
          stroke={C.green} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="974"
          initial={{ strokeDashoffset: 974 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Error ring */}
      {status === "error" && (
        <motion.circle
          cx="160" cy="160" r="155"
          stroke={C.red} strokeWidth="2" strokeLinecap="round"
          strokeDasharray="974"
          initial={{ strokeDashoffset: 974 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Loading spinner */}
      {status === "loading" && (
        <motion.circle
          cx="160" cy="160" r="155"
          stroke="rgba(100,140,255,0.6)" strokeWidth="2" strokeLinecap="round"
          strokeDasharray="80 894"
          animate={{ rotate: 360 }}
          style={{ originX: "160px", originY: "160px" }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}