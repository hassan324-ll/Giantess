import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, TimeoutError, timer } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';

const API_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

export function withRequestTimeout<T>(): MonoTypeOperatorFunction<T> {
  return timeout({ first: API_TIMEOUT_MS });
}

export function retryTransientErrors<T>(): MonoTypeOperatorFunction<T> {
  return retry({
    count: MAX_RETRIES,
    delay: (error: unknown, retryIndex) => {
      if (!isTransientError(error)) {
        throw error;
      }

      return timer(retryIndex * 350);
    },
  });
}

function isTransientError(error: unknown): boolean {
  if (error instanceof TimeoutError) {
    return true;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  return error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
}
