import { useEffect, useState } from 'react';
import { githubPRs } from '@/data/github.js';

export type PR = { repo: string; title: string; url: string; n: number; merged: string | null; open: boolean; updated: string };
export type Day = { date: string; count: number; level: number };

// my pull requests to other people's projects, live (shared and cached by github.js)
export function usePRs() {
  const [state, set] = useState<{ items: PR[] | null; failed: boolean }>({ items: null, failed: false });
  useEffect(() => {
    githubPRs().then((items: PR[]) => set({ items, failed: false })).catch(() => set({ items: null, failed: true }));
  }, []);
  return state;
}

// the last year of contributions, one entry per day, cached for the visit
let days: Promise<Day[]> | null = null;
export const contributions = () => (days ??= fetch('https://github-contributions-api.jogruber.de/v4/ManasDasri?y=last')
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((j) => j.contributions as Day[]));

export function useContributions() {
  const [d, set] = useState<Day[] | null>(null);
  useEffect(() => { contributions().then(set).catch(() => set([])); }, []);
  return d;
}

export const merged = (items: PR[]) => items.filter((p) => p.merged).sort((a, b) => Date.parse(b.merged!) - Date.parse(a.merged!));
export const safeUrl = (u: string) => (/^https:\/\/github\.com\//.test(u) ? u : 'https://github.com/ManasDasri');
