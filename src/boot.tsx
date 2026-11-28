import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

// Each tab is its own HTML page with its own React root.
export function boot(Page: ComponentType) {
  createRoot(document.getElementById('root')!).render(<Page />);
}
