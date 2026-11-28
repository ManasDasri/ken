import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import '@/tailwind.css';
import '@/site.css';

// Render the page once, synchronously, then run its page script against the finished DOM.
// Each tab is its own HTML page, so this runs once per load.
export function boot(Page: ComponentType, script: () => Promise<unknown>) {
  const root = createRoot(document.getElementById('root')!);
  flushSync(() => root.render(<Page />));
  script().then(() => import('@/legacy/motion.js'));
}
