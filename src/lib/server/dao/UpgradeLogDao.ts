import { BaseDao } from './BaseDao';
import { UpgradeLog, Outlet, ProductKey } from '$model/schema';
import { OutletDao } from './OutletDao';
import { and, desc, eq, or, sql, SQL } from 'drizzle-orm';

export class UpgradeLogDao extends BaseDao<typeof UpgradeLog> {
    
    
    constructor() {
        super(UpgradeLog);
    }


    public async getUpgradLogList(
        agentId: number,
        type: string,
        occupied: string,
        giftFlag: number | null,
        versionFeatures: string,
        startDate: string,
        endDate: string
    ): Promise<Array<{
        upgrade_log: typeof UpgradeLog.$inferSelect;
        outlet: typeof Outlet.$inferSelect;
        product_key: typeof ProductKey.$inferSelect;
    }>> {
        // let sql = `SELECT ul.*,otl.*,pk.*,ul.agent_id as agent_id`;
        // ` FROM upgrade_log ul, outlet otl, product_key pk, outlet o`
        // + ` WHERE ul.outlet_id = otl.id`
        // + ` AND ul.agent_id = o.id`
        // + ` AND ul.product_key_id = pk.id`
        
        const andArray: SQL[] = await this.generateGetUpgradeListSQL(startDate, endDate, agentId, type, occupied, giftFlag, versionFeatures);
        
        try {
            const upgradeLogList = await BaseDao.d1.select().from(UpgradeLog)
                .innerJoin(Outlet, eq(UpgradeLog.outletId, Outlet.id))
                .innerJoin(ProductKey, eq(UpgradeLog.productKeyId, ProductKey.id))
                .where(and(...andArray))
                //sql += ` ORDER BY ul.upgrade_date DESC `;
                .orderBy(desc(UpgradeLog.upgradeDate))
                .all();
            
            return upgradeLogList;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get upgrade log list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async getUpgradLogListCount(agentId: number, type : string, occupied: string, giftFlag: number | null, versionFeatures: string, startDate: string, endDate: string){
        // let sql = `SELECT count(ul.id) as total`;
        const andArray = await this.generateGetUpgradeListSQL(startDate, endDate, agentId, type, occupied, giftFlag, versionFeatures);
        
        try {
            const count: {total: unknown}[] = await BaseDao.d1
                .select({total: sql`count(${UpgradeLog.id})`})
                .from(UpgradeLog)
                .innerJoin(Outlet, eq(UpgradeLog.outletId, Outlet.id))
                .innerJoin(ProductKey, eq(UpgradeLog.productKeyId, ProductKey.id))
                .where(and(...andArray))
                //sql += ` ORDER BY ul.upgrade_date DESC `;
                .orderBy(desc(UpgradeLog.upgradeDate))
                .all();
            
            return count && count.length > 0 ? count[0].total as number : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get upgrade log list count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async generateGetUpgradeListSQL(startDate: string, endDate: string, agentId: number, type: string, occupied: string, giftFlag: number | null, versionFeatures: string) {
        //otl 是使用注册码的店铺，o 是所属代理商店铺
        // ` FROM upgrade_log ul, outlet otl, product_key pk, outlet o`
        // + ` WHERE ul.outlet_id = otl.id`
        // + ` AND ul.agent_id = o.id`
        // + ` AND ul.product_key_id = pk.id`
        // + ` AND ul.upgrade_date BETWEEN ? AND ?`;

        let params: (string | number | Date)[] = [startDate+ " 00:00:00", endDate+ " 23:23:59"];
        const outletDao = new OutletDao();
        const andArray: SQL[] = [];
        await outletDao.generateAgentConditionByAgentId(agentId, andArray)

        if (type) {
            // sql += ` AND ul.key_type = ?`;
            andArray.push(eq(UpgradeLog.keyType, Number(type)));
        }

        if (occupied) {
            // sql += ` AND ul.upgrade_type = ?`;
            andArray.push(eq(UpgradeLog.upgradeType, Number(occupied)));
        }

        if (giftFlag) {
            // sql += ` AND ul.gift_flag = ?`;
            andArray.push(eq(UpgradeLog.giftFlag, giftFlag));
        }

        if (versionFeatures) {
            if (versionFeatures === '0') {
                // sql += ` AND (pk.version_features IS NULL OR pk.version_features = 0)`;
                andArray.push(or(
                    eq(ProductKey.versionFeatures, 0),
                    sql`${ProductKey.versionFeatures} IS NULL`
                ) as SQL);
            } else {
                // sql += ` AND pk.version_features = ?`;
                andArray.push(eq(ProductKey.versionFeatures, Number(versionFeatures)));
            }
        }
        
        return andArray;
    }

    /**
     * 根据店铺ID获取升级记录
     * @param outletId 店铺ID
     * @returns 升级记录
     */
    public async getUpgradeLogListByOutletId(outletId: number){
        // const sql = `SELECT * FROM upgrade_log ul WHERE ul.outlet_id = ? ORDER BY ul.upgrade_date DESC`;
        try {
            return this.findList(and(
                eq(UpgradeLog.outletId, outletId)),
                desc(UpgradeLog.upgradeDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get upgrade log list by outlet id: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async getAllUpgradeLogListByOutletId(outletId: number){
        // const sql = `SELECT * FROM upgrade_log ul WHERE ul.upgrade_type = 1 AND ul.cancel_flag != 1 AND ul.outlet_id = ? ORDER BY ul.upgrade_date DESC`;
        try {
            return this.findList(and(
                eq(UpgradeLog.upgradeType, 1),
                eq(UpgradeLog.cancelFlag, 0),
                eq(UpgradeLog.outletId, outletId)),
                desc(UpgradeLog.upgradeDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get all upgrade log list by outlet id: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}