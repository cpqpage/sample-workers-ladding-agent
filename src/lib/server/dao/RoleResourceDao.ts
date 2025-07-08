import { BaseDao } from './BaseDao';
import { RoleResource, Role, Resource } from '$model/schema';
import { eq } from 'drizzle-orm';

export class RoleResourceDao extends BaseDao<typeof RoleResource> {
    constructor() {
        super(RoleResource);
    }

    /**
     * `select r.*, res.* from role r, role_resource rr, resource res where r.id = rr.role_id and res.id = rr.resource_id`
     * @returns 获取所有角色资源
     */
    public async getAllARoleResources(): Promise<{
        role_resource: typeof RoleResource["$inferSelect"];
        role: typeof Role["$inferSelect"];
        resource: typeof Resource["$inferSelect"]}[]> {
        try {
            const results = await BaseDao.d1.select()
                .from(Role)
                .innerJoin(Resource, eq(RoleResource.resourceId, Resource.id))
                .innerJoin(RoleResource, eq(RoleResource.roleId, Role.id))
                .all();
            
            return results;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get all role resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}