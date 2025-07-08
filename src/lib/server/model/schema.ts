import { sqliteTable, integer, primaryKey, text, numeric, index } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const Role = sqliteTable("role", {
	id: integer().primaryKey().notNull(),
	roleLevel: text("role_level", { length: 50 }).default("sql`(NULL)`"),
	name: text({ length: 50 }).default("sql`(NULL)`"),
	description: text({ length: 255 }).default("sql`(NULL)`"),
	companyId: integer("company_id").default(0),
	priceAuth: text("price_auth", { length: 255 }).default("sql`(NULL)`"),
});

export const UserRole = sqliteTable("user_role", {
	userId: integer("user_id").notNull(),
	roleId: integer("role_id").notNull(),
},
(table) => [
	primaryKey({ columns: [table.userId, table.roleId], name: "user_role_user_id_role_id_pk"})
]); 

export const UserLog = sqliteTable("user_log", {
	id: integer().primaryKey({ autoIncrement: true }),
	companyId: integer("company_id"),
	outletId: integer("outlet_id"),
	userId: integer("user_id"),
	action: text(),
	datetime: numeric(),
	remark: text(),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
});

export const User = sqliteTable("app_user", {
	id: integer().primaryKey({ autoIncrement: true }),
	companyId: integer("company_id").default(0),
	outletId: integer("outlet_id").default(0),
	accountExpired: numeric("account_expired").notNull(),
	accountLocked: numeric("account_locked").notNull(),
	address: text(),
	city: text(),
	country: text(),
	postalCode: text("postal_code"),
	province: text(),
	credentialsExpired: numeric("credentials_expired").notNull(),
	email: text(),
	accountEnabled: integer("account_enabled"),
	firstName: text("first_name"),
	lastName: text("last_name"),
	password: text().notNull(),
	passwordHint: text("password_hint"),
	phoneNumber: text("phone_number"),
	username: text(),
	userCode: text("user_code"),
	weiboId: text("weibo_id"),
	weiboName: text("weibo_name"),
	qqId: text("qq_id"),
	qqName: text("qq_name"),
	wxOpenId: text("wx_open_id"),
	version: integer(),
	website: text(),
	delFlag: integer("del_flag"),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
	updateDate: numeric("update_date").default(sql`(CURRENT_TIMESTAMP)`),
	primaryUser: integer("primary_user").default(0),
	settings: text(),
});

export const Outlet = sqliteTable("outlet", {
	id: integer().primaryKey({ autoIncrement: true }),
	keyid: integer(),
	companyId: integer("company_id"),
	deptId: integer("dept_id"),
	type: text(),
	name: text(),
	outletCode: text("outlet_code"),
	state: text(),
	city: text(),
	street: text(),
	address: text(),
	industry: text(),
	email: text(),
	phone: text(),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
	updateDate: numeric("update_date").default(sql`(CURRENT_TIMESTAMP)`),
	outletEnabled: integer("outlet_enabled").default(1),
	delFlag: integer("del_flag").default(0),
	agentId: integer("agent_id").default(0),
	productKey: text("product_key"),
	startDate: numeric("start_date"),
	expiryDate: numeric("expiry_date"),
	appId: text("app_id"),
	appSecret: text("app_secret"),
	wxKey: text("wx_key"),
	netshopEnabled: integer("netshop_enabled").default(0),
	isMainShop: integer("is_main_shop").default(0),
	posDisabled: integer("pos_disabled").default(0),
	netshopId: integer("netshop_id").default(0),
	logo: text(),
	remark: text(),
	wxMchId: text("wx_mch_id"),
	netshopLevel: integer("netshop_level"),
	wxCustomerEnabled: integer("wx_customer_enabled").default(0),
	country: text(),
	versionFeatures: integer("version_features"),
});

