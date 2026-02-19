"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.ApiError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
// Кастомный класс для ошибок API
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
// Middleware для обработки ошибок
const errorHandler = (err, _req, res, _next) => {
    logger_1.default.error(err, "Unhandled error occurred");
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
exports.errorHandler = errorHandler;
// Middleware для обработки 404 (не найдено)
const notFoundHandler = (_req, res, _next) => {
    res.status(404).json({
        error: "Endpoint not found",
        statusCode: 404
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map