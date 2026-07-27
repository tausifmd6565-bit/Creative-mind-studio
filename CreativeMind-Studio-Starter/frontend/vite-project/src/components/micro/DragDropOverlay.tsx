/**
 * DragDropOverlay.tsx
 *
 * Semi-transparent overlay shown when the user is dragging a file into the
 * application window (native OS drag). A pulsing border + icon communicates
 * the drop target affordance.
 *
 * Usage: mount once inside MainLayout. It listens for window dragenter/dragleave/drop.
 *
 * Respects prefers-reduced-motion.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Upload } from 'lucide-react';

// ─── Component ────────────────────────────────────────────────────────────────

interface DragDropOverlayProps {
  /** Called when files are dropped (passes the FileList) */
  onDrop?: (files: FileList) => void;
  /** Label shown in the overlay */
  label?: string;
  /** Sublabel */
  sublabel?: string;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({
  onDrop,
  label = 'Drop files here',
  sublabel = 'Images, videos, audio, documents',
}) => {
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = useState(false);
  const counterRef = React.useRef(0); // tracks nested dragenter events

  const handleDragEnter = useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    counterRef.current += 1;
    if (counterRef.current === 1) setActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    counterRef.current -= 1;
    if (counterRef.current <= 0) {
      counterRef.current = 0;
      setActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    counterRef.current = 0;
    setActive(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) onDrop?.(files);
  }, [onDrop]);

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
          className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
          aria-live="assertive"
          aria-label="Drop zone active"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#07070A]/80 backdrop-blur-sm" />

          {/* Drop card */}
          <motion.div
            initial={{ scale: reduced ? 1 : 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduced ? 1 : 0.96, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-4 px-12 py-10 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(139,92,246,0.06))',
              border: '2px dashed rgba(139,92,246,0.55)',
            }}
          >
            {/* Animated pulse ring */}
            {!reduced && (
              <motion.span
                className="absolute inset-0 rounded-3xl border-2 border-[#8B5CF6]/30"
                animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Icon */}
            <motion.div
              animate={reduced ? {} : { y: [-4, 0, -4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-[#7C3AED]/15 border border-[#8B5CF6]/30
                flex items-center justify-center"
            >
              <Upload className="w-7 h-7 text-[#9D6CFF]" />
            </motion.div>

            {/* Text */}
            <div className="text-center">
              <p className="text-[16px] font-display font-semibold text-slate-100">{label}</p>
              <p className="text-[12px] font-mono text-slate-500 mt-1">{sublabel}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
