export type AuthMode = "credentials" | "otp" | "mpin";

export interface CredentialsInput {
  userId: string;
  password: string;
}

export interface OtpInput {
  userId: string;
  otp: string;
}

export interface AuthenticatedUser {
  id: string;
  displayName: string;
  roleName: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface AuthSessionDto {
  accessToken: string;
  user: {
    id: string;
    displayName: string;
    roleName: string;
  };
}
