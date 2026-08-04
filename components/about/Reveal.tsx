'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  delay?: number;
};

/** Lightweight, reusable viewport animation for About sections. */
export default function Reveal({ children, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
