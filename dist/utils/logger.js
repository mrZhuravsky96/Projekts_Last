"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/logger.ts
const pino_1 = __importDefault(require("pino"));
// Создаём логгер с настройками
const logger = (0, pino_1.default)({
    // Уровень логирования: 
    // 'info' - показывать info, warn, error (но не debug)
    // 'debug' - показывать всё включая debug
    level: process.env.LOG_LEVEL || "info",
    // Добавляем время к каждому логу
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    // В разработке делаем красивый вывод
    // В production - компактный JSON (удобно для анализа)
    transport: process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
                colorize: true, // Цветной вывод
                translateTime: "yyyy-mm-dd HH:MM:ss", // Читаемое время
                ignore: "pid,hostname", // Не показывать pid и hostname
            },
        }
        : undefined, // В production - просто JSON
});
exports.default = logger;
//# sourceMappingURL=logger.js.map