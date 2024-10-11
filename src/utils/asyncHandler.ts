import { Request, Response, NextFunction } from "express";

/**
 * Async error handler for Express route handlers.
 * @param fn - The async function to wrap.
 * @returns A function that handles errors thrown in the async function.
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
