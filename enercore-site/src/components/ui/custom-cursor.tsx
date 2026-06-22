"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  const x = useSpring(rawX, { stiffness: 2000, damping: 120 });
  const y = useSpring(rawY, { stiffness: 2000, damping: 120 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setIsDesktop(true);

    const onMove = (e: MouseEvent) => { rawX.set(e.clientX); rawY.set(e.clientY); };
    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest("a, button, [data-cursor]")) setHovering(true);
    };
    const onOut  = (e: MouseEvent) => {
      if ((e.target as Element)?.closest("a, button, [data-cursor]")) setHovering(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    document.addEventListener("mouseover",  onOver);
    document.addEventListener("mouseout",   onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseout",   onOut);
    };
  }, [rawX, rawY]);

  if (!isDesktop) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] select-none"
      style={{ x, y }}
      animate={{ scale: clicking ? 0.82 : hovering ? 1.25 : 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
      >
        {/* Arrow pointer: dark fill + bright outline = visible on any background */}
        <path
          d="M5 3 L19 11.5 L12.2 12.6 L9.6 19 Z"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Click rays — pop in while clicking */}
        <motion.g
          stroke="#000000"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{ opacity: clicking ? 1 : 0, scale: clicking ? 1 : 0.6 }}
          transition={{ duration: 0.12 }}
          style={{ transformOrigin: "16px 8px" }}
        >
          <line x1="20.5" y1="3.5" x2="22.5" y2="1.5" />
          <line x1="22.5" y1="8" x2="20" y2="8" />
          <line x1="20.5" y1="12.5" x2="22.5" y2="14.5" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
