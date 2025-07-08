import { RoleDao } from "$dao/RoleDao";
import { Role,User,UserRole } from '$model/schema';

export const RoleService = {
    findByUserId: async (userId: number): Promise<typeof Role["$inferSelect"] | null> => {
        
        const roleDao = new RoleDao();
        const result = await roleDao.findByUserId(userId);
        if(result !== null){
            return result.role;
        }

        return null;
    }
}