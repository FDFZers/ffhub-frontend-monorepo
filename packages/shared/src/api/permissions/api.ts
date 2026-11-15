import type { SearchInfo, SearchRequest, SearchResponse } from "../search/types.ts";
import type {
  PermissionDefinition,
  PermissionImpliesResponse,
  PermissionReloadStatus,
  UserGrant,
  UserGroup,
  UserGroupMember,
} from "./types.ts";

import { request } from "../api.ts";
import { API_STUDENT_ID_INTERNAL } from "../types.ts";

function appBase(appID: number): string {
  return `/permissions/${appID}`;
}

function groupBase(appID: number, groupID: number): string {
  return `${appBase(appID)}/groups/${groupID}`;
}

// ---------------------------------------------------------------------------
// 权限定义
// ---------------------------------------------------------------------------

export function getPermissionSearchInfo(appID?: number): Promise<SearchInfo> {
  return request<SearchInfo>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url:
      appID === undefined
        ? "/permissions/definitions/search/info"
        : `${appBase(appID)}/definitions/search/info`,
  });
}

export function searchPermissionDefinitions(
  body: SearchRequest,
  appID?: number,
): Promise<SearchResponse<PermissionDefinition>> {
  return request<SearchResponse<PermissionDefinition>>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url:
      appID === undefined
        ? "/permissions/definitions/search/query"
        : `${appBase(appID)}/definitions/search/query`,
    data: body,
  });
}

export interface CreatePermissionRequest {
  permission: string;
  description: string;
  requestable: boolean;
}

export function createPermission(
  appID: number,
  body: CreatePermissionRequest,
): Promise<PermissionDefinition> {
  return request<PermissionDefinition>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/definitions`,
    data: body,
  });
}

export interface UpdatePermissionRequest {
  description?: string;
  requestable?: boolean;
}

export function updatePermission(
  appID: number,
  permissionID: number,
  body: UpdatePermissionRequest,
): Promise<PermissionDefinition> {
  return request<PermissionDefinition>({
    method: "PATCH",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/definitions/${permissionID}`,
    data: body,
  });
}

export async function deletePermission(appID: number, permissionID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/definitions/${permissionID}`,
  });
}

export function getPermissionImplies(
  appID: number,
  permissionID: number,
): Promise<PermissionImpliesResponse> {
  return request<PermissionImpliesResponse>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/definitions/${permissionID}/implies`,
  });
}

export function setPermissionImplies(
  appID: number,
  permissionID: number,
  implies: string[],
): Promise<PermissionImpliesResponse> {
  return request<PermissionImpliesResponse>({
    method: "PUT",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/definitions/${permissionID}/implies`,
    data: { implies },
  });
}

// ---------------------------------------------------------------------------
// 用户组
// ---------------------------------------------------------------------------

export function getUserGroupSearchInfo(appID?: number): Promise<SearchInfo> {
  return request<SearchInfo>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url:
      appID === undefined
        ? "/permissions/groups/search/info"
        : `${appBase(appID)}/groups/search/info`,
  });
}

export function searchUserGroups(
  body: SearchRequest,
  appID?: number,
): Promise<SearchResponse<UserGroup>> {
  return request<SearchResponse<UserGroup>>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url:
      appID === undefined
        ? "/permissions/groups/search/query"
        : `${appBase(appID)}/groups/search/query`,
    data: body,
  });
}

export interface CreateUserGroupRequest {
  name: string;
  note: string;
  public: boolean;
}

export function createUserGroup(appID: number, body: CreateUserGroupRequest): Promise<UserGroup> {
  return request<UserGroup>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/groups`,
    data: body,
  });
}

export function getUserGroup(appID: number, groupID: number): Promise<UserGroup> {
  return request<UserGroup>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: groupBase(appID, groupID),
  });
}

export interface UpdateUserGroupRequest {
  name?: string;
  note?: string;
  public?: boolean;
}

