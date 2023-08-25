export const stringifyError = (error: unknown): string =>
  error instanceof Error ? error.toString() : JSON.stringify(error);
