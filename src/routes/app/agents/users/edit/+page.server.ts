import { UserService } from '$service/userService';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { AgentUserVo } from '$lib/server/value/agentUserVo';

export const load: PageServerLoad = async ({locals: {outlet}, url}) => {
    const id = url.searchParams.get('id');
    const editAgentUserData = await UserService.getEditAgentUserData(Number(id), outlet.type);
    
    return {
        ...editAgentUserData
    };
}

export const actions: Actions = {
    save: async ({request}) => {
        const formData = await request.formData();
        const agentUserVo = genarateAgentUserVoFromFormData(formData);
        const confirmPassword = formData.get('confirmPassword') as string;
        
        if(agentUserVo.email?.length == 0 && agentUserVo.phoneNumber?.length == 0){
            return fail(302, {returnVo: agentUserVo, errors: "agent.users.edit.error.needAtLeastOne"});
        }

        if(!agentUserVo.id || agentUserVo.id == 0){
            if(agentUserVo.password?.length == 0 || confirmPassword?.length == 0){
                return fail(302, {returnVo: agentUserVo, errors: "agent.users.edit.error.emptyFields"});
            }
        }
        
        if(agentUserVo.password?.length > 0 || confirmPassword?.length > 0){
            if(agentUserVo.password != confirmPassword){
                return fail(302, {returnVo: agentUserVo, errors: "agent.users.edit.error.passwordMismatch"});
                
            }
        }

        await UserService.saveAgentUser(agentUserVo);

        throw redirect(302, '/app/agents/users/list');
    }
}
function genarateAgentUserVoFromFormData(formData: FormData) {
    return {
        id: Number(formData.get('editUser.id')),
        email: formData.get('editUser.email') as string,
        phoneNumber: formData.get('editUser.phone_number') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
        accountEnabled: formData.get('editUser.account_enabled') === 'true',
        outletId: Number(formData.get('editUser.outlet_id'))
    } as AgentUserVo;
}

