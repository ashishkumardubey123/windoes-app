import { motion, AnimatePresence } from "framer-motion";

const dotColor = {
  loading:  "#0078d4",
  scanning: "#0078d4",
  success:  "#00cc88",
  error:    "#ff4757",
};

const textColor = {
  loading:  "rgba(255,255,255,0.45)",
  scanning: "rgba(255,255,255,0.92)",
  success:  "#00cc88",
  error:    "#ff4757",
};

// Props: { status, message }
export function StatusMessage({ status, message }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: 0.25 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px",
          borderRadius: 100,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Pulsing dot */}
        <motion.div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: dotColor[status] ?? "#0078d4",
            flexShrink: 0,
          }}
          animate={
            status === "scanning"
              ? { opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }
              : { opacity: 1, scale: 1 }
          }
          transition={{
            duration: 1.4,
            repeat: status === "scanning" ? Infinity : 0,
          }}
        />

        {/* Message text */}
        <span
          style={{
            fontSize: 13,
            color: textColor[status] ?? "rgba(255,255,255,0.92)",
            letterSpacing: "0.03em",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        >
          {message}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}