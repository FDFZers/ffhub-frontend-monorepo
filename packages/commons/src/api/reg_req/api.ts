import type { DateString } from "../../utils/types.ts";
import type { RegisterRequestStatus } from "./types.ts";

import { request } from "../api.ts";
import { API_AUTH } from "../types.ts";

export interface StatusRequest {
  id: string;
  altcha_payload: string;
}

export interface StatusResponse {
  status: RegisterRequestStatus;
  review_comment?: string;
  reviewed_at?: DateString;
}

export function getStatus(req: StatusRequest): Promise<StatusResponse> {
  return request<StatusResponse>({
    method: "GET",
    baseURL: API_AUTH,
    url: "/register_request/status",
    withToken: false,
    params: req,
  });
}
