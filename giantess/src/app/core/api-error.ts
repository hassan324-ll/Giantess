import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { throwError } from 'rxjs';

export function getHttpErrorMessage(error: unknown): string {
  if (error instanceof TimeoutError) {
    return 'The API server is taking too long to respond. Please check that Laravel is running and try again.';
  }

  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.errors) {
      return Object.values(error.error.errors)
        .flat()
        .filter(Boolean)
        .join(' ');
    }

    if (error.status === 0) {
      return 'Unable to reach the API server. Please check your network connection.';
    }

    return `Request failed with status ${error.status}.`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function apiErrorHandler(error: unknown) {
  return throwError(() => new Error(getHttpErrorMessage(error)));
}
