import '../lib/i18n'; 
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    const lang = url.searchParams.get('lang') || 'zh';
    return { lang };
};