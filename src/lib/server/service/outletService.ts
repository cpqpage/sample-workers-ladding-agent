import { OutletDao } from "$lib/server/dao/OutletDao";
import { Company, Outlet, ProductKey } from "$model/schema";
import type { AgentVo } from "../value/agentVo";
import { AgentService } from "./agentService";
import { CompanyService } from "./companyService";
import { UserLogDao } from "../dao/UserLogDao";
import { UpgradeLogDao } from "../dao/UpgradeLogDao";
import { WebPaySettingDao } from "../dao/WebPaySettingDao";
import { UserDao } from "../dao/UserDao";
import dayjs from "dayjs";

export const OutletService = {
    findById: async (outletId: number) => {
        const outletDao = new OutletDao();
        const outlet = await outletDao.findById(outletId);

        if(outlet == null) {
            return {...Outlet["$inferSelect"]};
        }
        return outlet;
    },
    /**
     * 获取代理列表数据
     * @param outletId 门店ID
     * @param outletType 门店类型
     * @returns 代理列表数据
     */
    getAgentListData: async (outletId: number, outletType: string, query: string | null = null) => {
        const outletDao = new OutletDao();
        const outlets = await outletDao.findAgentList(outletId, outletType, query);
        const agentMap: Record<number, string> = {};
        outlets.forEach(outlet => {
            agentMap[outlet.id] = outlet.name || "";
        });
        
        return {
            agents: outlets,
            agentMap: agentMap
        };
    },
    /**
     * 获取代理商编辑数据
     * @returns 代理列表
     */
    getEditAgentData: async (outlet: typeof Outlet["$inferSelect"], editId: number) => {
        const outletDao = new OutletDao();
        const isNew = editId == null || editId == 0;
        const editOutlet: typeof Outlet["$inferSelect"] = !isNew ? await OutletService.findById(editId) : {...Outlet["$inferSelect"]};
        const parentAgentList = await outletDao.findParentAgentList();
        
        if(isNew){
            editOutlet.deptId = -2;
        }

        const agentList: Record<string, unknown>[] =  [];
        parentAgentList.forEach(agent => {
            agentList.push(agent);
        });
        
        const levelMap: {level: number, name: string}[] = [];
        const outletType = outlet.type || '0';
        if(outletType > '9'){
            levelMap.push({level: 9, name: "agent.levels.9"});
        }
        if(outletType > '8'){
            levelMap.push({level: 8, name: "agent.levels.8"});
        }
        if(outletType > '7'){
            levelMap.push({level: 7, name: "agent.levels.7"});
        }

        return {
            editOutlet: editOutlet,
            agentMap: agentList,
            levelMap: levelMap
        };
    },
    /**
     * 保存代理
     * @param outlet 代理
     */
    saveAgent: async (outletData: AgentVo) => {
        const outletDao = new OutletDao();

        const editOutlet = await OutletService.findById(outletData.id);
        //将outletData中的值赋给editOutlet
        editOutlet.name = outletData.name;
        editOutlet.type = outletData.type;
        editOutlet.deptId = outletData.deptId;
        editOutlet.state = outletData.state;
        editOutlet.city = outletData.city;
        editOutlet.phone = outletData.phone;
        editOutlet.email = outletData.email;
        editOutlet.remark = outletData.remark;
        editOutlet.country = outletData.country;
        
        if(!editOutlet.id || editOutlet.id == 0) {
            //如果没有id，说明是新增的代理商
            //设置默认值
            //代理商公司Id为-2
            editOutlet.companyId = -2;
            editOutlet.createDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        }
        editOutlet.updateDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        await outletDao.saveOrUpdate(editOutlet);
    },

    getOutletListData: async(params: {
        currentOutletId: number,
        currentOutletType: string,
        query: string,
        agentId: number | null,
        hasProductKey: string,
        multiOutlet: string,
        enabled: string,
        isExpired: string,
        country: string,
        province: string,
        city: string,
        page: number,
        pageSize: number
      }) => {
        //取得所有代理商
        const {agentMap, agentTree} = await AgentService.getAgentTree(params.currentOutletId, params.currentOutletType);
        if(!params.agentId){
            params.agentId = params.currentOutletId;
        }

        const outletDao = new OutletDao();
        
        const { query, agentId, hasProductKey, multiOutlet, 
            enabled, isExpired, country, province, city, page, pageSize } = params;
        
        const transPrams = { query, agentId, hasProductKey, multiOutlet, 
            enabled, isExpired, country, province, city, page, pageSize};
        
        const outletList = await outletDao.findOutletList(transPrams);
        const total = await outletDao.findOutletListCount(transPrams);
        const pageCount = Math.max(1, Math.ceil(total / pageSize));
        
        return {
            list: outletList,
            total,
            pageCount,
            agentMap,
            agentTree
        };
    },
    changeOutletOwner: async (outletIds: string[], agentId: number)=>{
        const outletDao = new OutletDao();
        const outlets = await outletDao.findByIds(outletIds);
        const agent = await outletDao.findById(agentId);

        if(!agent){
            return 0;
        }
        
        let result = 0;
        for(const o of outlets){
            if(o.agentId != agentId){
                o.agentId = agentId;
                outletDao.saveOrUpdate(o);
                
                result++;
            }
        }
        return result;
    },
    getOutletDetailData: async (currentOutletId: number,
        currentOutletType: string, outletId: number) => {
        const outletDao = new OutletDao();
        const outlet = await outletDao.findById(outletId);
        //取得所有代理商
        const {agentMap, agentTree} = await AgentService.getAgentTree(currentOutletId, currentOutletType);
        
        const company = await CompanyService.findById(outlet?.companyId as number);
        const isChain = company?.outletQty && company.outletQty > 1;
        const license = company?.license;
        //连锁店，取得当前店铺(outletId)外的其他店铺
        let outletList;
        if(isChain){
            outletList = await outletDao.findOutletListInCompanyExcludeCurrentOutlet(outlet?.companyId as number, outletId);
        }
        //取得当前店铺的最后登录时间
        const userLogDao = new UserLogDao();
        const userLogList = await userLogDao.findLatestLoginByCompanyIdAndOutletId(outlet?.companyId as number, outletId);
        const lastLoginTime = userLogList.length > 0 ? userLogList[0].datetime : null;
        
        //取得当前店铺的升级记录
        const upgradeLogDao = new UpgradeLogDao();
        const upgradeLogPoList = await upgradeLogDao.getUpgradeLogListByOutletId(outletId);
        const upgradeLogList = upgradeLogPoList.map(upgradeLog => upgradeLog);
        
        //取得移动支付配置
        const webPaySettingDao = new WebPaySettingDao();
        const webPaySettingList = await webPaySettingDao.findByOutletId(outletId);
        let weixinFlag = 0,alipayFlag = 0;
        webPaySettingList.forEach(webPaySetting => {
            if(webPaySetting.payType == 1){
                weixinFlag = 1;
            }
            if(webPaySetting.payType == 2){
                alipayFlag = 1;
            }
        });

        //取得当前店铺的用户列表
        const userDao = new UserDao();
        const userPoList = await userDao.findByOutletId(outletId);
        const userList = userPoList;

        return {
            outlet: (outlet || {...Outlet["$inferSelect"]}),
            agentMap,
            agentTree,
            outletList,
            lastLoginTime,
            upgradeLogList,
            isChain,
            license,
            weixinFlag,
            alipayFlag,
            userList
        };
    },
    outletBatOparation: async (outletId: number, outletActiveAction: number) => {
        const outletDao = new OutletDao();
        const outlet = await outletDao.findById(outletId);
        if(!outlet){
            return;
        }
        outlet.outletEnabled = outletActiveAction == 11 ? 1 : 0;
        await outletDao.saveOrUpdate(outlet);
    },
    updateOutletRemark: async (outletId: number, remark: string) => {
        const outletDao = new OutletDao();
        const outlet = await outletDao.findById(outletId);
        if(!outlet){
            return;
        }
        outlet.remark = remark;
        await outletDao.saveOrUpdate(outlet);
    },
    /**
     * 注册码升级后更新店铺信息
     * @param outlet 
     * @param keyCode 
     * @param expiryDate 
     * @param desc 
     * @param now 
     * @param productKey 
     */
    updateOutletProductKey: async (outlet: typeof Outlet["$inferSelect"], keyCode: string, expiryDate: Date | null, desc: string, now: Date, productKey: typeof ProductKey["$inferSelect"]) => {
        const outletDao = new OutletDao();
        outlet.productKey = keyCode;
        outlet.type = "1";
        outlet.expiryDate = expiryDate ? dayjs(expiryDate).format("YYYY-MM-DD HH:mm:ss") : null;
        outlet.updateDate = dayjs(now).format("YYYY-MM-DD HH:mm:ss");;
        outlet.agentId = productKey.agentId;
        outlet.deptId = 0;
        outlet.keyid = 0;
        outlet.remark = desc;
        outlet.versionFeatures = productKey.versionFeatures;
        outlet.updateDate = dayjs(now).format("YYYY-MM-DD HH:mm:ss");
        outlet.agentId = productKey.agentId;
        outlet.deptId = 0;
        outlet.keyid = 0;
        outlet.versionFeatures = productKey.versionFeatures;

        await outletDao.saveOrUpdate(outlet);
    }
}