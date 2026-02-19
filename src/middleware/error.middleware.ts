// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";


// Кастомный класс для ошибок API
export class ApiError extends Error {
    statusCode: number;
    
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

// Middleware для обработки ошибок
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    logger.error(err, "Unhandled error occurred");


    // Если это наша кастомная ошибка API
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode
        });
    }

    // Ошибки PostgreSQL
    if (err.message?.includes("unique constraint")) {
        return res.status(409).json({
            error: "Resource already exists",
            statusCode: 409
        });
    }

    if (err.message?.includes("foreign key constraint")) {
        return res.status(400).json({
            error: "Referenced resource does not exist",
            statusCode: 400
        });
    }

    // Все остальные ошибки (500 Internal Server Error)
    return res.status(500).json({
        error: process.env.NODE_ENV === "production" 
            ? "Internal server error" 
            : err.message,
        statusCode: 500
    });
};

// Middleware для обработки 404 (не найдено)
export const notFoundHandler = (
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    res.status(404).json({
        error: "Endpoint not found",
        statusCode: 404
    });
};
