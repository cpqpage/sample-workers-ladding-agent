import { redirect, type Actions } from '@sveltejs/kit';
import { generateToken, generateRefreshToken } from '$lib/server/utils/jwt';
import { generatePassword } from '$lib/server/utils/password';
import { UserDao } from '$lib/server/dao/UserDao';
import { RoleDao } from '$lib/server/dao/RoleDao';
import { OutletDao } from '$lib/server/dao/OutletDao';
import { UserLogDao } from '$lib/server/dao/UserLogDao';
import { User, UserLog } from '$model/schema';
import { ServerTokenManager } from '$lib/server/utils/token';

export const actions = {
	default: async ({request, cookies}) => {
		
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		
		if(email.length == 0 || password.length == 0){
            return {
				error: 'login.error.emptyFields'
			};
        }

		let user: typeof User.$inferSelect | null = null;
		try{
			const userDao = new UserDao();
			user = await userDao.findByEmail(email);
		}catch(e){
			console.error(e);
			throw redirect(500, '/error');
		}

		if(user == null){
			return {
				error: 'login.error.userNotFound'
			};
		}
		
		const inputPassword = await generatePassword(password);
		if(inputPassword != user.password){
			return {
				error: 'login.error.invalidPassword'
			};
		}
		const roleDao = new RoleDao();
		const userRole = await roleDao.findByUserId(user.id);
		if(userRole){
			const role = userRole.role;
			if(role == null || (role.name !== 'ROLE_AGENT' && role.name !== 'ROLE_PLATFORMADMIN')){
				return {
					error: 'login.error.invalidRole'
				};
			}
		}
		const outletDao = new OutletDao();
		const outlet = await outletDao.findById(user.outletId || 0);
		if(outlet == null){
			//创建用户时会创建门店，必定存在
			return {
				error: 'login.error.outletNotFound'
			};
		}

		const tokenPayload = {
			email: user.email,
			id: user.id,
			password: user.password
		};

		// 记录登录日志
		const userLogDao = new UserLogDao();
		await userLogDao.createUserLog(user);

		const token = generateToken(tokenPayload);
		const refreshToken = generateRefreshToken(tokenPayload);
		ServerTokenManager.setToken(cookies, token);
		ServerTokenManager.setRefreshToken(cookies, refreshToken);

		throw redirect(303, '/app/dashboard');
	}
} satisfies Actions;