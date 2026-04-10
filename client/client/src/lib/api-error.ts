import { isAxiosError } from "axios";

type ApiErrorPayload = {
  message?: string;
  issues?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
    const fieldErrors = payload?.issues?.fieldErrors;
    const firstFieldMessage = fieldErrors
      ? Object.values(fieldErrors)
          .flat()
          .find((value): value is string => Boolean(value))
      : undefined;

    return firstFieldMessage ?? payload?.issues?.formErrors?.[0] ?? payload?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
