import type { AuthRepository } from "@/src/features/auth/data/auth.repository";
import type {
  AuthSession,
  AuthSessionDto,
  CredentialsInput,
  OtpInput,
} from "@/src/features/auth/domain/auth.types";

const MOCK_DELAY_MILLISECONDS = 450;

const waitForMockResponse = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MILLISECONDS);
  });
};

const mapSessionDtoToSession = (dto: AuthSessionDto): AuthSession => ({
  accessToken: dto.accessToken,
  user: {
    id: dto.user.id,
    displayName: dto.user.displayName,
    roleName: dto.user.roleName,
  },
});

const createMockSession = (userId: string): AuthSession => {
  const dto: AuthSessionDto = {
    accessToken: "development-session",
    user: {
      id: userId,
      displayName: "Field Operator",
      roleName: "Operations User",
    },
  };

  return mapSessionDtoToSession(dto);
};

export class MockAuthRepository implements AuthRepository {
  async loginWithCredentials(input: CredentialsInput): Promise<AuthSession> {
    await waitForMockResponse();
    return createMockSession(input.userId);
  }

  async loginWithOtp(input: OtpInput): Promise<AuthSession> {
    await waitForMockResponse();
    return createMockSession(input.userId);
  }

  async loginWithMpin(userId: string): Promise<AuthSession> {
    await waitForMockResponse();
    return createMockSession(userId);
  }

  async requestOtp(_userId: string): Promise<void> {
    await waitForMockResponse();
  }
}

export const authRepository: AuthRepository = new MockAuthRepository();
