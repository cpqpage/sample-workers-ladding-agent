import type { Actions, PageServerLoad } from './$types';
import { OutletService } from '$service/outletService';

// 在此处定义表单数据的变量，可在action中改变值，
// Load函数会在 action 结束后重新执行，取到的就是改变后的值
let query = '';

export const load: PageServerLoad = async ({locals: {outlet}}) => {
  const agentsData = await OutletService.getAgentListData(outlet.id, outlet.type, query);

  return {
    ...agentsData,
    //需要返回给画面，才能保持表单数据
    form: {
      query
    }
  };
};

export const actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    query = formData.get('query') as string;

  }
} satisfies Actions;

