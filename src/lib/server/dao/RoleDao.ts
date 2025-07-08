import { BaseDao } from "./BaseDao";
import { Role, User, UserRole } from "$model/schema";
import { eq } from "drizzle-orm";

export class RoleDao extends BaseDao<typeof Role> {
    constructor() {
        super(Role);
    }

    /**
     * SELECT r.* FROM role r
        INNER JOIN user_role ur ON ur.role_id = r.id
        WHERE ur.user_id = ?
     * 根据用户ID查询角色
     * @param userId - 用户ID
     * @returns Promise<Role | null> - 角色信息或null
     * @throws {Error} 当查询执行失败时抛出错误
     */
    public async findByUserId(userId: number): Promise<{
        role: typeof Role["$inferSelect"];
        app_user: typeof User["$inferSelect"];
        user_role: typeof UserRole["$inferSelect"];
    } | null> {
        try {
            const list =  await BaseDao.d1.select()
                .from(Role)
                .innerJoin(UserRole, eq(UserRole.roleId, Role.id))
                .innerJoin(User, eq(UserRole.userId, User.id))
                .where(eq(UserRole.userId, userId))
                .limit(1).all();
            return list && list.length > 0 ? list[0] : null;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find role for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
