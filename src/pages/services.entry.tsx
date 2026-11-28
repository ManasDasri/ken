import { boot } from '@/boot';
import Page from './Services';

boot(Page, () => import('@/legacy/common.js'));
