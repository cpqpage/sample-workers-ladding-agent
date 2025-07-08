import { CompanyDao } from "../dao/CompanyDao";

export const CompanyService = {
    findById: async (companyId: number) => {
        const companyDao = new CompanyDao();
        const company = await companyDao.findById(companyId);
        return company;
    },

    updateLicense: async (companyId: number, license: number) => {
        const companyDao = new CompanyDao();
        const company = await companyDao.findById(companyId);
        if(company && company.license != license){
            company.license = license;
            await companyDao.saveOrUpdate(company);
        }
    }
}