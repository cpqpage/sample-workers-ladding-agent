import { User,Outlet,Role, UserRole } from "$model/schema";
import { BaseDao } from "$lib/server/dao/BaseDao";
import { OUTLET_TYPE } from "$lib/constants";
import { and, desc, eq, like, or, sql, SQL } from "drizzle-orm";

export class UserDao extends BaseDao<typeof User> {
    constructor() {
        super(User);
    }
    
    /**SELECT * FROM app_user where email = ?
     * 根据邮箱查询用户
     * @param email 邮箱
     * @returns 用户
     */
    public async findByEmail(email: string) {
        try {
            return await this.findOne(eq(User.email, email));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find user by email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async updatePassword(userId: number, newPassword: string): Promise<void> {
        try {
            await this.update({password: newPassword}, userId);
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to update password for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findAgentUserList(outletId: number, outletType: string, query: string, page: number, pageSize: number) {
        const andArray: SQL[] = this.getAgentUserListSql(outletId, outletType, query);
        // const sql = `SELECT u.*,o.name as outlet_name ${sqlObj.sql} ORDER BY u.id desc LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        
        try {
            const userList = await BaseDao.d1.select().from(User)
                .innerJoin(Outlet, eq(User.outletId, Outlet.id))
                .where(and(...andArray))
                .orderBy(desc(User.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize)
                .all();
            return userList;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent user list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findAgentUserListCount(outletId: number, outletType: string, query: string): Promise<number> {
        // const sql = `SELECT COUNT(*)`;
        
        const andArray: SQL[] = this.getAgentUserListSql(outletId, outletType, query);
        try {
            const count: {total: unknown}[] = await BaseDao.d1
                .select({total: sql`count(${User.id})`})
                .from(User)
                .innerJoin(Outlet, eq(User.outletId, Outlet.id))
                .where(and(...andArray))
                .orderBy(desc(User.id))
                .limit(1)
                .all();
            return count && count.length > 0 ? count[0].total as number : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent user list count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private getAgentUserListSql(outletId: number, outletType: string, query: string) {
        //FROM app_user u INNER JOIN outlet o ON u.outlet_id = o.id WHERE u.del_flag = 0 AND o.company_id = -2
        //u.del_flag = 0 AND o.company_id = -2
        const andArray = [eq(User.delFlag, 0), eq(Outlet.companyId, -2)];
        switch (outletType) {
            case OUTLET_TYPE.REGIONAL:
                //sql += ` AND (o.dept_id = ? OR o.id = ?)`;
                andArray.push(or(eq(Outlet.deptId, outletId), eq(Outlet.id, outletId)) as SQL);
                break;
            case OUTLET_TYPE.NORMAL:
                // sql += ` AND o.id = ?`;
                andArray.push(eq(Outlet.id, outletId));
                break;
        }
        if (query) {
            // sql += ` AND (u.email LIKE ? OR u.phone_number LIKE ? OR o.name LIKE ?)`;
            andArray.push(or(like(User.email, `%${query}%`),
                like(User.phoneNumber, `%${query}%`),
                like(Outlet.name, `%${query}%`)) as SQL);
        }
        return andArray;
    }

    /**
     * 根据店铺ID获取用户列表
     * @param outletId 店铺ID
     * @returns 用户列表
     */
    public async findByOutletId(outletId: number) {
        return this.findUserListCommon([1, 0, outletId]);
    }

    private async findUserListCommon(params: (string | number | Date)[]){
        //SELECT u.*, r.description FROM app_user u INNER JOIN user_role ur ON u.id = ur.user_id INNER JOIN role r ON ur.role_id = r.id WHERE u.account_enabled = ? and u.del_flag = ?  and u.outlet_id = ? ORDER BY u.update_date DESC
        
       
        
        try {
            const resultList = await BaseDao.d1.select()
                .from(User)
                .innerJoin(UserRole, eq(User.id, UserRole.userId))
                .innerJoin(Role, eq(Role.id, UserRole.roleId))
                .where(
                    and(
                        eq(User.accountEnabled, params[0] as number),
                        eq(User.delFlag, params[1] as number),
                        eq(User.outletId, params[2] as number)
                    )
                )
                .orderBy(desc(User.updateDate))
                .all();
            return resultList;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find outlet list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}