import { boot } from '@/boot';
import Page from './Work';

boot(Page, () => import('@/legacy/common.js'));
