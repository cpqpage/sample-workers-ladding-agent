import { UpgradeLog , Outlet} from '$model/schema';

export interface UpgradeLogVo {
    upgradeLog: typeof UpgradeLog.$inferSelect;
    outlet: typeof Outlet.$inferSelect ;
    versionFeatures: number;
}