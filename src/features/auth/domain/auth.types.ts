export type AuthMode = "credentials" | "mpin";

export interface CredentialsInput {
  userId: string;
  password: string;
}

export type RememberedCredentials = CredentialsInput;

export interface AuthCompany {
  id: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  employeeCode: string | null;
  displayName: string;
  name: string;
  email: string;
  mobile: string;
  userId: string;
  hasMpin: boolean;
  lastLogin: string;
  roleId: string;
  branchId: string | null;
  company: readonly AuthCompany[];
}

export interface AuthRoleComponent {
  id: string;
  componentName: string;
  moduleName: string;
  componentType: string;
  description: string | null;
  routeLink: string | null;
  mobileRouteLink: string | null;
  icon: string | null;
  mobileIcon: string | null;
  orderNo: number;
  permissions: readonly string[];
  hasAccess: boolean;
  children: readonly AuthRoleComponent[];
}

export interface AuthSession {
  accessToken: string;
  roleComponents: readonly AuthRoleComponent[];
  user: AuthenticatedUser;
}

export type LoginRequestDto =
  | (CredentialsInput & { detail: true; mpin?: never })
  | { userId: string; mpin: string; detail: true; password?: never };

export interface LoginRoleComponentDto {
  id: string;
  componentName: string;
  moduleName: string;
  componentType: string;
  description: string | null;
  routeLink: string | null;
  mobileRouteLink: string | null;
  icon: string | null;
  mobileIcon: string | null;
  orderNo: number;
  permission: string[];
  hasAccess: boolean;
  children: LoginRoleComponentDto[];
}

export interface LoginUserDataDto {
  id: string;
  employee: {
    employeeCode: string;
  } | null;
  name: string;
  email: string;
  mobile: string;
  userId: string;
  hasMpin: boolean;
  lastLogin: string;
  defaultCompanyId: string;
  defaultCompanyName: string;
  defaultRoleId: string;
  defaultBranchId: string | null;
  defaultRole: {
    roleId: string;
    roleComponent: LoginRoleComponentDto[];
  };
}

export interface LoginResponseDto {
  status: string;
  message: string;
  data: {
    token: string;
    userData: LoginUserDataDto;
  };
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeMpinInput {
  oldMpin: string;
  oldMpinIv?: string;
  newMpin: string;
  newMpinIv?: string;
  iv?: string;
}

export interface SetMpinInput {
  mobile: string;
  mpin: string;
  iv?: string;
}
