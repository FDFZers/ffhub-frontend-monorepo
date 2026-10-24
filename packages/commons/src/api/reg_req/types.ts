import type { DateString } from "../../utils/types.ts";
import type { School, UserType } from "../user/types.ts";

export type RegisterRequestStatus = "pending" | "approved" | "rejected";

export interface RegisterRequest {
  id: string;

  type: UserType;
  student_num?: string;
  real_name: string;
  school: School;

  username: string;
  nickname?: string;
  password: string;

  created_at: DateString;
  status: RegisterRequestStatus;
  created_user_id?: number;
  reviewer_user_id?: number;
  review_comment?: string;
  reviewed_at?: DateString;
}