export const Company = sqliteTable("company", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text(),
	companyCode: text("company_code"),
	industry: text(),
	country: text(),
	state: text(),
	city: text(),
	street: text(),
	postcode: text(),
	phone: text(),
	fax: text(),
	email: text(),
	website: text(),
	outletQty: integer("outlet_qty").default(0),
	license: integer().default(1),
	companyEnabled: integer("company_enabled").default(1),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
	updateDate: numeric("update_date").default(sql`(CURRENT_TIMESTAMP)`),
	countryCode: text("country_code").default("86"),
});

export const ProductKey = sqliteTable("product_key", {
	id: integer().primaryKey({ autoIncrement: true }),
	type: integer().default(0),
	productKey: text("product_key"),
	monthCount: integer("month_count").default(0),
	occupied: integer().default(0),
	outletId: integer("outlet_id").default(0),
	agentId: integer("agent_id").default(0),
	userId: integer("user_id").default(0),
	memo: text(),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
	updateDate: numeric("update_date").default(sql`(CURRENT_TIMESTAMP)`),
	versionFeatures: integer("version_features"),
});

export const WebPaySetting = sqliteTable("web_pay_setting", {
	id: integer().primaryKey({ autoIncrement: true }),
	companyId: integer("company_id"),
	outletId: integer("outlet_id"),
	channelType: integer("channel_type").default(0),
	payType: integer("pay_type"),
	wxAppid: text("wx_appid"),
	wxKey: text("wx_key"),
	wxMchId: text("wx_mch_id"),
	alipayPartnerId: text("alipay_partner_id"),
	alipayAppid: text("alipay_appid"),
	alipayAppPrivateKey: text("alipay_app_private_key"),
	alipayAppPublicKey: text("alipay_app_public_key"),
	spKey: text("sp_key"),
	spMchId: text("sp_mch_id"),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
	updateDate: numeric("update_date").default(sql`(CURRENT_TIMESTAMP)`),
});

export const SmsCondition = sqliteTable("sms_condition", {
	id: integer().primaryKey({ autoIncrement: true }),
	companyId: integer("company_id"),
	outletId: integer("outlet_id"),
	qty: integer(),
	usedQty: integer("used_qty"),
	remark: text(),
	createDate: numeric("create_date").default(sql`(CURRENT_TIMESTAMP)`),
	updateDate: numeric("update_date").default(sql`(CURRENT_TIMESTAMP)`),
	userId: integer("user_id"),
	smsType: integer("sms_type").default(1),
});

export const TokenBlacklist = sqliteTable("token_blacklist", {
	id: integer().primaryKey({ autoIncrement: true }),
	token: text().notNull(),
	expiresAt: numeric("expires_at").notNull(),
	createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const Resource = sqliteTable("resource", {
	id: integer().primaryKey({ autoIncrement: true }),
	resourceName: text("resource_name"),
	resourceStr: text("resource_str"),
	resourceDesc: text("resource_desc"),
	resourceType: text("resource_type").default("USER"),
	enabled: integer().default(0),
});

export const RoleResource = sqliteTable("role_resource", {
	roleId: integer("role_id").notNull(),
	resourceId: integer("resource_id").notNull(),
},
(table) => [
	primaryKey({ columns: [table.roleId, table.resourceId], name: "role_resource_role_id_resource_id_pk"})
]);

export const UpgradeLog = sqliteTable("upgrade_log", {
	id: integer().primaryKey({ autoIncrement: true }),
	upgradeDate: numeric("upgrade_date"),
	outletId: integer("outlet_id").default(0),
	keyType: integer("key_type").default(0),
	productKeyId: integer("product_key_id").default(0),
	productKey: text("product_key"),
	monthCount: integer("month_count").default(0),
	currentExpiryDate: numeric("current_expiry_date"),
	finalExpiryDate: numeric("final_expiry_date"),
	upgradeDesc: text("upgrade_desc"),
	agentId: integer("agent_id").default(0),
	cancelFlag: integer("cancel_flag").default(0),
	upgradeType: integer("upgrade_type").default(0),
	giftFlag: integer("gift_flag"),
});