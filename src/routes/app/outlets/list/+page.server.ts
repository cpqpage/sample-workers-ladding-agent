import type { Actions } from '../../productKeys/list/$types';
import type { PageServerLoad } from './$types';
import { OutletService } from '$service/outletService';
import { PUBLIC_PAGE_SIZE } from '$env/static/public';
import { OUTLET_TYPE } from '$lib/constants';
import { fail } from '@sveltejs/kit';

let query = "";
let agentId: number | null = null;
let hasProductKey = "";
let multiOutlet = "";
let enabled = "";
let isExpired = "";
let country = "";
let province = "";
let city = "";
let page = 1;
let pageSize = Number(PUBLIC_PAGE_SIZE);

export const load: PageServerLoad = async ({locals: {outlet}}) => {
  const currentOutletId = outlet.id;
  const currentOutletType = outlet.type;

  const params = {
    currentOutletId,
    currentOutletType,
    query,
    agentId,
    hasProductKey,
    multiOutlet,
    enabled,
    isExpired,
    country,
    province,
    city,
    page,
    pageSize
  };

  const data = await OutletService.getOutletListData(params);
  return {
    ...data,
    now: new Date(),
    form: {
      ...params
    }
  };
};

export const actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    const formAgentId = formData.get('agentId')?.toString();
    query = formData.get('query')?.toString() || "";
    agentId = formAgentId ? Number(formAgentId) : null;
    hasProductKey = formData.get('hasProductKey')?.toString() || "";
    multiOutlet = formData.get('multiOutlet')?.toString() || "";
    enabled = formData.get('enabled')?.toString() || "";
    isExpired = formData.get('isExpired')?.toString() || "";
    country = formData.get('country')?.toString() || "";
    province = formData.get('province')?.toString() || "";
    city = formData.get('city')?.toString() || "";
  },
  gotoPage: async ({ request }) => {
    const formData = await request.formData();
    page = parseInt(formData.get('page')?.toString() || "1", 10);
    pageSize = parseInt(formData.get('pageSize')?.toString() || PUBLIC_PAGE_SIZE.toString(), 10);
  },
  moveOutlet: async ({ request, locals: {outlet} }) => {
    const formData = await request.formData();
    const agentId = Number(formData.get('agentId')?.toString());
    const outletIds = formData.getAll("outletIds") as string[];
    
    if(outlet.type != OUTLET_TYPE.REGIONAL && outlet.type != OUTLET_TYPE.GENERAL){
      return fail(302, {error: 'error.accessDenied'});
    }

    const result = await OutletService.changeOutletOwner(outletIds, agentId);
    if(result === 0){
      return fail(302, {error: 'outlets.move.error.noChange'});
    }

    // 返回成功消息
    return {
      status: 200,
      success: true,
      message: 'outlets.move.success',
      result
    };
  }
} satisfies Actions;