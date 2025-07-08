import { init, register } from 'svelte-i18n';
import { LOCALES } from '$lib/constants';
import { PUBLIC_DEFAULT_LOCALE } from '$env/static/public';

export const initI18n = () => {    
    LOCALES.forEach(locale => {
      register(locale, () => import(`$lib/i18n/locales/${locale}.json`));
    });
    
    init({
      fallbackLocale: PUBLIC_DEFAULT_LOCALE,
      initialLocale: PUBLIC_DEFAULT_LOCALE,
    }); 
}

