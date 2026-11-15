import type { School } from "../api/user/types.ts";

/**
 * 与 fdfz-student-id 后端保持一致的表单校验规则。
 * 后端会在接口层再次校验，这里的规则只用于提前反馈，避免用户提交后才看到错误。
 */

/** 用户名：4-32 位字母、数字、下划线或连字符。 */
export function isValidUsername(value: string): boolean {
  return /^[a-zA-Z0-9_-]{4,32}$/.test(value);
}

/** 密码：8-32 位，至少包含大写字母、小写字母和数字，允许常见符号。 */
export function isValidPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?\x60~]{8,32}$/.test(
    value,
  );
}

/** 昵称长度按字符（码点）计算，避免 emoji 等字符被 UTF-16 长度误判。 */
export function nicknameLength(value: string): number {
  return Array.from(value).length;
}

/** 昵称：1-32 个字符，内容不限（不允许 NUL 与换行，与后端正则保持一致）。 */
export function isValidNickname(value: string): boolean {
  const length = nicknameLength(value);
  return length >= 1 && length <= 32 && !/[\0\r\n]/.test(value);
}

/** 真实姓名：1-4 个汉字，允许间隔号「·」。 */
export function isValidRealName(value: string): boolean {
  return /^[\u4e00-\u9fff\u00b7]{1,4}$/.test(value);
}

/** 学号：青浦分校为 9 位数字，其他学校为 8 位数字。 */
export function isValidStudentNum(value: string, school: School): boolean {
  return school === "ffqp" ? /^\d{9}$/.test(value) : /^\d{8}$/.test(value);
}

/** 邮箱：限制总长 254，与后端一样只做宽松格式检查。 */
export function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** QQ 号：5-12 位、非 0 开头的数字。 */
export function isValidQQ(value: string): boolean {
  return /^[1-9]\d{4,11}$/.test(value);
}

/** TOTP 验证码：6 位数字。 */
export function isValidTOTPCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

/** 注册申请 ID：后端使用 UUID v7。 */
export function isValidRegisterRequestID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
