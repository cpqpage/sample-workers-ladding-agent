import { UpgradeLogDao } from '$dao/UpgradeLogDao';
import type { ProductKey,UpgradeLog } from '$model/schema';
import dayjs from 'dayjs';
import type { UpgradeLogVo } from '../value/upgradLogVo';
import { AgentService } from './agentService';

export const UpgradeLogService = {
    async getSettleData(currentOutletId: number, currentOutletType: string, agentId: number | null, type : string, occupied: string, giftFlag: number | null, versionFeatures: string, startDate: string, endDate: string, page: number, pageSize: number) {
        const upgradeLogDao = new UpgradeLogDao();
        
        if(!agentId){
            agentId = currentOutletId;
        }

        const upgradeList = await upgradeLogDao.getUpgradLogList(agentId, type, occupied, giftFlag, versionFeatures, startDate, endDate);
        const total = await upgradeLogDao.getUpgradLogListCount(agentId, type, occupied, giftFlag, versionFeatures, startDate, endDate);
        const pageCount = Math.max(Math.ceil(total / Number(pageSize)), 1);
        
        const pageList: UpgradeLogVo[] =  [];
        const exportList: UpgradeLogVo[] =  [];
        
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        let subtotalPrice = 0;
        let totalPrice = 0;
        const fullPrice = 100;
        
        for(let i = 0; i < upgradeList.length; i++) {
            const item = upgradeList[i];
            const upgradeLog = item.upgrade_log;
            const outlet = item.outlet;
            const productKey = item.product_key;

            const price = upgradeLog.keyType == 0 ? (fullPrice * (upgradeLog.upgradeType??0)) : 0;
            (upgradeLog as any).price = price;
            
            const vo = {} as UpgradeLogVo;
            vo.upgradeLog = upgradeLog;
            vo.outlet = outlet;
            vo.versionFeatures = productKey.versionFeatures??0;
            
            totalPrice += price;
            exportList.push(vo);

            if(i >= start && i < end) {
                subtotalPrice += price;
                pageList.push(vo);
            }
        }

        const {agentMap, agentTree} = await AgentService.getAgentTree(currentOutletId, currentOutletType);
        
        return {
            pageList,
            exportList,
            total,
            pageCount,
            subtotalPrice,
            totalPrice,
            agentMap,
            agentTree
        };
    },
    async insertCancelUpgradeLog(outletId: number, productKey: string, ul0: typeof UpgradeLog.$inferSelect, pk: typeof ProductKey.$inferSelect) {
        const agentId = pk.agentId ?? 0;
        const keyType = pk.type ?? 0;
        const productKeyId = pk.id;
        const productKeyCode = pk.productKey;
        const monthCount = pk.monthCount;
        const currentExpiryDate = ul0.currentExpiryDate;
        const finalExpiryDate = ul0.finalExpiryDate;
        const upgradeDesc = "撤消";
        const giftFlag = ul0.giftFlag;
        
        await insert(agentId, outletId, keyType, productKeyId, productKeyCode??"", monthCount??0, dayjs(currentExpiryDate).toDate(), dayjs(finalExpiryDate).toDate(), upgradeDesc, giftFlag??0, -1);
    },
    async insertUpgradeLog(outletId: number, keyCode: string, currentDay: Date, expiryDate: Date | null, ut: number, giftFlag: number, pk: typeof ProductKey.$inferSelect) {
        const agentId = pk.agentId??0;
        const keyType = pk.type??0;
        const productKeyId = pk.id;
        const productKeyCode = keyCode;
        const monthCount = pk.monthCount;
        const upgradeDesc = ut == 0 ? "升级" : "续费";//升级备注描述
        
        await insert(agentId, outletId, keyType, productKeyId, productKeyCode, monthCount??0, currentDay, expiryDate, upgradeDesc, giftFlag > 0 ? 1 : 0, 1);
    }
}

async function insert(agentId: number, outletId: number, keyType: number, productKeyId: number, productKeyCode: string, monthCount: number, currentExpiryDate: Date | null, finalExpiryDate: Date | null, upgradeDesc: string, giftFlag: number, upgradeType: number) {
    const upgradeLogDao = new UpgradeLogDao();
    const upgradeLog = {} as typeof UpgradeLog.$inferSelect;
    upgradeLog.upgradeDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    upgradeLog.agentId = agentId;
    upgradeLog.outletId = outletId;
    upgradeLog.keyType = keyType;
    upgradeLog.productKeyId = productKeyId;
    upgradeLog.productKey = productKeyCode;
    upgradeLog.monthCount = monthCount;
    upgradeLog.currentExpiryDate = dayjs(currentExpiryDate).format("YYYY-MM-DD HH:mm:ss");
    upgradeLog.finalExpiryDate = dayjs(finalExpiryDate).format("YYYY-MM-DD HH:mm:ss");
    upgradeLog.upgradeDesc = upgradeDesc;

    upgradeLog.upgradeType = upgradeType; // -1表示撤消
    upgradeLog.cancelFlag = 0;

    upgradeLog.giftFlag = giftFlag; // 赠送标记,从原日志取得

    await upgradeLogDao.saveOrUpdate(upgradeLog);
}
