"use client";

import { motion } from "framer-motion";

interface FlowConnectorProps {
  index: number;
  direction?: "right" | "down";
}

export function FlowConnector({ index, direction = "right" }: FlowConnectorProps) {
  if (direction === "down") {
    return (
      <div className="flex justify-center py-1">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.12 + 0.06, duration: 0.3 }}
          style={{ transformOrigin: "top" }}
          className="h-6 w-0.5 bg-accent/30"
        />
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center justify-center px-1">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.12 + 0.06, duration: 0.3 }}
        style={{ transformOrigin: "left" }}
        className="h-0.5 w-6 bg-accent/30"
      />
    </div>
  );
}
