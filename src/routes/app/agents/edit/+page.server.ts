import { OutletService } from '$service/outletService';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { AgentVo } from '$lib/server/value/agentVo';

export const load: PageServerLoad = async ({locals: {outlet}, url}) => {
    const id = url.searchParams.get('id');
    const editAgentData = await OutletService.getEditAgentData(outlet, Number(id));
    
    return {
        ...editAgentData
    };
}

export const actions: Actions = {
    save: async ({request}) => {
        const formData = await request.formData();
        const agentVo = genarateAgentVoFromFormData(formData);
        
        await OutletService.saveAgent(agentVo);
        
        throw redirect(302, '/app/agents/list');
    }
}
function genarateAgentVoFromFormData(formData: FormData) {
    return {
        id: Number(formData.get('outlet.id')),
        name: formData.get('outlet.name') as string,
        type: formData.get('outlet.type') as string,
        deptId: Number(formData.get('outlet.dept_id')),
        state: formData.get('outlet.state') as string,
        city: formData.get('outlet.city') as string,
        phone: formData.get('outlet.phone') as string,
        email: formData.get('outlet.email') as string,
        remark: formData.get('outlet.remark') as string,
        country: formData.get('outlet.country') as string,
        delFlag: formData.get('outlet.delFlag') as string
    } as AgentVo;
}

