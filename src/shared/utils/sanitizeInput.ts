import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Regex to match Data URLs: data:[mime/type];base64,[data]
  const base64DataUrlRegex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,/;

  const sanitizeValue = (value: unknown): unknown => {
    // 1. Handle Strings
    if (typeof value === 'string') {
      // Skip DOMPurify if it's a Base64 Data URL or an extraordinarily long raw Base64 chunk
      if (
        base64DataUrlRegex.test(value) ||
        (value.length > 10000 && /^[a-zA-Z0-9+/=]+$/.test(value))
      ) {
        return value;
      }
      return DOMPurify.sanitize(value);
    }

    // 2. Handle Arrays
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item));
    }

    // 3. Handle Objects (create a copy to avoid unintended reference mutations)
    if (typeof value === 'object' && value !== null) {
      const objectValue = value as Record<string, unknown>;
      const sanitizedObj: Record<string, unknown> = {};

      for (const key in objectValue) {
        if (Object.prototype.hasOwnProperty.call(objectValue, key)) {
          sanitizedObj[key] = sanitizeValue(objectValue[key]);
        }
      }
      return sanitizedObj;
    }

    // 4. Pass through numbers, booleans, null, etc.
    return value;
  };

  // Safe mutation-based assignment to prevent Express getter crashes
  if (req.body) {
    req.body = sanitizeValue(req.body) as typeof req.body;
  }

  if (req.query) {
    const sanitizedQuery = sanitizeValue(req.query) as Record<string, unknown>;
    for (const key in sanitizedQuery) {
      if (Object.prototype.hasOwnProperty.call(sanitizedQuery, key)) {
        req.query[key] = sanitizedQuery[key] as any;
      }
    }
  }

  if (req.params) {
    const sanitizedParams = sanitizeValue(req.params) as Record<string, string>;
    for (const key in sanitizedParams) {
      if (Object.prototype.hasOwnProperty.call(sanitizedParams, key)) {
        req.params[key] = sanitizedParams[key];
      }
    }
  }

  next();
};
