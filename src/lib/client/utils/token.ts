import { PUBLIC_TOKEN_KEY, PUBLIC_REFRESH_TOKEN_KEY } from '$env/static/public';
// 客户端token管理,使用localStorage存储,不好用,改用cookie存储，
// 暂时保留，方便以后使用
// @deprecated
export const TokenManager = {
    setToken(token: string): void {
        localStorage.setItem(PUBLIC_TOKEN_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(PUBLIC_TOKEN_KEY);
    },

    setRefreshToken(token: string): void {
        localStorage.setItem(PUBLIC_REFRESH_TOKEN_KEY, token);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(PUBLIC_REFRESH_TOKEN_KEY);
    },

    removeTokens(): void {
        localStorage.removeItem(PUBLIC_TOKEN_KEY);
        localStorage.removeItem(PUBLIC_REFRESH_TOKEN_KEY);
    },

    hasToken(): boolean {
        return !!this.getToken();
    }
}; 