import { boot } from '@/boot';
import Page from './Project';

boot(Page, () => import('@/legacy/common.js'));
