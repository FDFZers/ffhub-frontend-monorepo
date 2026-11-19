import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

/** 按中文习惯格式化后端返回的时间；无法解析时原样返回。 */
export function formatDateTime(value: string, withSeconds = false): string {
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  return parsed.format(withSeconds ? "YYYY/MM/DD HH:mm:ss" : "YYYY/MM/DD HH:mm");
}
