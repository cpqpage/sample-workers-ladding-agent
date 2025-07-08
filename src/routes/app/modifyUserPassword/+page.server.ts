import { fail, type Actions } from "@sveltejs/kit";
import { generatePassword } from "$lib/server/utils/password";
import { UserDao } from "$lib/server/dao/UserDao";

export const actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const oldPassword = formData.get('oldPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (!oldPassword || !newPassword || !confirmPassword) {
            return fail(400, { error: "layout.passwordChangeError.emptyFields" });
        }

        if (newPassword !== confirmPassword) {
            return fail(400, { error: "layout.passwordChangeError.passwordMismatch" });
        }
        
        const secretOldPassword = generatePassword(oldPassword as string);
        if(secretOldPassword !== locals.user.password){
            return fail(400, { error: "layout.passwordChangeError.invalidOldPassword" });
        }

        const secretPassword = generatePassword(newPassword as string);
        if(secretPassword === locals.user.password){
            return fail(400, { error: "layout.passwordChangeError.samePassword" });
        }
        
        const userDao = new UserDao();
        await userDao.updatePassword(locals.user.id, secretPassword);
        
        return { success: true };
    }
} satisfies Actions;