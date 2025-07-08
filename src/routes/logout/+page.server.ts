import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { revokeToken } from '$lib/server/utils/jwt';

export const load: PageServerLoad = async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
        // 将当前 token 加入黑名单
        await revokeToken(token);
    }
    
    // 重定向到登录页
    throw redirect(303, '/login');
}; 