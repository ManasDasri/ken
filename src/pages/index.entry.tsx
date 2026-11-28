import { boot } from '@/boot';
import Page from './Home';

boot(Page, () => import('@/legacy/main.js'));
