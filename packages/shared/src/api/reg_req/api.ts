import type { DateString } from "../../utils/types.ts";
import type { SearchInfo, SearchRequest, SearchResponse } from "../search/types.ts";
import type { RegisterRequest, RegisterRequestStatus } from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID, API_STUDENT_ID_INTERNAL } from "../types.ts";

// ---------------------------------------------------------------------------
// 公开状态查询
// ---------------------------------------------------------------------------

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
    baseURL: API_STUDENT_ID,
    url: "/register_request/status",
    withToken: false,
    params: req,
  });
}

// ---------------------------------------------------------------------------
// 管理员审核
// ---------------------------------------------------------------------------

export function getRegisterRequest(id: string): Promise<RegisterRequest> {
  return request<RegisterRequest>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/register_request/detail/${id}`,
  });
}

/** 佐证图片地址；接口需要登录，浏览器会携带 access_token Cookie。 */
export function registerProofImageURL(id: string): string {
  return new URL(`register_request/detail/${id}/proof_image`, API_STUDENT_ID_INTERNAL).toString();
}

export interface ReviewRegisterRequest {
  id: string;
  status: Exclude<RegisterRequestStatus, "pending">;
  comment: string;
}

export async function reviewRegisterRequest(body: ReviewRegisterRequest): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/register_request/review",
    data: body,
  });
}

export function getRegisterRequestSearchInfo(): Promise<SearchInfo> {
  return request<SearchInfo>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/register_request/search/info",
  });
}

export function searchRegisterRequests(
  body: SearchRequest,
): Promise<SearchResponse<RegisterRequest>> {
  return request<SearchResponse<RegisterRequest>>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/register_request/search/query",
    data: body,
  });
}
