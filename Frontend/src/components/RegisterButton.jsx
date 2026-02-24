import { motion, AnimatePresence } from "framer-motion";

// Props: { onClick, disabled, hasSavedFace, show, onCancel }
export function RegisterButton({ onClick, disabled, hasSavedFace, show, onCancel }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            style={{
              padding: "12px 36px",
              borderRadius: 4,
              border: `1px solid ${hasSavedFace ? "rgba(255,255,255,0.12)" : "#0078d4"}`,
              background: hasSavedFace
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,120,212,0.85)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.05em",
              cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              backdropFilter: "blur(8px)",
              boxShadow: hasSavedFace
                ? "none"
                : "0 0 20px rgba(0,120,212,0.3)",
              opacity: disabled ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            {hasSavedFace ? "Update Face Data" : "Set up face recognition"}
          </motion.button>

          {/* Cancel — only show when toggled via Shift+L and face already exists */}
          {hasSavedFace && onCancel && (
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.28)",
                fontSize: 11,
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            >
              Cancel
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}