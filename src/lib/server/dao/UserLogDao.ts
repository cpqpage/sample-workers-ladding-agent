import { User, UserLog } from "$model/schema";
import { BaseDao } from "$lib/server/dao/BaseDao";
import { and, desc, eq, SQL } from "drizzle-orm";
import dayjs from "dayjs";

export class UserLogDao extends BaseDao<typeof UserLog> {


    constructor() {
        super(UserLog);
    }

    /**
     * Find the last login record for a user
     * @param userId User ID
     * @returns Array of user logs
     */
    public async findLastLogin(userId: number) {
        //SELECT * FROM user_log WHERE user_id = ? ORDER BY datetime DESC
        return this.findPageList(eq(UserLog.userId, userId), desc(UserLog.datetime), 2, 1);
    }

    public async findLatestLoginByCompanyIdAndOutletId(companyId: number, outletId: number) {
        //SELECT * FROM user_log WHERE company_id = ? AND outlet_id = ? ORDER BY datetime DESC
        return this.findPageList(and(
            eq(UserLog.companyId, companyId),
            eq(UserLog.outletId, outletId)
        ) as SQL, desc(UserLog.datetime), 1, 1);
    }

    /**
     * Add a new user log entry
     * @param user User log object
     * @returns Created user log with ID
     */
    public async createUserLog(user: typeof User.$inferSelect): Promise<typeof UserLog["$inferSelect"]> {
        //INSERT INTO user_log (company_id, outlet_id, user_id, action, datetime, remark, create_date) VALUES (?, ?, ?, ?, ?, ?, ?)
        try {
            return await this.create({
                companyId: user.companyId,
                outletId: user.outletId,
                userId: user.id,
                action: 'jwt login',
                datetime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                remark: '代理商登录',
                createDate: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
            });
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to create user log: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 