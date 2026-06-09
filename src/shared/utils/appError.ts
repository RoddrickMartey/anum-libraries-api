// src/utils/appError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly meta: { [key: string]: string | boolean } | null;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    meta: { [key: string]: string | boolean } | null = null,
  ) {
    super(message);

    // FIX: Explicitly pass the current constructor instance to ensure
    // the prototype chain is correctly preserved in TypeScript compilation.
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.meta = meta;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
