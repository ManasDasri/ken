import { boot } from '@/boot';
import Page from './About';

boot(Page, () => import('@/legacy/about.js'));
