"use client";

import { motion } from "framer-motion";

/** Soft animated glow blobs + grid fade, used behind hero-style sections. */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]"
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-24 -left-28 h-72 w-72 rounded-full bg-chart-2/20 blur-[100px]"
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-chart-3/15 blur-[100px]"
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="bg-grid-fade absolute inset-0" />
    </div>
  );
}
