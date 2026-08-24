interface ApiRequest {
  url: string;
  method: string;
  headers: Readonly<Record<string, string>>;
  body?: unknown;
}

interface JsonResponse {
  response: Response;
  body: unknown;
}

const readResponseBody = async (response: Response): Promise<unknown> => {
  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    const responseBody: unknown = JSON.parse(responseText);
    return responseBody;
  } catch {
    return responseText;
  }
};

const logRequest = ({ url, method, headers, body }: ApiRequest): void => {
  if (__DEV__) {
    console.log(`[API Request] ${method} ${url}`, {
      headers,
      body,
    });
  }
};

const logResponse = ({
  request,
  response,
  body,
  durationMilliseconds,
}: {
  request: ApiRequest;
  response: Response;
  body: unknown;
  durationMilliseconds: number;
}): void => {
  if (__DEV__) {
    console.log(`[API Response] ${request.method} ${request.url}`, {
      status: response.status,
      durationMilliseconds,
      body,
    });
  }
};

const logNetworkError = ({
  request,
  error,
}: {
  request: ApiRequest;
  error: unknown;
}): void => {
  if (__DEV__) {
    console.log(`[API Network Error] ${request.method} ${request.url}`, {
      message: error instanceof Error ? error.message : "Unknown network error",
    });
  }
};

interface RequestExecution {
  request: ApiRequest;
  body?: BodyInit;
}

const executeRequest = async ({
  request,
  body: requestBody,
}: RequestExecution): Promise<JsonResponse> => {
  const startedAt = Date.now();
  logRequest(request);

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: requestBody,
    });
    const body = await readResponseBody(response);
    logResponse({
      request,
      response,
      body,
      durationMilliseconds: Date.now() - startedAt,
    });
    return { response, body };
  } catch (error: unknown) {
    logNetworkError({ request, error });
    throw error;
  }
};

export const executeJsonRequest = async (
  request: ApiRequest,
): Promise<JsonResponse> =>
  executeRequest({
    request,
    body:
      request.body === undefined ? undefined : JSON.stringify(request.body),
  });

export const executeMultipartRequest = async (
  request: ApiRequest & { body: FormData },
): Promise<JsonResponse> => executeRequest({ request, body: request.body });
