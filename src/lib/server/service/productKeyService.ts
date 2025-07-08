import { OutletDao } from "$dao/OutletDao";
import { ProductKeyDao } from "$dao/ProductKeyDao";
import { ProductKey } from "$model/schema";
import dayjs from "dayjs";
import { CompanyDao } from "../dao/CompanyDao";
import { UpgradeLogDao } from "../dao/UpgradeLogDao";
import { genKey, checkKey } from "../utils/keyUtil";
import { AgentService } from "./agentService";
import { UpgradeLogService } from "./upgradeLogService";
import { OutletService } from "./outletService";
import { CompanyService } from "./companyService";

export const ProductKeyService = {
    /**
     * 获取产品密钥列表数据
     * @param agentId 门店ID
     * @param currentOutletType 门店类型
     * @param query 查询条件
     * @param page 页码
     * @param pageSize 每页大小
     * @returns 产品密钥列表数据
     * @throws {Error} 如果查询失败
     */
    getProductKeyListData: async (currentOutletId: number, currentOutletType: string, agentId: number | null, query: string, type: string, occupied: string, versionFeatures: string, page: number, pageSize: number) => {
        const productKeyDao = new ProductKeyDao();
        
        if(!agentId || agentId === 0) {
            agentId = currentOutletId;
        }

        const productKeys = await productKeyDao.findProductKeyList(agentId, query, type, occupied, versionFeatures, page, pageSize);
        const count = await productKeyDao.queryProductKeyCount(agentId, query, type, occupied, versionFeatures);
        const pageCount = Math.max(1, Math.ceil(count / pageSize));

        const {agentMap, agentTree} = await AgentService.getAgentTree(currentOutletId, currentOutletType);

        return {
            productKeys,
            agentMap,
            agentTree,
            pageCount
        };
    },
    genProductKey: async (agentId: number, type: number, versionFeatures: number, count: number) => {
        const now = new Date();
        const list: typeof ProductKey["$inferSelect"][] = [];

        for(let i = 0; i < count; i++){
            const key = genKey(type == 1 ? 1 : 0, type == 1 ? 12 : 0, now);
            if(key === "") {
                continue
            }
            const productKey = {} as typeof ProductKey["$inferSelect"];
            productKey.type = type;
            productKey.productKey = key;
            productKey.monthCount = type == 1 ? 12 : 0;
            productKey.occupied = 0;
            productKey.outletId = 0;
            productKey.agentId = agentId;
            productKey.userId = 0;
            productKey.createDate = dayjs(now).format("YYYY-MM-DD HH:mm:ss");
            productKey.versionFeatures = versionFeatures;
            
            list.push(productKey);
        }
        const productKeyDao = new ProductKeyDao();
        for(const pk of list){
            await productKeyDao.saveOrUpdate(pk);
        }
    },
    moveProductKey: async(agentId: number, pkIds: string[]) => {
        const productKeyDao = new ProductKeyDao();
        const outletDao = new OutletDao();
        const outlet = await outletDao.findById(agentId);
        if(outlet) {
            const productKeys = await productKeyDao.findProductKeys(pkIds, 0);
            for(const pk of productKeys) {
                pk.agentId = agentId;
                pk.updateDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
                await productKeyDao.saveOrUpdate(pk);
            }
            return productKeys.length;
        }
        return 0;
    },
    /**
     * 标记产品密钥为预留或取消标记
     * @param pkIds 产品密钥ID列表
     * @param reserveType 预留类型，1表示取消标记，0表示标记为预留
     * @throws {Error} 如果操作失败
     */
    reserveProductKey: async(reserveType: number, pkIds: string[], memo: string) =>{
        const productKeyDao = new ProductKeyDao();
        //取消预留标记时，查询标记为预留的产品密钥
        //标记为预留时，查询未标记的产品密钥
        const occupied = reserveType === 1 ? 2 : 0;
        const productKeys = await productKeyDao.findProductKeys(pkIds, occupied);
        
        const updateOccupied = reserveType === 1 ? 0 : 2;
        for(const pk of productKeys) {
            pk.occupied = updateOccupied;
            pk.memo = memo;
            pk.updateDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
            await productKeyDao.saveOrUpdate(pk);
        }
        
        return productKeys.length;
    },
    cancelProductKey: async(outletId: number) => {
        const outletDao = new OutletDao();
        const outlet = await outletDao.findById(outletId);
        if(outlet) {
            const companyId = outlet.companyId as number;
            const upgradeLogDao = new UpgradeLogDao();
            const upgradeLogs = await upgradeLogDao.getAllUpgradeLogListByOutletId(outletId);
            const size = upgradeLogs.length;
            if(size > 0){
                const now = new Date();
                const companyDao = new CompanyDao();
                const company = await companyDao.findById(companyId);

                const allOutlets = await outletDao.findOutletListInCompany(companyId);
                const outletQty = allOutlets.length;

                //如果只有一条升级记录:
    			//撤回未注册状态:当前店PK和到期时间设为null,店铺类型设为单店.
    			//处理公司授权(license):如果店铺数量只有1个,撤消company授权;如果店数大于1,查询其它店铺有无注册,如果都没有注册的,则company也撤消授权.
                let license = 0;
    			if(size == 1){
                    outlet.productKey = '';
    				outlet.expiryDate = null;
        			outlet.type = "0";
        			
        			if(outletQty == 1){//只有一个店铺
        				license = 0;
        			} else if(outletQty > 1){
        				let pkFlag = false;
            			for(const otl of allOutlets){
            				if(otl.id != outlet.id && otl.productKey){
            					//有一个其它店铺是有注册码的
            					pkFlag = true;
        						break;
            				}
            			}
        				
        				//没有有注册码的其它店铺
                        license = pkFlag ? 1 : 0;//重置授权状态
        			}
                }//如果多条未撤消的升级记录:
    			//按时间倒序查找上一次未标记为撤消的"升级"记录(第2条),回到上一次状态：使用上一个状态的到期时间与注册码。
    			else {
        			const ul = upgradeLogs[1];//最新的第2条，为上一次的状态
        			outlet.expiryDate = ul.finalExpiryDate;
        			outlet.productKey = ul.productKey;
        			
                    license = 1;
        		}

                await CompanyService.updateLicense(companyId, license);

                outlet.updateDate = dayjs(now).format("YYYY-MM-DD HH:mm:ss");
                await outletDao.saveOrUpdate(outlet);

                //############ 分割线 ##############
    			
    			//以下是更新店铺状态后的动作:ABC
    			
    			//A:原升级记录(第1条)的撤消标记设为1.
                const ul0 = upgradeLogs[0];
                ul0.cancelFlag = 1;
                await upgradeLogDao.saveOrUpdate(ul0);

                //B.原使用的注册码占用状态设为撤消状态(-1),且保留原使用店铺信息(?)
                const productKey = upgradeLogs[0].productKey as string;
                const productKeyDao = new ProductKeyDao();
                const productKeys = await productKeyDao.findProductKeyByOutletId(productKey, outletId);
                if(productKeys.length > 0){
                    const pk = productKeys[0];
                    pk.occupied = -1;
                    pk.updateDate = dayjs(now).format("YYYY-MM-DD HH:mm:ss");
                    await productKeyDao.saveOrUpdate(pk);

                    //C:插入撤消记录(upgradeType=-1)
                    await UpgradeLogService.insertCancelUpgradeLog(outletId, productKey, ul0, pk);
                }
            }
        }
    },
    pickupProductKey: async(outletId: number, agentId: number, pkType: number, versionFeatures: number) => {
        const productKeyDao = new ProductKeyDao();
        if(!agentId || agentId === 0) {
            agentId = outletId;
        }
        
        const productKeys = await productKeyDao.pickupProductKey(agentId, pkType, versionFeatures);
        if(productKeys) {
            return productKeys.productKey;
        }

        return '';
    },
    checkProductKey: async(outletId: number, productKeyCode: string) => {
        const productKeyDao = new ProductKeyDao();
        
        let flag = false;
        let productKey: typeof ProductKey["$inferSelect"] | null = null;
		let productKeys = await productKeyDao.findProductKeysByProductKeyCode(productKeyCode);
		if(productKeys != null && productKeys.length > 0){
            productKey = productKeys[0];
			flag = checkKey(productKeyCode, productKey.monthCount || 0, dayjs(productKey.createDate).toDate());
		}
		
        let json: Record<string, unknown> = {};
		json.result = 0;
        json.alert = false;
        json.message = null;
		if(flag){
			const outletDao = new OutletDao();
			const outlet = await outletDao.findById(outletId);
			if(outlet?.productKey){
				const curVer = outlet.versionFeatures || 0; //当前店铺的版本特性
				const curType = outlet.expiryDate == null ? 0 : 1; 
				const ver = productKey?.versionFeatures;
				const type = productKey?.type;
				
				const curVerMsg = ProductKeyService.getVerMsg(curVer);//续费前 版本特性
				const curTypeMsg = ProductKeyService.getTypeMsg(curType);//续费前 期限类型
				const verMsg = ProductKeyService.getVerMsg(ver as number);//续费后 版本特性
				const typeMsg = ProductKeyService.getTypeMsg(type as number);//续费后 期限类型
				
				let upgradeMsg = "outlet.detail.upgradeModal.alert.upgrade";
				let upgrade = "outlet.detail.upgrade";
                let upgradeMsgParams: Record<string, unknown> | null = {curVerMsg, curTypeMsg, verMsg, typeMsg, upgrade};

				if(curVer == ver){
					//续费后版本特性不变的
					if(type == 1){
						//续费提示消息
                        upgradeMsg = "outlet.detail.upgradeModal.alert.renew";
                        upgradeMsgParams = null;
					}
				} else {
					//续费后版本特性不同的
					if(curVer == 1){
                        upgradeMsgParams.upgrade = "outlet.detail.upgradeModal.alert.reduce";
					}
				}
				
				json.alert = true;
                json.message = {
                    msg: upgradeMsg,
                    params: upgradeMsgParams
                }
			}
			json.result = 1;
		}

        return json;
    },
    getVerMsg(ver: number){
		return ver == 1 ? "outlet.versionFeatures.1" : "outlet.versionFeatures.0";
	},
    getTypeMsg(type: number){
		return type == 0 ? "outlet.detail.upgrade_log.key_type.0" : "outlet.detail.upgrade_log.key_type.1";
	},
    upgrade: async(outletId: number, desc: string, keyCode: string, giftFlag: number, ut: number) => {
        if(!keyCode){
            return 0;
        }
        keyCode = keyCode.trim();
        const productKeyDao = new ProductKeyDao();
        //key需要做:
		//1,在KEY库里存在，且不是已使用(未用与撤消)。
		//2,通过校验。
		let flag = false;
		let monthCount = 0;
		let productKey = {} as typeof ProductKey["$inferSelect"];
		
		let productKeys = await productKeyDao.findProductKeysByProductKeyCode(keyCode);
		if(productKeys && productKeys.length > 0){
			productKey = productKeys[0];
			monthCount = productKeys[0].monthCount || 0;
			flag = checkKey(keyCode, monthCount, dayjs(productKeys[0].createDate).toDate());
		}
		
		const now = new Date();
		let signDate: Date = new Date();

		if(flag){
			//更新店铺：type为连锁版,插入key,设置到期时间expiryDate(采用月租方式)
			const outletDao = new OutletDao();
			let outlet = await outletDao.findById(outletId);
			if(outlet){
                if(ut == 0){
                    //首次升级时，如果有注册过，则到期时间从首次注册时间起算 ADD BY CPQ 20171130
                    const upgradeLogDao = new UpgradeLogDao();
                    const upgradeLogs = await upgradeLogDao.getAllUpgradeLogListByOutletId(outletId);
                    if(upgradeLogs && upgradeLogs.length > 0){
                        signDate = dayjs(upgradeLogs[0].upgradeDate).toDate();
                    }
                }
                
                let expiryDate: Date | null = null;
                let currentDay =  dayjs(signDate).format("YYYY-MM-DD");
                if(monthCount!=0){				
                    if(ut == 1){
                        if(outlet.expiryDate){
                            const nowDay = dayjs(now);
                            const expiryDay = dayjs(outlet.expiryDate);
                            currentDay = (nowDay.isBefore(expiryDay) ? expiryDay : nowDay).format("YYYY-MM-DD");
                        }
                    }
                    
                    expiryDate = dayjs(currentDay).add(monthCount, "month").toDate();
                }

                //更新company：license为1
                if(ut == 0){
                    await CompanyService.updateLicense(outlet.companyId || 0, 1);
                }

                //更新店铺信息
                await OutletService.updateOutletProductKey(outlet, keyCode, expiryDate, desc, now, productKey);
                
                //插入更新日志
                await UpgradeLogService.insertUpgradeLog(outletId, keyCode, dayjs(currentDay).toDate(), expiryDate, ut, giftFlag, productKey);
                
                //修改PK使用状态
                productKey.occupied = 1;
                productKey.outletId = outletId;
                productKey.updateDate = dayjs(now).format("YYYY-MM-DD HH:mm:ss");
                
                await productKeyDao.saveOrUpdate(productKey);
                
                
                //返回升级成功的提示					
                return 1;
			}
		}
        return 0;
    }
}