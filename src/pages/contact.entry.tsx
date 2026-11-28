import { boot } from '@/boot';
import Page from './Contact';

boot(Page, () => import('@/legacy/common.js'));
