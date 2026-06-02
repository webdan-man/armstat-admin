export type Permission = {
  _id: string;
  key: string;
  description: string;
};

export interface PermissionsResponse {
  data: Permission[];
  total: number;
}
