import CryptoJS from "crypto-js";
// import { sha256 } from "js-sha256";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const salt: string = 'salt';
/**
 * 合并密码和盐
 * 参照：
 * org.springframework.security.authentication.encoding.BasePasswordEncoder.mergePasswordAndSalt(String, Object, boolean)
 * @param password 密码
 * @param salt 盐
 * @param strict 是否严格
 * @returns 合并后的密码
 */
const mergePasswordAndSalt =  (password: string, salt: string | null, strict: boolean): string=>{
    if(password == null){
        password = '';
    }

    if (strict && (salt != null)) {
        if ((salt.toString().lastIndexOf("{") != -1) || (salt.toString().lastIndexOf("}") != -1)) {
            throw new Error("Cannot use '{' or '}' in salt.");
        }
    }
    
    if ((salt == null) || salt == "") {
        return password;
    }

    return password + "{" + salt + "}";
}

/**
 * 生成密码
 * 参照：org.springframework.security.authentication.encoding.MessageDigestPasswordEncoder.encodePassword(String, Object)
 * 
 * @param password 密码
 * @param salt 盐
 * @returns 密码
 */
export function generatePassword(password: string, salt: string | null = null): string {
    // 合并密码和盐
    const saltedPassword = mergePasswordAndSalt(password, salt, false);
    // 使用SHA-1算法（Spring Security默认算法）
    const hash = CryptoJS.SHA1(saltedPassword).toString();
    return hash;
}