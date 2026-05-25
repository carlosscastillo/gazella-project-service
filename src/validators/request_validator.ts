import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateBody = (schema: z.ZodType) => 
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: "Invalid Input",
                    details: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
                return;
            }
            return next(error);
        }
    };

export const validateParams = (schema: z.ZodType) => 
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedParams = await schema.parseAsync(req.params);
            req.params = parsedParams as any;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: "Invalid Input",
                    details: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
                return;
            }
            return next(error);
        }
    };

export const validateQuery = (schema: z.ZodType) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = await schema.parseAsync(req.query);
            (req as any).parsedQuery = parsed;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: "Invalid Input",
                    details: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
                return;
            }
            return next(error);
        }
    };