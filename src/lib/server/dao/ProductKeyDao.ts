import { BaseDao } from './BaseDao';
import { ProductKey, Outlet } from '$model/schema';
import { OUTLET_TYPE } from '$lib/constants';
import { OutletDao } from './OutletDao';
import { and, asc, desc, eq, gt, inArray, lt, or, sql, SQL } from 'drizzle-orm'; // Add this import for eq

export class ProductKeyDao extends BaseDao<typeof ProductKey> {
    private static readonly SQL_FIND_PRODUCT_KEY_COUNT = `SELECT occupied, COUNT(*) as total FROM product_key WHERE id > 0`;
    
    constructor() {
        super(ProductKey);
    }
    
    /**
     * 查询注册码信息
     * @param agentIds 代理商ID列表
     * @returns 注册码信息
     */
    async findProductKeyCount(agentIds: string[]): Promise<({occupied: number, total: number})[]> {
        // let sql = ProductKeyDao.SQL_FIND_PRODUCT_KEY_COUNT;
        const andArray = [gt(ProductKey.id, 0)];
        if(agentIds.length > 0){
            // sql += ` AND agent_id IN (${agentIds.map(() => '?').join(',')})`;
            // 使用 inArray 来处理多个 agentId
            // 这样可以避免手动拼接字符串，减少 SQL 注入风险
            andArray.push(inArray(ProductKey.agentId, agentIds.map(Number)));
        }
        // sql += ` GROUP BY occupied ORDER BY occupied`
        try {
           const result: {occupied: number, total: number}[] = await this.querySpecifyColumnsList(
            {occupied: ProductKey.occupied, total: sql`count(${ProductKey.id})`},
            and(...andArray));

            return result;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find product key count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 查询注册码列表
     * @param agentId 门店ID
     * @param outletType 门店类型
     * @param query 查询条件
     * @param type 类型
     * @param occupied 是否被占用
     * @param versionFeatures 版本特性
     * @param page 页码
     * @param pageSize 每页大小
     * @returns 注册码列表
     */
    async findProductKeyList(agentId: number, query: string, type : string, occupied: string, versionFeatures: string, page: number, pageSize: number) {
        
        const andArray = await this.generateFindProductKeyListSQL(agentId, query, type, occupied, versionFeatures);
        
        try {
            const list = await BaseDao.d1.select()
                .from(ProductKey)
                .innerJoin(Outlet, eq(ProductKey.agentId, Outlet.id))
                .where(and(...andArray))
                .limit(pageSize)
                .offset((page - 1) * pageSize)
                // sql += ` ORDER BY pk.agent_id, pk.create_date DESC`;
                .orderBy(asc(ProductKey.agentId), desc(ProductKey.createDate))
                .all();
            
            return list;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find product key list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 查询注册码数量
     * @param agentId 门店ID
     * @param outletType 门店类型
     * @param query 查询条件
     * @param type 类型
     * @param occupied 是否被占用
     * @param versionFeatures 版本特性
     * @returns 注册码数量
     */
    async queryProductKeyCount(agentId: number, query: string, type : string, occupied: string, versionFeatures: string): Promise<number> {
        // let sql = `SELECT count(*) as total `;
        const andArray = await this.generateFindProductKeyListSQL(agentId, query, type, occupied, versionFeatures);
        
        try {
            const obj: {total: unknown}[] = await BaseDao.d1.select({ total: sql`count(${ProductKey.id})` })
                .from(ProductKey)
                .innerJoin(Outlet, eq(ProductKey.agentId, Outlet.id))
                .where(and(...andArray))
                .all();
            
            return obj && obj.length > 0 ? obj[0].total as number : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find product key count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async generateFindProductKeyListSQL(agentId: number, query: string, type: string, occupied: string, versionFeatures: string) {
        const andArray: SQL[] = [];

        const outletDao = new OutletDao();
        
        const selectOutlet = await outletDao.findById(Number(agentId));
        const outletType = selectOutlet?.type || OUTLET_TYPE.NORMAL;
        
        switch (outletType) {
            case OUTLET_TYPE.REGIONAL:
                // sql += ` AND (o.dept_id = ? OR o.id = ?) `;
                andArray.push(or(
                    eq(Outlet.deptId, agentId),
                    eq(Outlet.id, agentId)) as SQL);
                break;
            case OUTLET_TYPE.NORMAL:
                // sql += ` AND o.id = ?`;
                andArray.push(eq(Outlet.id, agentId));
                break;
        }

        if (query) {
            // sql += ` AND pk.product_key = ?`;
            andArray.push(eq(ProductKey.productKey, query));
        }

        if (type) {
            // sql += ` AND pk.type = ?`;
            andArray.push(eq(ProductKey.type, Number(type)));
        }

        if (occupied) {
            // sql += ` AND pk.occupied = ?`;
            andArray.push(eq(ProductKey.occupied, Number(occupied)));
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

    findProductKeys(pkIds: string[], occupied: number) {
        // const sql = `SELECT * FROM product_key WHERE id IN (${pkIds.map(() => '?').join(',')}) AND occupied = ?`;

        try {
            return this.findList(and(inArray(ProductKey.id, pkIds.map(Number)), eq(ProductKey.occupied, occupied)));
        }catch (error) {
            console.error(error);
            throw new Error(`Failed to find specific ids and coccupied product keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    findProductKeyByOutletId(productKey: string,outletId: number) {
        // const sql = `SELECT * FROM product_key WHERE outlet_id = ? and product_key = ?`;
        
        try {
            return this.findList(and(eq(ProductKey.outletId, outletId), eq(ProductKey.productKey, productKey)));
        }catch (error) {
            console.error(error);
            throw new Error(`Failed to find product key by outlet id: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    pickupProductKey(agentId: number, pkType: number, versionFeatures: number) {
        const versionFeaturesCondition = versionFeatures === 0 ? 'AND (pk.version_features IS NULL OR pk.version_features = 0)' : `AND pk.version_features = ${versionFeatures}`;
        // const sql = `select * from product_key pk where pk.agent_id = ? and pk.type = ? ${versionFeaturesCondition} and pk.occupied = 0 ORDER BY pk.create_date DESC limit 1`;
        const andArray = [
            eq(ProductKey.agentId, agentId),eq(ProductKey.type, pkType),
            eq(ProductKey.occupied, 0)];
        if (versionFeatures !== 0) {
            andArray.push(eq(ProductKey.versionFeatures, versionFeatures));
        } else {
            andArray.push(or(
                eq(ProductKey.versionFeatures, 0),
                sql`${ProductKey.versionFeatures} IS NULL`
            ) as SQL);
        }
        try {
            return this.findOne(and(...andArray), desc(ProductKey.createDate));
        }catch (error) {
            console.error(error);
            throw new Error(`Failed to pickup product key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    findProductKeysByProductKeyCode(productKeyCode: string) {
        // const sql = `select * FROM product_key pk WHERE pk.product_key = ? AND pk.occupied < 1 `;
        
        try {
            return this.findList(and(eq(ProductKey.productKey, productKeyCode), lt(ProductKey.occupied, 1)));
        }catch (error) {
            console.error(error);
            throw new Error(`Failed to find product keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 