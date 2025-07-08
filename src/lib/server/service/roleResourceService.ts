import { RoleResourceDao } from '$dao/RoleResourceDao';
import {Role, Resource} from '$model/schema';

export const RoleResourceService = {
    async getAllRoleResources() {
        const roleResourceDao = new RoleResourceDao();
        const roleResources = await roleResourceDao.getAllARoleResources();
        if(roleResources == null || roleResources.length == 0) {
            return null;
        }

        // 角色资源映射表
        const resouceMap: Record<string, string[]> = {};
        roleResources.forEach(({role, resource}) => {
            const resouceMapKey = resource.resourceStr || "";
            const attr = resouceMap[resource.resourceStr || ""];
            if(!attr) {
                resouceMap[resouceMapKey] = [role.name || ""];
            }
            else {
                attr.push(role.name || "");
            }
        });

        return resouceMap;
    },
    checkAccess: async (roleName: string, url: string) => {
        const roleResources = await RoleResourceService.getAllRoleResources();
        if(roleResources == null) {
            return true;
        }

        if(url.indexOf("?") > -1) {
            url = url.substring(0, url.indexOf("?"));
        }
        if(url.indexOf("#") > -1) {
            url = url.substring(0, url.indexOf("#"));
        }
        
        if(Object.keys(roleResources).indexOf(url) == -1) {
            return true;
        }

        // 角色资源映射表
        const roleNames = roleResources[url];
        if(roleNames.length > 0 && roleNames.indexOf(roleName) > -1) {
            return true;
        }
        return false;
    }
};