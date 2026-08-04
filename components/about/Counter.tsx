'use client';

import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

type CounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  fractionDigits?: number;
};

export default function Counter({ value, suffix = '', prefix = '', fractionDigits = 0 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.65 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toLocaleString('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration: 1.7, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [count, isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}
