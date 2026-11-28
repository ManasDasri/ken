import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';

export type PeekItem = { img: string; title: string; meta: string };

// A card that floats beside the cursor while a row is hovered: the project's page, its name and
// its number. It trails the pointer on a spring and leans into the direction it's moving.
export function usePeek() {
  const [item, setItem] = useState<PeekItem | null>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 26 }), sy = useSpring(y, { stiffness: 260, damping: 26 });
  const vx = useMotionValue(0);
  const tilt = useSpring(useTransform(vx, [-40, 40], [-9, 5]), { stiffness: 200, damping: 20 });
  const last = useRef(0);
  const fine = useRef(matchMedia('(hover: hover) and (pointer: fine)').matches);
  useEffect(() => {
    const move = (e: PointerEvent) => { vx.set(e.clientX - last.current); last.current = e.clientX; x.set(e.clientX + 28); y.set(e.clientY - 150); };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, [x, y, vx]);
  const bind = (p: PeekItem) => fine.current ? { onPointerEnter: () => setItem(p), onPointerLeave: () => setItem(null) } : {};
  const card = (
    <AnimatePresence>
      {item && (
        <motion.div className="peek" style={{ left: sx, top: sy, rotate: tilt }} aria-hidden="true"
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.18 }}>
          <img src={item.img} alt="" />
          <span><b>{item.title}</b><em>{item.meta}</em></span>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { bind, card };
}
