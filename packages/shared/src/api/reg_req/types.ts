import type { DateString } from "../../utils/types.ts";
import type { School, UserType } from "../user/types.ts";

export type RegisterRequestStatus = "pending" | "approved" | "rejected";

export interface RegisterRequest {
  id: string;

  type: UserType;
  student_num: string | null;
  real_name: string;
  school: School;

  username: string;
  nickname: string | null;

  created_at: DateString;
  status: RegisterRequestStatus;
  created_user_id: number | null;
  reviewer_user_id: number | null;
  review_comment: string | null;
  reviewed_at: DateString | null;
}