export function updateUserGroup(
  appID: number,
  groupID: number,
  body: UpdateUserGroupRequest,
): Promise<UserGroup> {
  return request<UserGroup>({
    method: "PATCH",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: groupBase(appID, groupID),
    data: body,
  });
}

export async function deleteUserGroup(appID: number, groupID: number): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: groupBase(appID, groupID),
  });
}

export function listUserGroupPermissions(
  appID: number,
  groupID: number,
): Promise<SearchResponse<PermissionDefinition>> {
  return request<SearchResponse<PermissionDefinition>>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${groupBase(appID, groupID)}/permissions`,
  });
}

export function setUserGroupPermissions(
  appID: number,
  groupID: number,
  permissions: string[],
): Promise<SearchResponse<PermissionDefinition>> {
  return request<SearchResponse<PermissionDefinition>>({
    method: "PUT",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${groupBase(appID, groupID)}/permissions`,
    data: { permissions },
  });
}

export function addUserGroupPermissions(
  appID: number,
  groupID: number,
  permissions: string[],
): Promise<SearchResponse<PermissionDefinition>> {
  return request<SearchResponse<PermissionDefinition>>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${groupBase(appID, groupID)}/permissions`,
    data: { permissions },
  });
}

export function listUserGroupMembers(
  appID: number,
  groupID: number,
  options: { limit?: number; offset?: number } = {},
): Promise<SearchResponse<UserGroupMember>> {
  return request<SearchResponse<UserGroupMember>>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${groupBase(appID, groupID)}/users`,
    params: { limit: options.limit ?? 20, offset: options.offset ?? 0 },
  });
}

export interface GrantUserGroupMemberRequest {
  user_id: number;
  valid_from?: string | null;
  valid_until?: string | null;
}

export function grantUserGroupMember(
  appID: number,
  groupID: number,
  body: GrantUserGroupMemberRequest,
): Promise<{ data: UserGroupMember }> {
  return request<{ data: UserGroupMember }>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${groupBase(appID, groupID)}/users`,
    data: body,
  });
}

export async function revokeUserGroupMember(
  appID: number,
  groupID: number,
  userID: number,
): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${groupBase(appID, groupID)}/users/${userID}`,
  });
}

// ---------------------------------------------------------------------------
// 用户直接授权
// ---------------------------------------------------------------------------

export function listUserGrants(
  appID: number,
  userID: number,
  options: { limit?: number; offset?: number } = {},
): Promise<SearchResponse<UserGrant>> {
  return request<SearchResponse<UserGrant>>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/users/${userID}/grants`,
    params: { limit: options.limit ?? 20, offset: options.offset ?? 0 },
  });
}

export interface GrantUserRequest {
  permission: string;
  valid_from?: string | null;
  valid_until?: string | null;
  note?: string;
}

export function grantUser(
  appID: number,
  userID: number,
  body: GrantUserRequest,
): Promise<UserGrant> {
  return request<UserGrant>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/users/${userID}/grants`,
    data: body,
  });
}

export async function revokeUserGrant(
  appID: number,
  userID: number,
  permission: string,
): Promise<void> {
  await request({
    method: "DELETE",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/users/${userID}/grants`,
    params: { permission },
  });
}

export function getEffectivePermissions(
  appID: number,
  userID: number,
): Promise<{ count: number; permissions: string[] }> {
  return request<{ count: number; permissions: string[] }>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: `${appBase(appID)}/users/${userID}/effective`,
  });
}

// ---------------------------------------------------------------------------
// 权限目录重载
// ---------------------------------------------------------------------------

export function getReloadStatus(): Promise<PermissionReloadStatus> {
  return request<PermissionReloadStatus>({
    method: "GET",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/permissions/reload/status",
  });
}

export function reloadPermissions(): Promise<PermissionReloadStatus> {
  return request<PermissionReloadStatus>({
    method: "POST",
    baseURL: API_STUDENT_ID_INTERNAL,
    url: "/permissions/reload",
  });
}
