import { OutletDao } from "$dao/OutletDao";
import { UserDao } from "$dao/UserDao";
import { User } from "$model/schema";
import dayjs from "dayjs";
import { generatePassword } from "../utils/password";
import { genRandomNumber } from "../utils/randomNumber";
import type { AgentUserVo } from "../value/agentUserVo";

export const UserService = {
    findByEmail: async (email: string): Promise<typeof User.$inferSelect | null> => {
        const userDao = new UserDao();
        const user = await userDao.findByEmail(email);
        if(user == null) {
            return null;
        }
        return user;
    },
    getAgentListData: async (outletId: number, outletType: string, query: string, page: number, pageSize: number) => {
        const userDao = new UserDao();
        const agentUserList = await userDao.findAgentUserList(outletId, outletType, query, page, pageSize);
        const total = await userDao.findAgentUserListCount(outletId, outletType, query);
        const pageCount = Math.ceil(total / Number(pageSize));
        
        return {
            userList: agentUserList,
            total,
            pageCount
        }
    },
    getAgentUserForEdit: async (userId: number): Promise<typeof User.$inferSelect> => {
        const userDao = new UserDao();
        const user = await userDao.findById(userId);

        if(user == null) {
            return {} as typeof User.$inferSelect;
        }

        return user;
    },
    getEditAgentUserData: async (userId: number, outletType: string) => {
        const user = userId ? await UserService.getAgentUserForEdit(userId) : {} as typeof User.$inferSelect;
        const outletDao = new OutletDao();
        const agentList = await outletDao.findAgentListForEditAgentUser(outletType);
        
        return {
            editUser: user,
            agentList: agentList
        };
    },
    /**
     * 保存代理商用户
     * @param user 代理商用户
     */
    saveAgentUser: async (userData: AgentUserVo) => {
        const userDao = new UserDao();
        
        const editUser = await UserService.getAgentUserForEdit(userData.id);
        
        editUser.email = userData.email;
        editUser.phoneNumber = userData.phoneNumber;
        if(userData.password?.length > 0){
            editUser.password = generatePassword(userData.password);
        }
        editUser.accountEnabled = userData.accountEnabled ? 1 : 0;
        editUser.outletId = userData.outletId;
        if(editUser.id == 0){
            editUser.createDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
            editUser.companyId = -2;
            editUser.username = "8" + genRandomNumber(7);
            editUser.userCode = editUser.username;
            editUser.delFlag = 0;
        }
        editUser.updateDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");

        await userDao.saveOrUpdate(editUser);
    }
}

