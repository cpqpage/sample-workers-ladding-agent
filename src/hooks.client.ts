// import { TokenManager } from '$lib/client/utils/token';
// import { sequence } from '@sveltejs/kit/hooks';
// import type { Handle } from '@sveltejs/kit';

// // 添加 token 的中间件,没有作用
// const addTokens: Handle = async ({ event, resolve }) => {
//     const token = TokenManager.getToken();
//     const refreshToken = TokenManager.getRefreshToken();

//     if (token) {
//         event.request.headers.set('Authorization', `Bearer ${token}`);
//         if (refreshToken) {
//             event.request.headers.set('X-Refresh-Token', refreshToken);
//         }
//     }

//     return resolve(event);
// };

// // 为 fetch 请求添加拦截器
// const originalFetch = window.fetch;
// window.fetch = function(url, options = {}) {
//     const token = TokenManager.getToken();
//     const refreshToken = TokenManager.getRefreshToken();
    
//     if (token) {
//         const headers = new Headers(options.headers || {});
//         headers.set('Authorization', `Bearer ${token}`);
//         if (refreshToken) {
//             headers.set('X-Refresh-Token', refreshToken);
//         }
//         return originalFetch(url, { ...options, headers });
//     }
    
//     return originalFetch(url, options);
// };

// // 为 XMLHttpRequest 添加拦截器
// const originalXHROpen = XMLHttpRequest.prototype.open;
// const originalXHRSend = XMLHttpRequest.prototype.send;

// XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
//     return originalXHROpen.call(this, method, url, async ?? true, username, password);
// };

// XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
//     const token = TokenManager.getToken();
//     const refreshToken = TokenManager.getRefreshToken();
    
//     if (token) {
//         this.setRequestHeader('Authorization', `Bearer ${token}`);
//         if (refreshToken) {
//             this.setRequestHeader('X-Refresh-Token', refreshToken);
//         }
//     }
//     return originalXHRSend.call(this, body);
// };

// // 为 FormData 提交添加拦截器
// HTMLFormElement.prototype.submit = function() {
//     const token = TokenManager.getToken();
//     const refreshToken = TokenManager.getRefreshToken();
    
//     // eslint-disable-next-line @typescript-eslint/no-this-alias
//     const form = this;
//     const formData = new FormData(form);
    
//     fetch(form.action, {
//         method: form.method,
//         body: formData,
//         headers: {
//             ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//             ...(refreshToken ? { 'X-Refresh-Token': refreshToken } : {})
//         }
//     }).then(response => {
//         if (response.ok) {
//             window.location.href = response.url;
//         }
//     });
    
//     return false;
// };

// // 导出组合后的 handle 函数
// export const handle = sequence(addTokens);
