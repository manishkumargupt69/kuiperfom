import type {
  AuthRoleComponent,
  AuthSession,
  ChangeMpinInput,
  ChangePasswordInput,
  CredentialsInput,
  LoginRequestDto,
  LoginRoleComponentDto,
  LoginResponseDto,
  SetMpinInput,
  ProfilePhotoFile,
  ProfilePhotoUploadResponseDto,
  UserProfileDetailsResponseDto,
} from "@/src/features/auth/domain/auth.types";
import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import { executeJsonRequest, executeMultipartRequest, getApiErrorMessage, isApiErrorResponse } from "@/src/utils/api-client";
import { appendFormDataFile } from "@/src/utils/append-form-data-file";

const API_BASE_URL = "http://34.100.253.156/fom-api";

const getProfilePhotoUrl = (path: string): string =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")}`;

const isUserProfileDetailsResponseDto = (value: unknown): value is UserProfileDetailsResponseDto =>
  isRecord(value) && value.status === "success" && isRecord(value.data) &&
  isRecord(value.data.data) && isNullableString(value.data.data.profilePic);

const isProfilePhotoUploadResponseDto = (value: unknown): value is ProfilePhotoUploadResponseDto =>
  isRecord(value) && value.status === "success" && isRecord(value.data) &&
  typeof value.data.gcsPath === "string" && typeof value.data.signedUrl === "string" &&
  typeof value.data.publicUrl === "string";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNullableString = (value: unknown): value is string | null =>
  typeof value === "string" || value === null;

function isLoginRoleComponentDto(
  value: unknown,
): value is LoginRoleComponentDto {
  if (!isRecord(value) || !Array.isArray(value.children)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.componentName === "string" &&
    typeof value.moduleName === "string" &&
    typeof value.componentType === "string" &&
    isNullableString(value.description) &&
    isNullableString(value.routeLink) &&
    isNullableString(value.mobileRouteLink) &&
    isNullableString(value.icon) &&
    isNullableString(value.mobileIcon) &&
    typeof value.orderNo === "number" &&
    isStringArray(value.permission) &&
    typeof value.hasAccess === "boolean" &&
    value.children.every(isLoginRoleComponentDto)
  );
}

const isLoginResponseDto = (value: unknown): value is LoginResponseDto => {
  if (!isRecord(value) || !isRecord(value.data)) {
    return false;
  }

  const { data } = value;
  if (!isRecord(data.userData)) {
    return false;
  }

  const { userData } = data;
  if (!isRecord(userData.defaultRole)) {
    return false;
  }

  const hasValidEmployee =
    userData.employee === null ||
    (isRecord(userData.employee) &&
      typeof userData.employee.employeeCode === "string");

  const { defaultRole } = userData;
  return (
    typeof value.status === "string" &&
    typeof value.message === "string" &&
    typeof data.token === "string" &&
    typeof userData.id === "string" &&
    typeof userData.clientId === "number" &&
    hasValidEmployee &&
    typeof userData.name === "string" &&
    typeof userData.email === "string" &&
    typeof userData.mobile === "string" &&
    typeof userData.userId === "string" &&
    typeof userData.hasMpin === "boolean" &&
    typeof userData.lastLogin === "string" &&
    typeof userData.defaultCompanyId === "string" &&
    typeof userData.defaultCompanyName === "string" &&
    typeof userData.defaultRoleId === "string" &&
    isNullableString(userData.defaultBranchId) &&
    typeof defaultRole.roleId === "string" &&
    Array.isArray(defaultRole.roleComponent) &&
    defaultRole.roleComponent.every(isLoginRoleComponentDto)
  );
};

const mapRoleComponent = (
  component: LoginRoleComponentDto,
): AuthRoleComponent => ({
  id: component.id,
  componentName: component.componentName,
  moduleName: component.moduleName,
  componentType: component.componentType,
  description: component.description,
  routeLink: component.routeLink,
  mobileRouteLink: component.mobileRouteLink,
  icon: component.icon,
  mobileIcon: component.mobileIcon,
  orderNo: component.orderNo,
  permissions: component.permission,
  hasAccess: component.hasAccess,
  children: component.children.map(mapRoleComponent),
});

