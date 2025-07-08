import { ProductKeyService } from '$service/productKeyService';
import { fail } from '@sveltejs/kit';
import type {Actions, PageServerLoad } from './$types';

let page = 1;
let pageSize = 50;
let query = '';
let agentId: number | null = null;
let type = '';
let occupied = '';
let versionFeatures = '';

export const load: PageServerLoad = async ({locals: {outlet}}) => {
  const currentOutletId = outlet.id;
  const currentOutletType = outlet.type;

  const pkData = await ProductKeyService.getProductKeyListData(
    currentOutletId,
    currentOutletType,
    agentId,
    query,
    type,
    occupied,
    versionFeatures,
    page,
    pageSize
  );

  return {
    ...pkData,
    form: {
      page,
      pageSize,
      query,
      agentId,
      type,
      occupied,
      versionFeatures,
    }
  };
};
export const actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    const formAgentId = formData.get('agentId') as string;

    query = formData.get('query') as string;
    agentId = formAgentId ? Number(formAgentId) : null;
    type = formData.get('type') as string;
    occupied = formData.get('occupied') as string;
    versionFeatures = formData.get('versionFeatures') as string;
    page = 1;
  },
  gotoPage: async ({ request }) => {
    const formData = await request.formData();
    pageSize = Number(formData.get('pageSize'));
    page = Number(formData.get('page'));
  },
  genProductKey: async ({ request }) => {
    const formData = await request.formData();
    const agentId = formData.get('agentId') as string;
    const type = formData.get('type') as string;
    const versionFeatures = formData.get('versionFeatures') as string;
    const num = parseInt(formData.get('num') as string || '1');
    
    await ProductKeyService.genProductKey(Number(agentId), Number(type), Number(versionFeatures), Number(num));
  },
  moveProductKey: async ({ request }) => {
    const formData = await request.formData();
    const agentId = formData.get('agentId') as string || '0';
    const pkIds = formData.getAll('pkIds') as string[];
    const result = await ProductKeyService.moveProductKey(Number(agentId), pkIds);

    if(result === 0){
      return fail(302, {error: 'productKeys.move.error'});
    }

    // 返回成功消息
    return {
      status: 200,
      success: true,
      message: 'productKeys.move.success',
      result
    };
  },
  reserveProductKey: async ({ request }) => {
    const formData = await request.formData();
    const pkIds = formData.getAll('pkIds') as string[];
    const reserveType = formData.get('reserveType') as string;
    const memo = formData.get('memo') as string || '';

    const result = await ProductKeyService.reserveProductKey(Number(reserveType), pkIds, memo);

    if(result === 0){
      return fail(302, {error: reserveType == '0' ? 'productKeys.reserve.error' : 'productKeys.cancelReserve.error'})
    }

    // 返回成功消息
    return {
      status: 200,
      success: true,
      message: reserveType == '0' ? 'productKeys.reserve.success' : 'productKeys.cancelReserve.success',
      result,
    };
  }
} satisfies Actions;