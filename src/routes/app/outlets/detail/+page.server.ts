import { ProductKeyService } from '$lib/server/service/productKeyService';
import { OutletService } from '$service/outletService';
import type { PageServerLoad } from './$types';
import { type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({url, locals: {outlet}}) => {
  const id = url.searchParams.get('outletId');
  const outletDetailData = await OutletService.getOutletDetailData(outlet.id, outlet.type, Number(id));
  const editOutlet = outletDetailData.outlet;
  let rj = {
    tradeNo: '',
    wangwang: '',
    qq: '',
    remark: ''
  }

  const remark = editOutlet.remark as string;
  if(remark){
    try {
      rj = JSON.parse(remark);
    } catch (e) {
      rj.remark = remark;
    }
  }
  return {...outletDetailData, now: new Date(), rj};
};

export const actions: Actions = {
  outletBatOparation: async ({request, locals: {outlet}}) => {
    const formData = await request.formData();
    const outletActiveAction = formData.get('type');
    const outletId = formData.get('outletId');
    OutletService.outletBatOparation(Number(outletId), Number(outletActiveAction));
  },
  modifyOutletRemark: async ({request, locals: {outlet}}) => {
    const formData = await request.formData();
    const outletId = formData.get('outletId');
    const tradeNo = formData.get('tradeNo');
    const wangwang = formData.get('wangwang');
    const qq = formData.get('qq');
    const others = formData.get('remark');
    const remark = {
      tradeNo: tradeNo,
      wangwang: wangwang,
      qq: qq,
      remark: others
    }
    OutletService.updateOutletRemark(Number(outletId), JSON.stringify(remark));
  },
  pickupProductKey: async ({request, locals: {outlet}}) => {
    const formData = await request.formData();
    const agentId = formData.get('agentId');
    const keyType = formData.get('keyType');
    const versionFeatures = formData.get('versionFeatures');
    
    const productKey = await ProductKeyService.pickupProductKey(Number(outlet.id), Number(agentId), Number(keyType), Number(versionFeatures));
    return {
      productKey: productKey
    }
  },
  checkProductKey: async ({request, locals: {outlet}}) => {
    const formData = await request.formData();
    const productKey = formData.get('productKey');
    const outletId = formData.get('outletId');
    const result = await ProductKeyService.checkProductKey(Number(outletId), productKey as string);
    return result;
  },
  upgrade: async ({request, locals: {outlet}}) => {
    const formData = await request.formData();
    const outletId = formData.get('outletId');
    const tradeNo = formData.get('tradeNo');
    const wangwang = formData.get('wangwang');
    const qq = formData.get('qq');
    const remark = formData.get('remark');
    const key = formData.get('key');
    const giftFlag = formData.get('giftFlag');
    const ut = formData.get('ut');
    const desc = {
      tradeNo: tradeNo,
      wangwang: wangwang,
      qq: qq,
      remark: remark
    }
    const result = await ProductKeyService.upgrade(Number(outletId), JSON.stringify(desc), key as string, Number(giftFlag), Number(ut));
    
    return {result: result}
  }
}

// 判断 outlet.remark 是否为 JSON 格式的工具函数
function isJsonRemark(remark: string | undefined): boolean {
  if (!remark) return false;
  try {
    const obj = JSON.parse(remark);
    return typeof obj === 'object' && obj !== null;
  } catch (e) {
    return false;
  }
}