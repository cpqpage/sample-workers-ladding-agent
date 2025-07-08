import { redirect, type Handle } from "@sveltejs/kit";
import { verifyToken, verifyRefreshToken, generateTokenByPayload } from "$lib/server/utils/jwt";
import { ServerTokenManager } from "$lib/server/utils/token";
import { UserService } from "$lib/server/service/userService";
import { OutletService } from "$lib/server/service/outletService";
import { RoleService } from "$lib/server/service/roleService";
import { RoleResourceService } from "$lib/server/service/roleResourceService";
import type { Env } from "$lib/server/model";
import { drizzle } from 'drizzle-orm/d1';
import { BaseDao } from "$lib/server/dao/BaseDao";

interface TokenPayload {
    email: string;
    id: number;
    password: string;
}

export const handle: Handle = async ({ event, resolve }) => {
    const env = event.platform?.env as Env;
    BaseDao.d1 = drizzle(env.DB);
    
    if(event.url.pathname.startsWith('/app')){
        // 获取 token 和 refreshToken
        const token = ServerTokenManager.getToken(event.cookies);
        const refreshToken = ServerTokenManager.getRefreshToken(event.cookies);

        let payload: object | string = "error";
        if (token) {
            payload = await verifyToken(token);
        }

        // 如果访问令牌无效或过期，尝试使用刷新令牌
        if (payload === "error" || payload === "blacklisted") {
            if (refreshToken) {
                const refreshPayload = await verifyRefreshToken(refreshToken);
                if (typeof refreshPayload !== 'string' && 'email' in refreshPayload && 'password' in refreshPayload) {
                    // 生成新的访问令牌
                    const newToken = generateTokenByPayload(refreshPayload);
                    event.setHeaders({
                        'Authorization': `Bearer ${newToken}`
                    });
                    payload = refreshPayload;
                } else {
                    // 刷新令牌也无效，重定向到登录页
                    throw redirect(303, '/login');
                }
            } else {
                throw redirect(303, '/login');
            }
        }

        // 从 token 中恢复用户信息
        if (typeof payload !== 'string' && 'email' in payload && 'password' in payload) {
            try {
                const user = await UserService.findByEmail((payload as TokenPayload).email);
                
                if (user && user.password === (payload as TokenPayload).password) {
                    
                    const outlet = await OutletService.findById(user.outletId??0);
                    const userRole = await RoleService.findByUserId(user.id);
                    const checkAccess = await RoleResourceService.checkAccess(userRole?.name || "", event.url.pathname);
                    
                    if (!checkAccess) {
                        // 没有访问权限，重定向到错误页面或登录页
                        throw redirect(303, '/error?message=accessDenied');
                    }
                    
                    if (outlet) {
                        event.locals.user = user;
                        event.locals.outlet = outlet;
                    }
                }
            } catch (error) {
                if(!(error instanceof Error)) {
                    console.error(error);
                    throw error;
                }
                // 处理错误，例如记录日志或显示错误消息
                console.error('Error restoring user session:', error);
                throw redirect(303, `/error?message=${encodeURIComponent(error instanceof Error ? error.message : '发生不明错误')}`);
            }
        }
    }

    return resolve(event, {
        /**
         * There´s an issue with `filterSerializedResponseHeaders` not working when using `sequence`
         *
         * https://github.com/sveltejs/kit/issues/8061
         */
        filterSerializedResponseHeaders(name) {
          return name === 'content-range';
        }
    });
};