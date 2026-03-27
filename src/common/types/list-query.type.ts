export type SortOrder = 'asc' | 'desc';

export interface ListQuery<SortBy extends string = string> {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}
