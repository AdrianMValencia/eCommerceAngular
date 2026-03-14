import { HttpErrorResponse } from '@angular/common/http';

import { BaseError, BaseResponse } from '../models/base-response.model';

export function mapBaseResponseErrorsToFieldMap(
  errors: BaseError[] | null | undefined
): Record<string, string[]> {
  if (!errors?.length) {
    return {};
  }

  return errors.reduce<Record<string, string[]>>((acc, current) => {
    const fieldKey = (current.propertyName ?? 'general').trim() || 'general';
    const message = (current.errorMessage ?? 'Error de validacion').trim();

    if (!acc[fieldKey]) {
      acc[fieldKey] = [];
    }

    acc[fieldKey].push(message);
    return acc;
  }, {});
}

export function mapBaseResponseErrorsToMessages(errors: BaseError[] | null | undefined): string[] {
  if (!errors?.length) {
    return [];
  }

  return errors
    .map((errorItem) => errorItem.errorMessage?.trim())
    .filter((message): message is string => Boolean(message));
}

export function resolveBusinessErrorMessage(
  response: BaseResponse<unknown> | null | undefined,
  fallback: string
): string {
  const messages = mapBaseResponseErrorsToMessages(response?.errors ?? null);
  return response?.message?.trim() || messages.join(' | ') || fallback;
}

export function toFriendlyApiError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const serverError = error.error as Partial<BaseResponse<unknown>>;
      const fieldMessages = mapBaseResponseErrorsToMessages(serverError.errors);

      if (fieldMessages.length > 0) {
        return fieldMessages.join(' | ');
      }

      if (serverError.message?.trim()) {
        return serverError.message;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
}
