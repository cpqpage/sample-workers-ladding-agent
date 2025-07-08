import { BaseDao } from "./BaseDao";
import { Outlet, Company, UserLog } from "$lib/server/model/schema";
import { OUTLET_TYPE } from "$lib/constants";
import dayjs from "dayjs";
import { and, between, desc, eq, gt, gte, inArray, like, lt, lte, not, or, SQL, sql } from "drizzle-orm";
import { on } from "svelte/events";

export class OutletDao extends BaseDao<typeof Outlet> {
    
    private static readonly FIND_AGENT_LIST_SQL = `SELECT * FROM outlet o WHERE del_flag = 0 AND company_id = -2`;
    
    constructor() {
        super(Outlet);
    }

    /**
     * 查询代理门店列表
     * @param dept_id 部门ID
     * @returns 代理门店列表
     */
    public async findAgentOutletList(dept_id: number) {
        try {
            //company_id = -2 AND (dept_id = ? OR id = ?)
            return await this.findList( and( eq(Outlet.companyId, -2 ), or( eq(Outlet.deptId, dept_id ), eq( Outlet.id, dept_id ) ) ) );
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent outlet list for dept_id ${dept_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 查询总店铺数量
     * @param agentIds 代理ID列表
     * @returns 总店铺数量
     */
    public async findTotalOutletCount(agentIds: number[]): Promise<number> {
        let andArray = [eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)];
        this.addAgentIdCondition(agentIds, andArray);
        let whereObj = and(...andArray);
        try {
            //o.del_flag = 0 AND o.company_id > 0
            const columnObj = {total: sql<number>`count(${Outlet.id})`};
            const result: {total: number} | null = await this.querySpecifyColumnsOne(columnObj, whereObj);
            return result ? result.total : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find total outlet count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 查询七天活跃店铺数量
     * @param agentIds 代理ID列表
     * @param userId 用户ID
     * @param sevenDaysAgo 七天前的日期
     * @param now 当前日期
     * @returns 七天活跃店铺数量
     */
    public async findSevenDaysActiveOutletCount(agentIds: number[], userId: number, sevenDaysAgo: string, now: string): Promise<number> {
        //ul.user_id != ? AND ul.datetime >= ? AND ul.datetime <= ?
        let andArray = [not(eq(UserLog.userId, userId)), between(UserLog.datetime, sevenDaysAgo, now)];
        this.addAgentIdCondition(agentIds, andArray);
        let whereObj = and(...andArray);
        try {
            //o.del_flag = 0 AND o.company_id > 0
            
            const columnObj = {total: sql<number>`count(${Outlet.id})`};
            const result = await BaseDao.d1.select(columnObj).from(Outlet).innerJoin(UserLog, eq(UserLog.outletId, Outlet.id)).where(whereObj)
            
            return result ? (result as any).total : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find serven days active total outlet count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 添加agentId条件
     * @param agentIds
     * @param andArray
     * */
    private addAgentIdCondition(agentIds: number[], andArray: SQL<unknown>[]) {
        if(agentIds.length > 0){
            //` AND o.agent_id IN (${agentIds.map(() => '?').join(',')})`
            andArray.push(inArray(Outlet.agentId, agentIds));
        }
    }

    /**
     * 查询没有注册码的店铺数量
     * @param agentIds 代理ID列表
     * @returns 没有注册码的店铺数量
     */
    public async findOutletCountWithoutProductKey(agentIds: number[]): Promise<number> {
        let andArray = [sql`${Outlet.productKey} is null`,eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)];
        this.addAgentIdCondition(agentIds, andArray);
        let whereObj = and(...andArray);
        try {
            //o.del_flag = 0 AND o.company_id > 0
            const columnObj = {total: sql<number>`count(${Outlet.id})`};
            const result: {total: number} | null = await this.querySpecifyColumnsOne(columnObj, whereObj);
            return result ? result.total : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find total outlet count withoud productkey: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 查询微信店铺数量
     * @param agentIds 代理ID列表
     * @returns 微信店铺数量
     */
    public async findNetShopOutletCount(agentIds: number[]): Promise<number> {
        let andArray = [gt(Outlet.netshopEnabled, 0),eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)];
        this.addAgentIdCondition(agentIds, andArray);
        let whereObj = and(...andArray);
        try {
            //o.del_flag = 0 AND o.company_id > 0
            const columnObj = {total: sql<number>`count(${Outlet.id})`};
            const result: {total: number} | null = await this.querySpecifyColumnsOne(columnObj, whereObj);
            return result ? result.total : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find net shop outlet count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    /**
     * 查询代理列表
     * @param outletId 门店ID
     * @param outletType 门店类型
     * @param query 查询条件
     * @returns 代理列表
     */
    public async findAgentList(outletId: number, outletType: string, query: string | null = null) {
        let andArray = [eq(Outlet.delFlag, 0), eq(Outlet.companyId, -2)]
        
        if (outletType === OUTLET_TYPE.REGIONAL) {
            andArray.push(eq(Outlet.deptId, outletId));
        }
        if (query) {
            andArray.push(like(Outlet.name, `%${query}%`));
        }
        
        try {
            return this.findList(and(...andArray), desc(Outlet.updateDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findParentAgentList() {
        try {
            return await BaseDao.d1.select().from(Outlet).where(and(eq(Outlet.delFlag, 0), eq(Outlet.companyId, -2), not(eq(Outlet.type, '7')))).orderBy(desc(Outlet.updateDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find parent agent list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findAgentListForEditAgentUser(outletType: string) {
        let andArray = [eq(Outlet.delFlag, 0), eq(Outlet.companyId, -2), not(eq(Outlet.type, "9"))]
        
        try {
            return await BaseDao.d1.select().from(Outlet).where(and(...andArray)).orderBy(desc(Outlet.updateDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findAgentList2(agentId: number) {
        const selectOutlet = await this.findById(agentId);
        const outletType = selectOutlet?.type || OUTLET_TYPE.NORMAL;
        const andArray = [eq(Outlet.delFlag, 0), eq(Outlet.companyId, -2)];
        this.generateAgentConditionByOutletType(agentId, outletType, andArray);
        
        try {
            return await this.findList(and(...andArray), desc(Outlet.updateDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findAgentListByOutlet(selectOutlet: typeof Outlet['$inferSelect']) {
        const outletType = selectOutlet?.type || OUTLET_TYPE.NORMAL;
        
        const andArray = [eq(Outlet.delFlag, 0), eq(Outlet.companyId, -2)];
        this.generateAgentConditionByOutletType(selectOutlet.id, outletType, andArray);
        
        try {
            return await this.findList(and(...andArray), desc(Outlet.updateDate));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find agent list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async generateAgentConditionByOutletType(agentId: number, outletType: any, andArray: (SQL | undefined)[]){
        
        switch (outletType) {
            case OUTLET_TYPE.REGIONAL:
                andArray.push(or(eq(Outlet.deptId, agentId), eq(Outlet.id, agentId)));
                break;
            case OUTLET_TYPE.NORMAL:
                andArray.push(eq(Outlet.id, agentId));
                break;
        }
    }

    public async findOutletListInCompanyExcludeCurrentOutlet(companyId: number, currentOutletId: number){
        return BaseDao.d1.select().from(Outlet)
            .innerJoin(Company, eq(Company.id, Outlet.companyId))
            .where(and(eq(Outlet.delFlag, 0), eq(Outlet.companyId, companyId), eq(Outlet.id, currentOutletId)))
            .all();
    }

    public async findOutletListInCompany(companyId: number){
        
        return await this.findList(and(eq(Outlet.delFlag, 0), eq(Outlet.companyId, companyId)));
    }

    public async findOutletList(transParams: {
        query: string;
        agentId: number;
        hasProductKey: string;
        multiOutlet: string;
        enabled: string;
        isExpired: string;
        country: string;
        province: string;
        city: string;
        page: number;
        pageSize: number;
    }) : Promise<{outlet: typeof Outlet['$inferSelect']; company: typeof Company['$inferSelect']}[]> {
        
        const {page, pageSize} = transParams;
        const andArray = [eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)];
        await this.generateFindOutletListSQL(andArray, transParams);
        
        try {
            return BaseDao.d1.select().from(Outlet)
                .innerJoin(Company, eq(Company.id, Outlet.companyId))
                .where(and(eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)))
                .orderBy(desc(Outlet.createDate))
                .limit(pageSize)
                .offset((page - 1) * pageSize)
                .all();
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find outlet list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findOutletListCount(transParams: {
        query: string;
        agentId: number;
        hasProductKey: string;
        multiOutlet: string;
        enabled: string;
        isExpired: string;
        country: string;
        province: string;
        city: string;
    }) {
        
        const andArray = [eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)];
        await this.generateFindOutletListSQL(andArray, transParams);
        
        try {
            const results: {total: unknown}[] = await BaseDao.d1.select({total: sql`count(${Outlet.id})`}).from(Outlet)
                .innerJoin(Company, eq(Company.id, Outlet.companyId))
                .where(and(eq(Outlet.delFlag, 0), gt(Outlet.companyId, 0)))
                .orderBy(desc(Outlet.createDate))
                .all();
            return results && results.length > 0 ? results[0].total as number : 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find total outlet list count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async generateFindOutletListSQL(andArray: SQL[], 
    transParams: {
        query: string;
        agentId: number;
        hasProductKey: string;
        multiOutlet: string;
        enabled: string;
        isExpired: string;
        country: string;
        province: string;
        city: string;
    }){ 
        const selectOutlet = await this.findById(Number(transParams.agentId));
        
        if(selectOutlet){
            const outletType = selectOutlet.type;
            if(outletType == OUTLET_TYPE.REGIONAL || outletType == OUTLET_TYPE.NORMAL){
                const agentList = await this.findAgentListByOutlet(selectOutlet);
                andArray.push(inArray(Outlet.agentId, agentList.map((agent)=>agent.id)))
            }
        }
        
        
        if(transParams.query){
           
            andArray.push( or(
                like(Outlet.productKey, `%${transParams.query}%`),
                like(Outlet.name, `%${transParams.query}%`),
                like(Outlet.outletCode, `%${transParams.query}%`),
                like(Outlet.remark, `%${transParams.query}%`),
            ) as SQL);
        }
        if(transParams.enabled){
            andArray.push(eq(Outlet.outletEnabled, Number(transParams.enabled)));
        }

        if(transParams.multiOutlet){
            if(transParams.multiOutlet == '0'){
                andArray.push(lte(Company.outletQty, 1));
            } else {
                andArray.push(gt(Company.outletQty, 1));
            }
        }

        if(transParams.hasProductKey){
            switch(transParams.hasProductKey){
                case "0": 
                    andArray.push(sql`${Outlet.productKey} is null`);
                    break;
                case "1": 
                    andArray.push(sql`${Outlet.productKey} is not null and ${Outlet.expiryDate} is not null`);
                    break;
                case "2":
                    andArray.push(sql`${Outlet.productKey} is not null and ${Outlet.expiryDate} is null`);
                    break;
            }
        }

        if(transParams.isExpired){
            const currentDate = new Date();
            const now = dayjs(currentDate).format("yyyy-MM-dd HH:mm-ss");
            const days30Ago = dayjs(currentDate).add(-30, 'day').format("yyyy-MM-dd HH:mm-ss");
            const nowWeekEnd = dayjs(currentDate).add(7, 'day').format("yyyy-MM-dd HH:mm-ss");
            const days30AgoWeekEnd = dayjs(currentDate).add(-30 + 7, 'day').format("yyyy-MM-dd HH:mm-ss");

            switch(Number(transParams.isExpired || 0)){
                case 0:
                    // ` AND ( 
                    //     (o.productKey IS NOT NULL
                    //     AND o.expiryDate IS NOT NULL 
                    //     AND o.expiryDate < ?) 
                    //     OR (o.productKey IS NULL 
                    //     AND o.createDate < ?)
                    // )`
                    let _and1 = and(sql`${Outlet.productKey} is not null`,
                        sql` ${Outlet.expiryDate} is not null`,
                        lt(Outlet.expiryDate, days30Ago))
                    let _and2 = and(sql`${Outlet.productKey} is null`,
                        lt(Outlet.createDate, days30Ago))
                    
                    andArray.push(or(_and1, _and2) as SQL);
                    break;
                case 1:
                    // ` AND ( 
                    //     (o.productKey IS NOT NULL 
                    //     AND (o.expiryDate >= ? 
                    //     OR o.expiryDate IS NULL)) 
                    //     OR 
                    //     (o.productKey IS NULL 
                    //     AND o.createDate >= ?)
                    // )`
                    
                    let _or1 = or(gte(Outlet.expiryDate, now),
                        sql`${Outlet.expiryDate} is null`)
                    
                    _and1 = and(sql`${Outlet.productKey} is not null`, _or1)
                    
                    _and2 = and(sql`${Outlet.productKey} is null`,
                        gte(Outlet.createDate, days30Ago))
                    
                    andArray.push(or(_and1, _and2) as SQL);
                    break;
                case 2:
                    // ` AND ( 
                    //     (o.productKey IS NOT NULL 
                    //     AND o.expiryDate IS NOT NULL  
                    //     AND o.expiryDate BETWEEN ? AND ?) 
                    //     OR 
                    //     (o.productKey IS NULL 
                    //     AND o.createDate BETWEEN ? AND ?)
                    // )`
                    
                    _and1 = and(sql`${Outlet.productKey} is not null`,
                        sql`${Outlet.expiryDate} is not null`,
                        between(Outlet.expiryDate, now, nowWeekEnd)
                    )
                    _and2 = and(sql`${Outlet.productKey} is not null`, between(Outlet.createDate, days30Ago, days30AgoWeekEnd))
                    andArray.push(or(_and1, _and2) as SQL);
                    break;
            }
        }

        if(transParams.country){
            andArray.push(eq(Outlet.country, transParams.country));
        }
        if(transParams.province){
            andArray.push(eq(Outlet.state, transParams.province));
        }
        if(transParams.city){
            andArray.push(eq(Outlet.city, transParams.city));
        }
    }

    public async generateAgentConditionByAgentId(agentId: number, andArray: SQL[] = []) {
        const selectOutlet = await this.findById(Number(agentId));
        const outletType = selectOutlet?.type || OUTLET_TYPE.NORMAL;
        
        await this.generateAgentConditionByOutletType(agentId, outletType, andArray);
    }
}