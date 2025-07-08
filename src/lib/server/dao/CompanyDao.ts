import { BaseDao } from './BaseDao';
import { Company } from '$model/schema';
import { eq, gt, gte, sql } from 'drizzle-orm';

export class CompanyDao extends BaseDao<typeof Company> {
    private static readonly FIND_TOTAL_COMPANY_COUNT_SQL = `SELECT COUNT(id) as total FROM company WHERE id > 0`;

    constructor() {
        super(Company);
    }

    /**
     * 查询总公司数量
     * @param agentIds 代理ID列表
     * @returns 总公司数量
     */
    public async findTotalCompanyCount() {
        try {
            const result: {total: number} | null = await this.querySpecifyColumnsOne({total: sql`count(${Company.id})`}, gt(Company.id, 0));
            return result?.total || 0;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find total company count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

} 