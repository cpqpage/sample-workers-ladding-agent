import type { PageServerLoad } from './$types';
import { ReportService } from '$service/reportService';
import type { Env } from '$lib/server/model';

export const load: PageServerLoad = async ({ locals: { user, outlet }, platform }) => {
    const dashboardData = await ReportService.getDashboardData(user, outlet);

    return {
        ...dashboardData
    }
}

