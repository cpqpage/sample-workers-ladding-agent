import { Outlet, User } from "$model/schema";
import { OutletDao } from "$lib/server/dao/OutletDao";
import { CompanyDao } from "$lib/server/dao/CompanyDao";
import { ProductKeyDao } from "$lib/server/dao/ProductKeyDao";
import { WebPaySettingDao } from "$lib/server/dao/WebPaySettingDao";
import { SmsConditionDao } from "$lib/server/dao/SmsConditionDao";
import { UserLogDao } from "$lib/server/dao/UserLogDao";
import dayjs from "dayjs";

export const ReportService = {
    /**
     * 获取首页数据
     * @param user 用户
     * @param outlet 门店
     * @returns 首页数据
     */
    getDashboardData: async (user: any, outlet: any) => {
        const agentIds = await getAgentIds(outlet);

        //上次登录时间
        const lastLoginTime = await getLastLoginTime(user);
        
        const outletData = await getOutletData(user, outlet, agentIds);
        //注册码信息
        const productKeyData = await getProductKeyData(agentIds);
        //移动支付信息
        const webPaySettingData = await getWebPaySettingData();
        //短信信息
        const smsCount = await getSmsConditionData(agentIds);

        return {
            lastLoginTime,
            ...outletData,
            ...productKeyData,
            ...webPaySettingData,
            smsCount,
        }
    }
}

const getSmsConditionData = async (agentIds: string[]) => {
    const smsConditionDao = new SmsConditionDao();
    const smsCount = await smsConditionDao.findSmsConditionCount(agentIds);
    
    return smsCount;
}

const getWebPaySettingData = async () => {
    const webPaySettingDao = new WebPaySettingDao();
    const webPayCount: {total: unknown}[] = await webPaySettingDao.findWebPaySettingCount();
    let wxCount = 0;
    let aliCount = 0;
    webPayCount.forEach(({total}, index) => {
        switch(index){
          case 0:
            wxCount += Number(total);
            break;
          case 1:
            aliCount += Number(total);
            break;
        }
    });

    return {
        wxCount,
        aliCount,
    }
}

const getProductKeyData = async (agentIds: string[]) => {
    const productKeyDao = new ProductKeyDao();
    const pkCounts: { occupied: number; total: number; }[] = await productKeyDao.findProductKeyCount(agentIds);
    
    let allPkCount = 0;
    let unUsedPkCount = 0;
    let usedPkCount = 0;
    let cancelPkCount = 0;
    
    pkCounts?.forEach(({ occupied, total }) => {
        allPkCount += total;
        switch (occupied) {
            case -1:
                cancelPkCount += total;
                break;
            case 0:
                unUsedPkCount += total;
                break;
            case 1:
                usedPkCount += total;
                break;
        }
    });

    return {
        allPkCount,
        unUsedPkCount,
        usedPkCount,
        cancelPkCount,
    }
}

const getOutletData = async (user: any, outlet: any, agentIds: string[]) => {
    const outletDao = new OutletDao();
    const companyDao = new CompanyDao();
    
    const now = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const sevenDaysAgo = dayjs(now).subtract(7, 'day').format("YYYY-MM-DD HH:mm:ss");
    
    //7天活跃用户（店铺）数量
    const agentIdsNumber = agentIds.map(id => Number(id));
    const activeCount = await outletDao.findSevenDaysActiveOutletCount(agentIdsNumber, user.id, sevenDaysAgo, now);
    
    //总店铺数量
    const outletCount = await outletDao.findTotalOutletCount(agentIdsNumber);
    
    //没有注册码的店铺数量
    const unsignCount = await outletDao.findOutletCountWithoutProductKey(agentIdsNumber);

    //总公司数量(仅总代可见)
    let companyCount = 0;
    if(outlet > "8"){
        companyCount = await companyDao.findTotalCompanyCount();
    }

    //微信店铺数量
    const wdCount = await outletDao.findNetShopOutletCount(agentIdsNumber);
    
    return {
        activeCount,
        outletCount,
        unsignCount,
        companyCount,
        wdCount,
    }
}

const getLastLoginTime = async (user: any) => {
    const userLogDao = new UserLogDao();
    const userLogList = await userLogDao.findLastLogin(user.id);
    const lastLogin = userLogList.length > 0 ? userLogList[0] : null;
    const lastLoginTime = lastLogin ? lastLogin.datetime : null;
    return lastLoginTime;
}

const getAgentIds = async (outlet: any): Promise<string[]> => {
    const outletDao = new OutletDao();
    let agentIds: number[] = [];
    if (outlet.type == "8") {
        const agentOutletList = await outletDao.findAgentOutletList(outlet.id);
        agentIds = agentOutletList.map(o => o.id);
    } else if (outlet.type == "7") {
        agentIds = [outlet.id];
    }

    return agentIds.map(p => p?.toString() || '');
}
