export type ModuleKey = "work-assigned" | "incidents";

export interface ModuleDto {
  key: ModuleKey;
  title: string;
  description: string;
  permissionCode: string;
  displayOrder: number;
}

export interface PermissionDto {
  code: string;
  canView: boolean;
}

export interface ModuleViewModel {
  key: ModuleKey;
  title: string;
  description: string;
  sequenceLabel: string;
}
