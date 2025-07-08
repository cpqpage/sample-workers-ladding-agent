import { OUTLET_TYPE } from "$lib/constants";
import { OutletDao } from "../dao/OutletDao";
import type { Outlet } from "../model/schema";

export const AgentService = {
    getAgentTree: async (currentOutletId: number, currentOutletType: string) => {
        const outletDao = new OutletDao();
        const agentList = await outletDao.findAgentList2(currentOutletId);
        
        const agentTree: typeof Outlet["$inferSelect"][] = [];
        if(currentOutletId === -2){
            agentTree.push(agentList.filter(agent => agent.id === -2)[0]);
        }
        AgentService.buildOutletTree(agentTree, agentList, currentOutletType === OUTLET_TYPE.GENERAL ? 0 : -2);
        
        const agentMap: Record<number, string> = agentList.reduce((map, outlet) => {
            map[outlet.id] = outlet.name || "";
            return map;
        }, {} as Record<number, string>);

        return {
            agentTree: agentTree,
            agentMap: agentMap
        };
    },
    buildOutletTree: (agentTree: typeof Outlet["$inferSelect"][], allAgents: typeof Outlet["$inferSelect"][], parentId: number) => {
        const children: typeof Outlet["$inferSelect"][] = allAgents.filter(agent => agent.deptId === parentId);
        
        if(children.length > 0) {
            for (const child of children) {
                agentTree.push(child);
                AgentService.buildOutletTree(agentTree, allAgents, child.id);
            }
        }
    }
}