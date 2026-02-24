import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";

import { CameraView }     from "./components/Cameraview";
import { StatusMessage }  from "./components/Statusmessage";
import { RegisterButton } from "./components/Registerbutton";
import { WindowsLogo }    from "./components/WindowsLogo";

export default function App() {
  const webcamRef   = useRef(null);
  const intervalRef = useRef(null);

  const [modelsLoaded,    setModelsLoaded]    = useState(false);
  const [savedDescriptor, setSavedDescriptor] = useState(null);
  const [unlocked,        setUnlocked]        = useState(false);
  const [status,          setStatus]          = useState("loading");
  const [message,         setMessage]         = useState("Initializing...");
  const [showRegister,    setShowRegister]    = useState(false);
  const [now,             setNow]             = useState(new Date());

  // ── Live clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Load face-api models ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const sources = [
        "/models",
        "https://cdn.jsdelivr.net/gh/cgarbin/face-api.js-models/models",
      ];
      try {
        let ok = false;
        for (const src of sources) {
          try {
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(src),
              faceapi.nets.faceLandmark68Net.loadFromUri(src),
              faceapi.nets.faceRecognitionNet.loadFromUri(src),
            ]);
            ok = true;
            break;
          } catch { /* try next source */ }
        }
        if (!ok) throw new Error("All model sources failed");

        const saved = localStorage.getItem("faceData");
        if (saved) setSavedDescriptor(new Float32Array(JSON.parse(saved)));

        setModelsLoaded(true);
        setStatus(saved ? "scanning" : "error");
        setMessage(saved ? "Looking for you…" : "No face registered");
      } catch {
        setStatus("error");
        setMessage("Could not load AI models");
      }
    };
    load();
  }, []);

  // ── Electron: Shift+L → show register panel ────────────────────────────────
  useEffect(() => {
    if (!window.electronAPI?.onShiftL) return;
    const cleanup = window.electronAPI.onShiftL(() => setShowRegister(true));
    return cleanup;
  }, []);

  // ── Electron: lock state sync ───────────────────────────────────────────────
  useEffect(() => {
    if (!window.electronAPI?.onLockStateChange) return;
    const cleanup = window.electronAPI.onLockStateChange(({ locked }) => {
      if (locked) {
        setUnlocked(false);
        setStatus(savedDescriptor ? "scanning" : "error");
        setMessage(savedDescriptor ? "Looking for you…" : "No face registered");
      }
    });
    return cleanup;
  }, [savedDescriptor]);

  // ── Face detection loop ─────────────────────────────────────────────────────
  const detectAndMatch = useCallback(async () => {
    if (!savedDescriptor || unlocked || status === "success") return;
    if (!webcamRef.current?.video) return;
    try {
      const det = await faceapi
        .detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (det) {
        const dist = faceapi.euclideanDistance(savedDescriptor, det.descriptor);
        if (dist < 0.5) {
          setUnlocked(true);
          setStatus("success");
          setMessage("Welcome back!");
          if (window.electronAPI) window.electronAPI.unlock();
        }
      }
    } catch { /* ignore per-frame errors */ }
  }, [savedDescriptor, unlocked, status]);

  useEffect(() => {
    if (!modelsLoaded) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(detectAndMatch, 900);
    return () => clearInterval(intervalRef.current);
  }, [detectAndMatch, modelsLoaded]);

  const handleCameraReady = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(detectAndMatch, 900);
  }, [detectAndMatch]);

  // ── Register face ───────────────────────────────────────────────────────────
  const registerFace = async () => {
    if (!webcamRef.current?.video || !modelsLoaded) return;
    setStatus("scanning");
    setMessage("Scanning your face…");

    try {
      const det = await faceapi
        .detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (det) {
        const arr = Array.from(det.descriptor);
        localStorage.setItem("faceData", JSON.stringify(arr));
        setSavedDescriptor(new Float32Array(arr));
        setStatus("success");
        setMessage("Face registered!");
        setTimeout(() => {
          setStatus("scanning");
          setMessage("Looking for you…");
          setShowRegister(false);
        }, 2500);
      } else {
        setStatus("error");
        setMessage("No face detected. Try again.");
        setTimeout(() => {
          setStatus(savedDescriptor ? "scanning" : "error");
          setMessage(savedDescriptor ? "Looking for you…" : "No face registered");
        }, 2500);
      }
    } catch {
      setStatus("error");
      setMessage("Detection failed.");
    }
  };

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const registerVisible = showRegister || (!savedDescriptor && modelsLoaded && status !== "loading");

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden", userSelect: "none",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: "radial-gradient(ellipse 80% 80% at 50% 40%, #0a1628 0%, #060a12 55%, #030507 100%)",
      }}
    >
      {/* Background light pools */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%", width: "70%", height: "70%",
          background: "radial-gradient(ellipse, rgba(0,100,200,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%",
          background: "radial-gradient(ellipse, rgba(0,60,140,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      {/* Film grain */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.022,
      }} />

      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", pointerEvents: "none", zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WindowsLogo size={18} opacity={0.4} />
          <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase" }}>
            Windows Hello
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.22)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="7" width="16" height="10" rx="2" />
            <path d="M22 11v2" />
            <rect x="4" y="9" width="10" height="6" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Clock */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          textAlign: "center", paddingTop: "3.5rem",
          pointerEvents: "none", zIndex: 40,
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div style={{
          fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 200,
          color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em", lineHeight: 1,
          textShadow: "0 0 40px rgba(0,120,212,0.2)",
        }}>
          {timeStr}
        </div>
        <div style={{
          fontSize: 13, color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.12em", marginTop: 8, textTransform: "uppercase",
        }}>
          {dateStr}
        </div>
      </motion.div>

      {/* Auth panel */}
      <motion.div
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "2.5rem",
          zIndex: 10, marginTop: "8rem",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CameraView
          status={status}
          modelsLoaded={modelsLoaded}
          onCameraReady={handleCameraReady}
          webcamRef={webcamRef}
        />

        {/* User identity */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(0,120,212,0.15)", border: "1px solid rgba(0,120,212,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#0078d4", fontWeight: 300, marginBottom: 4,
          }}>
            U
          </div>
          <div style={{ fontSize: 20, fontWeight: 300, color: "rgba(255,255,255,0.92)", letterSpacing: "0.02em" }}>User</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Local Account
          </div>
        </div>

        <StatusMessage status={status} message={message} />

        <RegisterButton
          show={registerVisible}
          onClick={registerFace}
          disabled={!modelsLoaded}
          hasSavedFace={!!savedDescriptor}
          onCancel={showRegister ? () => setShowRegister(false) : null}
        />
      </motion.div>

      {/* Bottom bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 32px",
        background: "rgba(0,0,0,0.25)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 50, pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WindowsLogo size={14} opacity={0.25} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Biometric Authentication
          </span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
          {unlocked ? "✓ Session unlocked" : "Press Shift+L to register face"}
        </span>
      </div>
    </div>
  );
}