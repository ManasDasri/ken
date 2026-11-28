// RetroPixelButton from ShitUI (formerly RareUI), https://shitui.in, MIT + Commons Clause + Attribution
// (see README). Changed here: it renders a link, takes the site's colours and type, and fits wider labels.
import { useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  pixelColor?: string; // the sliding block
}

export default function RetroPixelButton({ children, className, pixelColor = 'var(--brass)', ...props }: Props) {
  const [hover, setHover] = useState(false);
  const on = () => setHover(true), off = () => setHover(false);
  return (
    <motion.a
      className={cn(
        'group relative inline-flex h-12 min-w-44 cursor-pointer items-center overflow-hidden rounded-[10px] border-[1.5px] border-[var(--ink)] bg-[var(--card)] px-6 text-[13px] font-medium tracking-[0.06em] text-[var(--ink)] uppercase shadow-[0_3px_0_var(--ink)] font-[family-name:var(--mono)]',
        className,
      )}
      whileTap={{ scale: 0.97, y: 2 }}
      onMouseEnter={on} onMouseLeave={off} onFocus={on} onBlur={off}
      onTouchStart={on} onTouchEnd={off} onTouchCancel={off}
      {...(props as object)}
    >
      {/* the block that slides across */}
      <motion.span
        className="absolute top-1 bottom-1 left-1 z-10 flex items-center justify-center overflow-hidden rounded-[6px]"
        style={{ backgroundColor: pixelColor }}
        animate={{ width: hover ? 'calc(100% - 8px)' : '40px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <span className="absolute right-0 flex h-full w-10 items-center justify-center">
          <motion.svg
            animate={{ rotate: hover ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            width="26" height="26" viewBox="0 0 16 34" fill="currentColor" className="text-white" aria-hidden="true"
          >
            <rect x="7" y="6" width="5" height="5" />
            <rect x="11" y="10" width="5" height="5" />
            <rect x="15" y="14" width="5" height="5" />
            <rect x="11" y="18" width="5" height="5" />
            <rect x="7" y="22" width="5" height="5" />
          </motion.svg>
        </span>
      </motion.span>
      {/* the label, which hops over to make room */}
      <motion.span
        className="relative z-20 w-full text-center whitespace-nowrap"
        initial={false}
        animate={{
          paddingLeft: hover ? 0 : 40,
          paddingRight: hover ? 40 : 0,
          color: hover ? '#ffffff' : 'var(--ink)',
          filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'],
        }}
        transition={{ paddingLeft: { duration: 0.4 }, paddingRight: { duration: 0.4 }, color: { duration: 0.2 }, filter: { duration: 0.3, times: [0, 0.5, 1] } }}
      >
        {children}
      </motion.span>
    </motion.a>
  );
}
