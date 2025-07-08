import { JWT_SECRET, JWT_REFRESH_SECRET, JWT_TOKEN_EXPIRE_TIME, JWT_TOKEN_EXPIRE_TIME_REFRESH } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { BaseDao } from '$lib/server/dao/BaseDao';
import { TokenBlacklist } from '$model/schema';
import { and, eq, gt, sql } from 'drizzle-orm';

class TokenBlacklistDao extends BaseDao<typeof TokenBlacklist> {
    private static readonly ADD_TO_BLACKLIST_SQL = `INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)`;
    private static readonly CHECK_BLACKLIST_SQL = `SELECT * FROM token_blacklist WHERE token = ? AND expires_at > CURRENT_TIMESTAMP`;

    constructor() {
        super(TokenBlacklist);
    }

    public async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
        await this.create({ token, expiresAt });
    }

    public async isBlacklisted(token: string): Promise<boolean> {
        //token = ? AND expires_at > CURRENT_TIMESTAMP
        const result = await this.findOne(and(eq(TokenBlacklist.token, token), sql`${TokenBlacklist.expiresAt} > CURRENT_TIMESTAMP`));
        return result !== null;
    }
}

const tokenBlacklistDao = new TokenBlacklistDao();

export function generateToken(payload: object, expiresIn: number | '1 days' = Number(JWT_TOKEN_EXPIRE_TIME)): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function generateTokenByPayload(payload: object): string {
    return jwt.sign(payload, JWT_SECRET);
}

export function generateRefreshToken(payload: object, expiresIn: number | "7 days" = Number(JWT_TOKEN_EXPIRE_TIME_REFRESH)): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

export async function verifyToken(token: string): Promise<object | string> {
    try {
        // 检查 token 是否在黑名单中
        if (await tokenBlacklistDao.isBlacklisted(token)) {
            return "blacklisted";
        }
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error(error);
        return "error";
    }
}

export async function verifyRefreshToken(token: string): Promise<object | string> {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        console.error(error);
        return "error";
    }
}

export async function revokeToken(token: string): Promise<void> {
    try {
        const decoded = jwt.decode(token) as { exp: number };
        if (decoded && decoded.exp) {
            const expiresAt = new Date(decoded.exp * 1000);
            await tokenBlacklistDao.addToBlacklist(token, expiresAt);
        }
    } catch (error) {
        console.error('Error revoking token:', error);
    }
}
