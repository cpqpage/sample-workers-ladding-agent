/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Actions, PageServerLoad } from './$types';
import { UserService } from '$service/userService';
import { PUBLIC_PAGE_SIZE } from '$env/static/public';

let query = '';
let page = 1;
let pageSize = Number(PUBLIC_PAGE_SIZE);

export const load: PageServerLoad = async ({locals: {outlet}}) => {
  const agentsUserData = await UserService.getAgentListData(outlet.id, outlet.type, query, page, pageSize);

  return {
    ...agentsUserData,
    form: {
      query,
      page,
      pageSize
    }
  };
};

export const actions = {
  search: async ({ request, url }) => {
    const formData = await request.formData();
    query = formData.get('query') as string;
    page = 1;
  },
  gotoPage: async ({ request }) => {
    const formData = await request.formData();
    pageSize = Number(formData.get('pageSize'));
    page = Number(formData.get('page'));
  }
} satisfies Actions;

