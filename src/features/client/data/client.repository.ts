import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import { executeJsonRequest } from "@/src/utils/api-client";

const CLIENT_SEARCH_URL = "http://34.100.253.156/fom-api/client/search-client";

interface ClientDto {
  clientId: number;
  name: string;
  displayName: string;
  logo: string | null;
}

interface ClientSearchResponseDto {
  status: string;
  data: { data: ClientDto[] };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isClientDto = (value: unknown): value is ClientDto =>
  isRecord(value) &&
  typeof value.clientId === "number" &&
  typeof value.name === "string" &&
  typeof value.displayName === "string" &&
  (typeof value.logo === "string" || value.logo === null);

const isClientSearchResponseDto = (value: unknown): value is ClientSearchResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  Array.isArray(value.data.data) &&
  value.data.data.every(isClientDto);

export class ClientRepository {
  async getClientName(session: AuthSession, clientId: number): Promise<string | null> {
    const { response, body } = await executeJsonRequest({
      url: CLIENT_SEARCH_URL,
      method: "POST",
      headers: {
        ...createAuthenticatedHeaders(session),
        "Content-Type": "application/json",
      },
      body: { page: 1, limit: 1, filters: { clientId } },
    });

    if (!response.ok || !isClientSearchResponseDto(body) || body.status !== "success") {
      throw new Error("Client details could not be loaded.");
    }

    const client = body.data.data.find((item) => item.clientId === clientId);
    return client?.displayName || client?.name || null;
  }
}

export const clientRepository = new ClientRepository();