const mapLoginResponseToSession = (response: LoginResponseDto): AuthSession => {
  const { userData } = response.data;
  return {
    accessToken: response.data.token,
    roleComponents: userData.defaultRole.roleComponent.map(mapRoleComponent),
    user: {
      id: userData.id,
      clientId: userData.clientId,
      employeeCode: userData.employee?.employeeCode ?? null,
      displayName: userData.name,
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      userId: userData.userId,
      hasMpin: userData.hasMpin,
      lastLogin: userData.lastLogin,
      roleId: userData.defaultRoleId,
      branchId: userData.defaultBranchId,
      company: [
        { id: userData.defaultCompanyId, name: userData.defaultCompanyName },
      ],
    },
  };
};

export class AuthRepository {
  async getProfilePhoto(session: AuthSession): Promise<string | null> {
    const { response, body } = await executeJsonRequest({
      url: `${API_BASE_URL}/user/details-user/${session.user.id}`,
      method: "POST",
      headers: { ...createAuthenticatedHeaders(session), "Content-Type": "application/json" },
      body: { select: { profilePic: true } },
    });
    if (!response.ok || !isUserProfileDetailsResponseDto(body)) {
      throw new Error(getApiErrorMessage(body, "Profile photo could not be loaded."));
    }
    return body.data.data.profilePic ? getProfilePhotoUrl(body.data.data.profilePic) : null;
  }

  async uploadProfilePhoto(session: AuthSession, file: ProfilePhotoFile): Promise<string> {
    const formData = new FormData();
    appendFormDataFile({ formData, fieldName: "file", file: { uri: file.uri, name: file.name, type: file.mimeType } });
    const { response, body } = await executeMultipartRequest({
      url: `${API_BASE_URL}/user/upload/${session.user.id}`,
      method: "PUT",
      headers: createAuthenticatedHeaders(session),
      body: formData,
    });
    if (!response.ok || !isProfilePhotoUploadResponseDto(body)) {
      throw new Error(getApiErrorMessage(body, "Profile photo could not be uploaded."));
    }
    return getProfilePhotoUrl(body.data.gcsPath);
  }

  async loginWithCredentials(input: CredentialsInput): Promise<AuthSession> {
    const requestBody: LoginRequestDto = { ...input, detail: true };
    return this.login(requestBody);
  }

  async loginWithMpin(userId: string, mpin: string): Promise<AuthSession> {
    const requestBody: LoginRequestDto = { userId, mpin, detail: true };
    return this.login(requestBody);
  }

  private async login(requestBody: LoginRequestDto): Promise<AuthSession> {
    const { response, body: responseBody } = await executeJsonRequest({
      url: API_BASE_URL + "/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    if (!response.ok || isApiErrorResponse(responseBody)) {
      throw new Error(
        getApiErrorMessage(responseBody, "Sign-in could not be completed."),
      );
    }
    console.log("LOGIN API RESPONSE:", JSON.stringify(responseBody, null, 2));
    if (!isLoginResponseDto(responseBody)) {
      throw new Error("The login response was incomplete.");
    }

    return mapLoginResponseToSession(responseBody);
  }

  async changePassword(
    session: AuthSession,
    input: ChangePasswordInput,
  ): Promise<void> {
    const { response, body: responseBody } = await executeJsonRequest({
      url: API_BASE_URL + "/user/change-password",
      method: "POST",
      headers: {
        ...createAuthenticatedHeaders(session),
        "Content-Type": "application/json",
      },
      body: input,
    });
    if (response.ok && !isApiErrorResponse(responseBody)) {
      return;
    }

    throw new Error(
      getApiErrorMessage(responseBody, "Password could not be changed."),
    );
  }

  async setMpin(session: AuthSession, input: SetMpinInput): Promise<void> {
    const { response, body: responseBody } = await executeJsonRequest({
      url: API_BASE_URL + "/user/set-mpin",
      method: "POST",
      headers: {
        ...createAuthenticatedHeaders(session),
        "Content-Type": "application/json",
      },
      body: input,
    });
    if (response.ok && !isApiErrorResponse(responseBody)) {
      return;
    }

    throw new Error(getApiErrorMessage(responseBody, "MPIN could not be set."));
  }

  async changeMpin(
    session: AuthSession,
    input: ChangeMpinInput,
  ): Promise<void> {
    const { response, body: responseBody } = await executeJsonRequest({
      url: API_BASE_URL + "/user/change-mpin",
      method: "POST",
      headers: {
        ...createAuthenticatedHeaders(session),
        "Content-Type": "application/json",
      },
      body: input,
    });
    if (response.ok && !isApiErrorResponse(responseBody)) {
      return;
    }

    throw new Error(
      getApiErrorMessage(responseBody, "MPIN could not be changed."),
    );
  }
}

export const authRepository = new AuthRepository();
