import { BaseDao } from '$lib/server/dao/BaseDao';
import { WebPaySetting } from '$model/schema';
import { eq, sql } from 'drizzle-orm';

export class WebPaySettingDao extends BaseDao<typeof WebPaySetting> {
    private static readonly SQL_FIND_WEB_PAY_SETTING_COUNT = `SELECT COUNT(*) as total FROM web_pay_setting GROUP BY pay_type ORDER BY pay_type`;
    private static readonly SQL_FIND_WEB_PAY_SETTING_BY_OUTLET_ID = `SELECT * FROM web_pay_setting WHERE outlet_id = ?`;
    
    constructor() {
        super(WebPaySetting);
    }

    public async findWebPaySettingCount(): Promise<{total: unknown}[]> {
        try {
            //SELECT COUNT(*) as total FROM web_pay_setting GROUP BY pay_type ORDER BY pay_type
            const count: {total: unknown}[] = await BaseDao.d1
                .select({total: sql`COUNT(${WebPaySetting.id})`})
                .from(this.schema)
                .groupBy(WebPaySetting.payType)
                .orderBy(WebPaySetting.payType)
                .all();
            return count;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find web pay setting count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 根据店铺ID获取移动支付配置
     * @param outletId 店铺ID
     * @returns 移动支付配置
     */
    public async findByOutletId(outletId: number): Promise<typeof WebPaySetting["$inferSelect"][]> {
        //SELECT * FROM web_pay_setting WHERE outlet_id = ?
        return this.findList(eq(WebPaySetting.outletId, outletId));
    }
} 