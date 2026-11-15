/** 与 backend internal/service/search/model.go 对应的搜索请求/响应类型。 */

export type MatchMethod = "contains" | "exact" | "prefix" | "suffix" | "fuzzy" | "regex";
export type SortOrder = "asc" | "desc";

export interface SearchInfo {
  fields: string[];
  match_methods: MatchMethod[];
  sortable_fields: string[];
  tags: Record<string, string[]>;
}

export interface SearchTagSelection {
  include?: string[];
  exclude?: string[];
}

export interface SearchRequest {
  query?: string;
  limit?: number;
  offset?: number;
  fields?: string[];
  sort_by?: string;
  sort_order?: SortOrder;
  match_method?: MatchMethod;
  case_sensitive?: boolean;
  tags?: Record<string, SearchTagSelection>;
}

export interface SearchResponse<T> {
  count: number;
  data: T[];
}
