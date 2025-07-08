import type { Cookies } from '@sveltejs/kit';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRE_TIME, TOKEN_EXPIRE_TIME_REFRESH } from '$env/static/private';

export const ServerTokenManager = {
    setToken(cookies: Cookies, token: string): void {
        cookies.set(TOKEN_KEY, token, {
            path: '/app',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + Number(TOKEN_EXPIRE_TIME)) // 1天
        });
    },

    getToken(cookies: Cookies): string | null {
        return cookies.get(TOKEN_KEY) ?? null;
    },

    setRefreshToken(cookies: Cookies, token: string): void {
        cookies.set(REFRESH_TOKEN_KEY, token, {
            path: '/app',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + Number(TOKEN_EXPIRE_TIME_REFRESH)) // 7天
        });
    },

    getRefreshToken(cookies: Cookies): string | null {
        return cookies.get(REFRESH_TOKEN_KEY) ?? null;
    },

    removeTokens(cookies: Cookies): void {
        cookies.delete(TOKEN_KEY, { path: '/app' });
        cookies.delete(REFRESH_TOKEN_KEY, { path: '/app' });
    },

    hasToken(cookies: Cookies): boolean {
        return !!this.getToken(cookies);
    }
}; 