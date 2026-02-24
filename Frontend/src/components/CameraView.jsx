import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { ScanRing } from "./Scanring";
import { FaceOverlay } from "./Faceoverlay";

const BLUE = "#0078d4";
const GREEN = "#00cc88";

// Corner bracket positions
const CORNERS = ["tl", "tr", "bl", "br"];

// Props: { status, modelsLoaded, onCameraReady, webcamRef }
export function CameraView({ status, modelsLoaded, onCameraReady, webcamRef }) {
  const glow =
    status === "success" ? "rgba(0,200,140,0.22)" :
    status === "error"   ? "rgba(255,71,87,0.18)"  :
                           "rgba(0,120,212,0.20)";

  return (
    <div style={{ position: "relative", width: 320, height: 320 }}>
      {/* Ambient glow behind ring */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          filter: "blur(20px)",
          transition: "background 0.6s ease",
          pointerEvents: "none",
        }}
      />

      {/* Animated scan ring */}
      <ScanRing status={status} />

      {/* Camera circle */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#05080f",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "inset 0 0 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!modelsLoaded ? (
          /* Loading spinner */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{
                width: 32, height: 32,
                border: "2px solid rgba(0,120,212,0.2)",
                borderTopColor: BLUE,
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            >
              Loading AI
            </span>
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            width={600}
            height={600}
            mirrored={true}
            style={{ objectFit: "cover", width: "100%", height: "100%", opacity: 0.88 }}
            onUserMedia={onCameraReady}
          />
        )}

        {/* Face landmark overlay */}
        <FaceOverlay status={status} />

        {/* Corner brackets */}
        {CORNERS.map((c) => (
          <div
            key={c}
            style={{
              position: "absolute",
              top:    c.startsWith("t") ? 20 : "auto",
              bottom: c.startsWith("b") ? 20 : "auto",
              left:   c.endsWith("l")   ? 20 : "auto",
              right:  c.endsWith("r")   ? 20 : "auto",
              width: 28, height: 28,
              borderTop:    c.startsWith("t") ? `1.5px solid ${BLUE}55` : "none",
              borderBottom: c.startsWith("b") ? `1.5px solid ${BLUE}55` : "none",
              borderLeft:   c.endsWith("l")   ? `1.5px solid ${BLUE}55` : "none",
              borderRight:  c.endsWith("r")   ? `1.5px solid ${BLUE}55` : "none",
              borderRadius:
                c === "tl" ? "4px 0 0 0" :
                c === "tr" ? "0 4px 0 0" :
                c === "bl" ? "0 0 0 4px" : "0 0 4px 0",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Success overlay with animated checkmark */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,200,140,0.08)",
                backdropFilter: "blur(2px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                style={{ position: "relative" }}
              >
                <div
                  style={{
                    position: "absolute", inset: -20,
                    background: "rgba(0,200,140,0.15)",
                    borderRadius: "50%", filter: "blur(20px)",
                  }}
                />
                <svg
                  width="72" height="72" viewBox="0 0 72 72" fill="none"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <circle cx="36" cy="36" r="34" stroke={GREEN} strokeWidth="2" opacity="0.3" />
                  <motion.path
                    d="M22 37l10 10 18-20"
                    stroke={GREEN} strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ filter: `drop-shadow(0 0 8px ${GREEN})` }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}