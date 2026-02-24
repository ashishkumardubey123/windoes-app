import { motion, AnimatePresence } from "framer-motion";

const DOTS = [
  // Left eye
  {x:85,y:95},{x:95,y:90},{x:107,y:90},{x:118,y:95},{x:107,y:100},{x:95,y:100},
  // Right eye
  {x:138,y:95},{x:148,y:90},{x:160,y:90},{x:171,y:95},{x:160,y:100},{x:148,y:100},
  // Nose
  {x:128,y:115},{x:128,y:125},{x:128,y:135},{x:118,y:143},{x:128,y:147},{x:138,y:143},
  // Mouth
  {x:108,y:162},{x:118,y:157},{x:128,y:155},{x:138,y:157},{x:148,y:162},
  {x:138,y:170},{x:128,y:173},{x:118,y:170},
  // Jaw
  {x:72,y:110},{x:68,y:128},{x:70,y:150},{x:80,y:168},{x:100,y:182},
  {x:128,y:188},{x:156,y:182},{x:176,y:168},{x:186,y:150},{x:188,y:128},{x:184,y:110},
];

const LINES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,0],         // left eye
  [6,7],[7,8],[8,9],[9,10],[10,11],[11,6],      // right eye
  [24,25],[25,26],[26,27],[27,28],[28,29],       // jaw
  [29,30],[30,31],[31,32],[32,33],[33,34],
  [18,19],[19,20],[20,21],[21,22],[22,23],[23,17], // mouth
];

// Props: { status }
export function FaceOverlay({ status }) {
  const visible = status === "scanning" || status === "success";
  const col = status === "success" ? "0,200,140" : "0,140,255";

  return (
    <AnimatePresence>
      {visible && (
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 256 256"
          preserveAspectRatio="xMidYMid meet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Connection lines */}
          {LINES.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={DOTS[a].x} y1={DOTS[a].y}
              x2={DOTS[b].x} y2={DOTS[b].y}
              stroke={`rgba(${col},0.28)`}
              strokeWidth="0.7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.012, duration: 0.3 }}
            />
          ))}

          {/* Landmark dots */}
          {DOTS.map((pt, i) => (
            <motion.circle
              key={i}
              cx={pt.x} cy={pt.y} r="1.5"
              fill={`rgba(${col},0.95)`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 1],
                opacity: [0, 1, status === "scanning" ? 0.7 : 1],
              }}
              transition={{ delay: i * 0.016, duration: 0.35, times: [0, 0.6, 1] }}
            />
          ))}

          {/* Horizontal scan line */}
          {status === "scanning" && (
            <motion.line
              x1="60" x2="196" y1="0" y2="0"
              stroke={`rgba(${col},0.55)`}
              strokeWidth="0.9"
              animate={{ y1: [80, 200, 80], y2: [80, 200, 80] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}