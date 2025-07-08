import { asc, eq, inArray, SQL } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
export class BaseDao<T extends SQLiteTableWithColumns<any>> {
    public static d1: DrizzleD1Database<any>;

    constructor(protected readonly schema: T) {}

    protected async create(values: any): Promise<T['$inferSelect']> {
        const result = await BaseDao.d1.insert(this.schema).values(values).returning(this.schema.$inferSelect);
        return result;
    }

    protected async update(values: any, id: number): Promise<T['$inferSelect']> {
        return await BaseDao.d1.update(this.schema).set(values).where(eq((this.schema).id, id)).returning();
    }
    
    public async saveOrUpdate(obj: T['$inferSelect']): Promise<T['$inferSelect']> {
        try {
            if(obj.id) {
                return await this.update(obj, obj.id);
            }
            
            return await this.create(obj);
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to save or update: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findById(id: number): Promise<T['$inferSelect'] | null> {
        try {
            return await this.findOne(eq((this.schema).id, id));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find ${this.schema.name} by ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findByIds(ids: (number | string)[]): Promise<T['$inferSelect'][]> {
        try {
            return await this.findList(inArray((this.schema).id, ids));
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to find ${this.schema.name} by IDS ${ids}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 查询列表
     * @param sql 
     * @param params 
     * @returns 
     */
    protected async findList(whereObj: SQL | undefined, orderBy: SQL = asc(this.schema["id"]) ): Promise<T['$inferSelect'][]> {
        
        return await BaseDao.d1.select().from(this.schema).where(whereObj).orderBy(orderBy).all();
    }

    /**
     * 查询单条数据
     * @param sql 
     * @param params 
     * @returns 
     */
    protected async findOne(whereObj: SQL | undefined, orderBy: SQL = asc(this.schema["id"])): Promise<T['$inferSelect'] | null> {
        const results = await BaseDao.d1.select()
            .from(this.schema)
            .where(whereObj)
            .orderBy(orderBy)
            .limit(1)
            .all();
        
        return results?.length > 0 ? results[0] : null;
    }

    /**
     * 查询分页列表
     * @param sql 
     * @param params 
     * @param page 
     * @param pageSize 
     * @returns 
     */
    protected async findPageList(whereObj: SQL, orderBy = asc(this.schema["id"]), page: number, pageSize: number): Promise<T['$inferSelect'][]> {
        return await BaseDao.d1.select().from(this.schema)
            .where(whereObj)
            .orderBy(orderBy)
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .all();
    }

    /**
     * 查询指定列列表
     * V = {[列名]: [类型]}
     * @param sql 
     * @param params 
     * @returns 
     */
    protected async querySpecifyColumnsList<V extends object>(columnObj: any, whereObj: SQL | undefined = undefined): Promise<V[]> {
        return await BaseDao.d1.select(columnObj).from(this.schema).where(whereObj).all();
    }

    /**
     * 查询指定列单条数据
     * V = {[列名]: [类型]}
     * @param sql 
     * @param params 
     * @returns 
     */
    protected async querySpecifyColumnsOne<V extends object>(columnObj: any, whereObj: SQL | undefined = undefined): Promise<V | null> {
        const results = await BaseDao.d1.select(columnObj).from(this.schema).where(whereObj).all();
        
        return results?.length > 0 ? results[0] : null;
    }
}
