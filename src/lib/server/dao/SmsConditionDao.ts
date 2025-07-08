import { BaseDao } from '$lib/server/dao/BaseDao';
import { Outlet, SmsCondition } from '$model/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export class SmsConditionDao extends BaseDao<typeof SmsCondition> {
    
    constructor() {
        super(SmsCondition);
    }

    /**
     * `SELECT COUNT(sc.id) as total FROM sms_condition sc, outlet o WHERE sc.outlet_id = o.id`
     * * 查询短信条件数量
     * @param agentIds 代理商ID列表
     * @returns 
     */
    public async findSmsConditionCount(agentIds: string[]): Promise<number> {
        
        const params = [];
        if(agentIds.length > 0){
            // sql += ` AND o.agent_id IN (${agentIds.map(() => '?').join(',')})`;
            params.push(...agentIds);
        }
        
        try {
            const count: {total: unknown}[] = await BaseDao.d1.select({ total: sql`COUNT(${SmsCondition.id})` })
                .from(SmsCondition)
                .innerJoin(Outlet, eq(SmsCondition.outletId, Outlet.id))
                .where(agentIds.length > 0 ? inArray(Outlet.id, agentIds.map(Number)) : undefined)
                .limit(1)
                .all();
            return count && count.length > 0 ? count[0].total as number : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find sms condition count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 