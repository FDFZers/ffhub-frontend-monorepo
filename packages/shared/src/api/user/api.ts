import type { SearchInfo, SearchRequest, SearchResponse } from "../search/types.ts";
import type {
  RelationshipResponse,
  RelationListResponse,
  School,
  UserBanStatus,
  UserProfile,
  Visibilities,
} from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID, API_STUDENT_ID_INTERNAL } from "../types.ts";

// ---------------------------------------------------------------------------
// 资料
// ---------------------------------------------------------------------------

export function getMyProfile(): Promise<UserProfile> {
  return request<UserProfile>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/user/profile",
  });
}

export function getUserProfileByID(id: number): Promise<UserProfile> {
  return request<UserProfile>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: `/user/profile/id/${id}`,
  });
}

export function getUserProfileByUsername(username: string): Promise<UserProfile> {
  return request<UserProfile>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: `/user/profile/username/${encodeURIComponent(username)}`,
  });
}

export interface UpdateMyProfileRequest {
  nickname?: string;
  signature?: string;
  bio?: string;
  visibilities?: Partial<Visibilities>;
}

export interface UpdateUserProfileRequest extends UpdateMyProfileRequest {
  username?: string;
  real_name?: string;
  school?: School;
  student_num?: string;
}

export function updateMyProfile(body: UpdateMyProfileRequest): Promise<UserProfile> {
  return request<UserProfile>({
    method: "PATCH",
    baseURL: API_STUDENT_ID,
    url: "/user/profile",
    data: body,
  });
}

export function updateUserProfile(
  id: number,
  body: UpdateUserProfileRequest,
): Promise<UserProfile> {
  return request<UserProfile>({
    method: "PATCH",
    baseURL: API_STUDENT_ID,
    url: `/user/profile/id/${id}`,
    data: body,
  });
}

// ---------------------------------------------------------------------------
// 头像 / 背景图
// ---------------------------------------------------------------------------

export type ProfileImageKind = "avatar" | "banner";

function profileImagePath(kind: ProfileImageKind, userID?: number): string {
  return userID === undefined ? `/user/${kind}` : `/user/${kind}/${userID}`;
}

/** 供 <img> 使用的资料图片地址；接口需要登录，浏览器会携带 access_token Cookie。 */
export function profileImageURL(kind: ProfileImageKind, userID?: number): string {
  return new URL(profileImagePath(kind, userID).replace(/^\//, ""), API_STUDENT_ID).toString();
}

export async function uploadProfileImage(
  kind: ProfileImageKind,
  file: File,
  userID?: number,
): Promise<void> {
  const form = new FormData();
  form.append(kind, file);
  await request({
    method: "PUT",
    baseURL: API_STUDENT_ID,
    url: profileImagePath(kind, userID),
    data: form,
    timeout: 60_000,
  });
}

export async function deleteProfileImage(kind: ProfileImageKind, userID?: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID,
    url: profileImagePath(kind, userID),
  });
}

// ---------------------------------------------------------------------------
// 关注关系
// ---------------------------------------------------------------------------

export function getRelationship(userID: number): Promise<RelationshipResponse> {
  return request<RelationshipResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: `/user/relation/query/${userID}`,
  });
}

export function followUser(userID: number): Promise<RelationshipResponse> {
  return request<RelationshipResponse>({
    method: "POST",
    baseURL: API_STUDENT_ID,
    url: `/user/relation/follow/${userID}`,
  });
}

export function unfollowUser(userID: number): Promise<RelationshipResponse> {
  return request<RelationshipResponse>({
    method: "DELETE",
    baseURL: API_STUDENT_ID,
    url: `/user/relation/follow/${userID}`,
  });
}

export type RelationKind = "following" | "followers" | "friends";

export function getRelationCount(kind: RelationKind, userID?: number): Promise<{ count: number }> {
  return request<{ count: number }>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url:
      userID === undefined
        ? `/user/relation/count/${kind}`
        : `/user/relation/count/${kind}/${userID}`,
  });
}

export function getRelationList(
  kind: RelationKind,
  options: { userID?: number; limit?: number; offset?: number } = {},
): Promise<RelationListResponse> {
  const { userID, limit = 20, offset = 0 } = options;
  return request<RelationListResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url:
      userID === undefined
        ? `/user/relation/list/${kind}`
        : `/user/relation/list/${kind}/${userID}`,
    params: { limit, offset },
  });
}

// ---------------------------------------------------------------------------
// 用户搜索（需要 users.list 权限）
// ---------------------------------------------------------------------------

export function getUserSearchInfo(): Promise<SearchInfo> {
  return request<SearchInfo>({
    method: "GET",
    baseURL: API_STUDENT_ID,
    url: "/user/search/info",
  });
}

export function searchUsers(body: SearchRequest): Promise<SearchResponse<UserProfile>> {
  return request<SearchResponse<UserProfile>>({
    method: "POST",
    baseURL: API_STUDENT_ID,
    url: "/user/search/query",
    data: body,
  });
}

// ---------------------------------------------------------------------------
// 封禁 / 删除（管理员）
// ---------------------------------------------------------------------------

export function getUserBan(userID: number): Promise<UserBanStatus> {
  return request<UserBanStatus>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/user/ban/${userID}`,
  });
}

export interface BanUserRequest {
  reason: string;
  end_time?: string | null;
}

export async function banUser(userID: number, body: BanUserRequest): Promise<void> {
  await request({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/user/ban/${userID}`,
    data: body,
  });
}

export async function unbanUser(userID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/user/ban/${userID}`,
  });
}

export async function deleteUser(userID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `/security/profile/${userID}`,
  });
}
