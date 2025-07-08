import { UpgradeLogService } from '$service/upgradeLogService';
import dayjs from 'dayjs';
import type {Actions, PageServerLoad } from './$types';

let page = 1;
let pageSize = 50;
let agentId: number | null = null;
let type = '';
let occupied = '';
let versionFeatures = '';
let giftFlag: number | null = null;
let startDate = dayjs().date(1).format('YYYY-MM-DD');
let endDate = dayjs().date(dayjs().daysInMonth()).format('YYYY-MM-DD');;

export const load: PageServerLoad = async ({locals: {outlet}}) => {
  const currentOutletId = outlet.id;
  const currentOutletType = outlet.type;
  if(!agentId) {
    agentId = currentOutletId.toString(); // 默认当前代理商
  }

  const settleData = await UpgradeLogService.getSettleData(
    currentOutletId,
    currentOutletType,
    agentId,
    type,
    occupied,
    giftFlag,
    versionFeatures,
    startDate,
    endDate,
    page,
    pageSize
  );

  return {
    ...settleData,
    form: {
      page,
      pageSize,
      agentId,
      type,
      occupied,
      versionFeatures,
      giftFlag,
      startDate,
      endDate,
    }
  };
};
export const actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    const formAgentId = formData.get('agentId') as string;
    const formGiftFlag = formData.get('giftFlag') as string;

    page = 1; // 重置页码
    agentId = formAgentId ? Number(formAgentId) : null;
    type = formData.get('type') as string;
    occupied = formData.get('occupied') as string;
    versionFeatures = formData.get('versionFeatures') as string;
    giftFlag = formGiftFlag ? Number(formGiftFlag) : null;
    startDate = formData.get('startDate') as string;
    endDate = formData.get('endDate') as string;

  },
  gotoPage: async ({ request }) => {
    const formData = await request.formData();
    pageSize = Number(formData.get('pageSize'));
    page = Number(formData.get('page'));
  },
} satisfies Actions;