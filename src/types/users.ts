import { Permission } from "@/types/permissions";

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface UsersResponse {
  data: User[];
  total?: number;
}
