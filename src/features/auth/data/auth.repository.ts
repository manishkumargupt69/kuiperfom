import type {
  AuthSession,
  CredentialsInput,
  OtpInput,
} from "@/src/features/auth/domain/auth.types";

export interface AuthRepository {
  loginWithCredentials(input: CredentialsInput): Promise<AuthSession>;
  loginWithOtp(input: OtpInput): Promise<AuthSession>;
  loginWithMpin(userId: string): Promise<AuthSession>;
  requestOtp(userId: string): Promise<void>;
}
