import { Request, Response, NextFunction } from "express"
import { ServiceDomainError } from "../errors/error.js";

export const globalErrorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (process.env["NODE_ENV"] !== "test") {
        console.error("Error:", err);
    }

    if (err.name === "UnauthorizedError") {
        res.status(401).json({
            error: "Access denied",
            message: err.message,
            code: "UNAUTHORIZED"
        });
        return;
    }

    if (err instanceof ServiceDomainError) {
        res.status(err.statusCode || 500).json({
            message: err.originalMessage,
            code: err.code
        });
        return;
    }

    if (errorCodes.has(err.code)) {
        res.status(503).json({
            error: "Service unavailable",
            message: "A downstream service is currently unavailable. Please try again later"
        });
        return;
    }

    res.status(500).json({
        error: "Internal Server Error",
        message: process.env["NODE_ENV"] === "production" ?
            "An unexpected error has occurred"
            :
            err.message
    });
}

const errorCodes: Set<string> = new Set([
    "ECONNREFUSED",
    "08006",
    "57P03"
]);
