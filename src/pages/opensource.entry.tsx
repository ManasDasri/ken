import { boot } from '@/boot';
import Page from './OpenSource';

boot(Page, () => import('@/legacy/oss.js'));
